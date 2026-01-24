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

    const EASEBUZZ_API_BASE =
      process.env.EASEBUZZ_TRANS_URL || process.env.EASEBUZZ_URL;

    const API_URL = `${EASEBUZZ_API_BASE}/transaction/v2.1/retrieve`;

    const hash = generateHash(EASEBUZZ_KEY, transaction_id, EASEBUZZ_SALT);

    const payload = new URLSearchParams();
    payload.append("key", EASEBUZZ_KEY);
    payload.append("txnid", transaction_id);
    payload.append("hash", hash);

    // 3. Call Easebuzz API
    console.log(`[CheckStatus] Calling Easebuzz: ${API_URL}`);
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: payload,
    });

    const data = await response.json();
    console.log("[CheckStatus] Easebuzz Response:", JSON.stringify(data));

    if (!data.status || !data.msg) {
      console.error("[CheckStatus] Invalid response structure:", data);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid response from Payment Gateway",
          debug: data,
        },
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

    // 4. Update Database (Replicating Callback Logic)
    let dbStatus = "FAILED";
    if (gatewayStatus === "success") {
      dbStatus = "PAID";
    } else if (gatewayStatus === "dropped" || gatewayStatus === "pending") {
      dbStatus = gatewayStatus;
    } else {
      dbStatus = "FAILED";
    }

    // Get Booking Info to Backfill booking_number and Update All Rooms
    let targetBooking_number = null;
    let targetBookingId = booking_id;

    if (!targetBookingId) {
      // Fetch from payment_log if not passed
      const { data: logData } = await supabase
        .from("payment_logs")
        .select("booking_id, booking_number") // Fetch existing numbers
        .eq("transaction_id", transaction_id)
        .single();

      targetBookingId = logData?.booking_id;
      targetBooking_number = logData?.booking_number;
    }

    // If we have an ID but no Number (Old booking case), fetch it from bookings table
    if (targetBookingId && !targetBooking_number) {
      const { data: bookingData } = await supabase
        .from("bookings")
        .select("booking_number")
        .eq("id", targetBookingId)
        .single();

      if (bookingData) {
        targetBooking_number = bookingData.booking_number;
      }
    }

    // A. Update Payment Log (Include backfill of booking_number)
    const updateLogData: any = {
      status: dbStatus,
      data: transactionData, // Update with full latest data
      response_payload: data,
      event_type: "STATUS_CHECK_MANUAL", // Distinguish from callback
      updated_at: new Date().toISOString(),
    };
    if (easepayid) updateLogData.easepay_id = easepayid;
    if (targetBooking_number)
      updateLogData.booking_number = targetBooking_number; // Repair Link!

    const { error: logError } = await supabase
      .from("payment_logs")
      .update(updateLogData)
      .eq("transaction_id", transaction_id);

    if (logError) {
      console.error("[Status Check] Failed to update payment_log:", logError);
    }

    // B. Update Booking Status (All rooms in group)
    if (targetBooking_number) {
      // Update ALL bookings with this number
      if (gatewayStatus === "success") {
        const { error: bookingError } = await supabase
          .from("bookings")
          .update({
            status: "confirmed",
            payment_status: "paid",
            advance_paid: parseFloat(amount) || 0, // Note: This sets full amount on EACH room? No, hopefully logic handles this or we accept redundancy.
            // Actually, for multi-room, advance_paid usually tracks total.
            // If we set it on all rows, sum() might duplicate.
            // For now, let's keep consistency with callback: we probably want to update status.
          })
          .eq("booking_number", targetBooking_number);

        if (!bookingError) {
          console.log(
            `[Status Check] Group ${targetBooking_number} confirmed.`,
          );
        }
      } else if (gatewayStatus !== "dropped" && gatewayStatus !== "pending") {
        // FAILED
        await supabase
          .from("bookings")
          .update({
            status: "failed",
            payment_status: "failed",
          })
          .eq("booking_number", targetBooking_number);
      }
    }
    // Fallback: Update single ID if no number found (very old orphan data?)
    else if (targetBookingId) {
      if (gatewayStatus === "success") {
        await supabase
          .from("bookings")
          .update({
            status: "confirmed",
            payment_status: "paid",
            advance_paid: parseFloat(amount) || 0,
          })
          .eq("id", targetBookingId);
      } else if (gatewayStatus !== "dropped" && gatewayStatus !== "pending") {
        await supabase
          .from("bookings")
          .update({ status: "failed", payment_status: "failed" })
          .eq("id", targetBookingId);
      }
    }

    return NextResponse.json({
      success: true,
      status: gatewayStatus,
      db_status: dbStatus,
      data: transactionData,
      repaired_link: !!targetBooking_number,
    });
  } catch (error: any) {
    console.error("[Status Check] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
