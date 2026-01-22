import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Generate unique transaction ID
function generateTxnId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `TXN${timestamp}${random}`.toUpperCase().substring(0, 40);
}

// Generate SHA512 hash
function generateHash(params: {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  salt: string;
}): string {
  // Hash sequence: key|txnid|amount|productinfo|firstname|email|||||||||||salt
  const hashString = `${params.key}|${params.txnid}|${params.amount}|${params.productinfo}|${params.firstname}|${params.email}|||||||||||${params.salt}`;
  console.log("[Easebuzz] Hash String:", hashString);
  return crypto.createHash("sha512").update(hashString).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("=".repeat(60));
    console.log("[Easebuzz Initiate] INPUT RECEIVED:");
    console.log(JSON.stringify(body, null, 2));
    console.log("=".repeat(60));

    const { amount, firstname, email, phone, roomNumber, bookingId } = body;

    // Validate required fields
    if (!amount || !firstname || !email || !phone) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get environment variables
    const EASEBUZZ_KEY = process.env.EASEBUZZ_KEY;
    const EASEBUZZ_SALT = process.env.EASEBUZZ_SALT;
    const EASEBUZZ_URL = process.env.EASEBUZZ_URL;
    const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:3000";

    if (!EASEBUZZ_KEY || !EASEBUZZ_SALT || !EASEBUZZ_URL) {
      console.error("[Easebuzz] Missing environment variables");
      return NextResponse.json(
        { success: false, error: "Payment gateway not configured" },
        { status: 500 },
      );
    }

    // Generate unique transaction ID
    const txnid = generateTxnId();

    // Format amount to 2 decimal places
    const formattedAmount = parseFloat(amount).toFixed(2);

    // Product info
    const productinfo = "Room Booking";

    // Generate hash
    const hash = generateHash({
      key: EASEBUZZ_KEY,
      txnid,
      amount: formattedAmount,
      productinfo,
      firstname,
      email,
      salt: EASEBUZZ_SALT,
    });

    // Prepare payload
    const payload = new URLSearchParams();
    payload.append("key", EASEBUZZ_KEY);
    payload.append("txnid", txnid);
    payload.append("amount", formattedAmount);
    payload.append("productinfo", productinfo);
    payload.append("firstname", firstname);
    payload.append("phone", phone);
    payload.append("email", email);
    payload.append("surl", `${DOMAIN}/api/payment/callback`);
    payload.append("furl", `${DOMAIN}/api/payment/callback`);
    payload.append("hash", hash);

    console.log("=".repeat(60));
    console.log("[Easebuzz Initiate] PAYLOAD TO SEND:");
    console.log({
      key: EASEBUZZ_KEY,
      txnid,
      amount: formattedAmount,
      productinfo,
      firstname,
      phone,
      email,
      surl: `${DOMAIN}/api/payment/callback`,
      furl: `${DOMAIN}/api/payment/callback`,
      hash: hash.substring(0, 20) + "...",
    });
    console.log("=".repeat(60));

    // Call Easebuzz API
    const easebuzzResponse = await fetch(
      `${EASEBUZZ_URL}/payment/initiateLink`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: payload.toString(),
      },
    );

    const easebuzzData = await easebuzzResponse.json();

    console.log("=".repeat(60));
    console.log("[Easebuzz Initiate] RESPONSE FROM EASEBUZZ:");
    console.log(JSON.stringify(easebuzzData, null, 2));
    console.log("=".repeat(60));

    // ============================================
    // CHECKPOINT: Save to Supabase if status === 1
    // ============================================
    if (easebuzzData.status === 1) {
      console.log("[Easebuzz] Status 1 - Saving to payment_logs...");

      const { data: insertData, error: insertError } = await supabase
        .from("payment_logs")
        .insert({
          booking_id: bookingId || null,
          room_number: roomNumber || null,
          transaction_id: txnid,
          data: easebuzzData,
          firstname: firstname,
          phone: phone,
          status: "INITIATED",
          event_type: "INITIATE",
        })
        .select()
        .single();

      if (insertError) {
        console.error("[Easebuzz] Failed to save payment_log:", insertError);
      } else {
        console.log("[Easebuzz] Payment log saved:", insertData);
      }
    }

    // Construct payment URL if status is 1 and data exists
    let paymentUrl = null;
    if (easebuzzData.status === 1 && easebuzzData.data) {
      paymentUrl = `${EASEBUZZ_URL}/pay/${easebuzzData.data}`;
      console.log("[Easebuzz] Payment URL:", paymentUrl);
    }

    // Return response to frontend
    return NextResponse.json({
      success: true,
      txnid,
      status: easebuzzData.status,
      paymentUrl,
      easebuzzResponse: easebuzzData,
      debug: {
        inputReceived: body,
        payloadSent: {
          key: EASEBUZZ_KEY,
          txnid,
          amount: formattedAmount,
          productinfo,
          firstname,
          phone,
          email,
          surl: `${DOMAIN}/api/payment/callback`,
          furl: `${DOMAIN}/api/payment/callback`,
        },
      },
    });
  } catch (error) {
    console.error("[Easebuzz Initiate] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initiate payment" },
      { status: 500 },
    );
  }
}
