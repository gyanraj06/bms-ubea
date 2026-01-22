import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { verifyToken } from "@/lib/auth"; // Assuming auth verification is needed

// Initialize Supabase client with service role for admin updates
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Helper to generate hash for Easebuzz API
function generateHash(key: string, txnid: string, salt: string): string {
  // Hash sequence: key|txnid|salt
  const hashString = `${key}|${txnid}|${salt}`;
  return crypto.createHash("sha512").update(hashString).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    // 1. Admin Authorization Check
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded || decoded.type !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { transaction_id, booking_id } = body; // accept booking_id if available to link if missing

    if (!transaction_id) {
      return NextResponse.json(
        { success: false, error: "Transaction ID is required" },
        { status: 400 },
      );
    }

    // 2. Prepare Easebuzz Request
    const EASEBUZZ_KEY = process.env.EASEBUZZ_KEY!;
    const EASEBUZZ_SALT = process.env.EASEBUZZ_SALT!;

    const EASEBUZZ_API_BASE = process.env.EASEBUZZ_TRANS_URL!;

    const API_URL = `${EASEBUZZ_API_BASE}/transaction/v2.1/retrieve`;

    const hash = generateHash(EASEBUZZ_KEY, transaction_id, EASEBUZZ_SALT);

    const payload = new URLSearchParams();
    payload.append("key", EASEBUZZ_KEY);
    payload.append("txnid", transaction_id);
    payload.append("hash", hash);

    // 3. Call Easebuzz API
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: payload,
    });

    const data = await response.json();

    if (!data.status || !data.msg) {
      return NextResponse.json(
        { success: false, error: "Invalid response from Payment Gateway" },
        { status: 502 },
      );
    }

    // "msg" can be an array of transactions or an object depending on API version/docs
    // The user sample shows "msg" as an ARRAY.
    let transactionData = null;
    if (Array.isArray(data.msg)) {
      transactionData = data.msg.find((t: any) => t.txnid === transaction_id);
    } else if (typeof data.msg === "object") {
      transactionData = data.msg;
    }

    if (!transactionData) {
      return NextResponse.json(
        { success: false, error: "Transaction not found in Gateway records" },
        { status: 404 },
      );
    }

    const gatewayStatus = transactionData.status; // 'success', 'failure', 'userCancelled', 'dropped', 'pending'
    const easepayid = transactionData.easepayid;
    const amount = transactionData.amount;
    const email = transactionData.email;

    // 4. Update Database (Replicating Callback Logic)

    // Map status
    let dbStatus = "FAILED";
    // Logic from callback:
    // status === "success" -> "PAID"
    // status === "dropped" || status === "pending" -> keep as is
    // else -> "FAILED"

    if (gatewayStatus === "success") {
      dbStatus = "PAID";
    } else if (gatewayStatus === "dropped" || gatewayStatus === "pending") {
      dbStatus = gatewayStatus;
    } else {
      dbStatus = "FAILED";
    }

    // A. Update Payment Log
    const updateLogData: any = {
      status: dbStatus,
      data: transactionData, // Update with full latest data
      response_payload: data,
      event_type: "STATUS_CHECK_MANUAL", // Distinguish from callback
      updated_at: new Date().toISOString(),
    };
    if (easepayid) updateLogData.easepay_id = easepayid;

    const { error: logError } = await supabase
      .from("payment_logs")
      .update(updateLogData)
      .eq("transaction_id", transaction_id);

    if (logError) {
      console.error("[Status Check] Failed to update payment_log:", logError);
    }

    // B. Update Booking Status
    // We need the booking_id. If not passed, fetch from payment_log
    let targetBookingId = booking_id;
    if (!targetBookingId) {
      const { data: logData } = await supabase
        .from("payment_logs")
        .select("booking_id")
        .eq("transaction_id", transaction_id)
        .single();
      targetBookingId = logData?.booking_id;
    }

    if (targetBookingId) {
      if (gatewayStatus === "success") {
        // Mark as CONFIRMED
        const { error: bookingError } = await supabase
          .from("bookings")
          .update({
            status: "confirmed",
            payment_status: "paid",
            advance_paid: parseFloat(amount) || 0,
          })
          .eq("id", targetBookingId);

        if (!bookingError) {
          console.log(`[Status Check] Booking ${targetBookingId} confirmed.`);
          // Ideally send email here if not already sent, but let's avoid duplicates for manual check unless requested.
          // The user only asked to "Update my Supabase database immediately".
        }
      } else if (gatewayStatus === "dropped" || gatewayStatus === "pending") {
        // Do NOTHING to booking status (keep as PENDING) - per user rule
      } else {
        // Mark as FAILED
        const { error: failError } = await supabase
          .from("bookings")
          .update({
            status: "failed",
            payment_status: "failed",
          })
          .eq("id", targetBookingId);

        if (!failError) {
        }
      }
    }

    return NextResponse.json({
      success: true,
      status: gatewayStatus,
      db_status: dbStatus,
      data: transactionData,
    });
  } catch (error: any) {
    console.error("[Status Check] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
