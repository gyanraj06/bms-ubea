import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { easebuzz } from "@/lib/easebuzz";

export async function POST(request: Request) {
  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
    }

    // 1. Auth Check
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Capture booking to verify ownership or admin
    // For now assuming user owns it
    // Or we can just use the payment record query with user_id check

    // 2. Find Payment Record
    const { data: payment } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("booking_id", bookingId)
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // 3. Call Easebuzz Status
    const result = await easebuzz.checkPaymentStatus(payment.transaction_id);

    // 4. Update DB
    if (result.status === true && result.msg !== "Record not found") {
      // Easebuzz API structure?
      // Usually result.data or result.msg.
      // V1 Retrieve response: { status: 1, data: { status: "success", ... } }

      const data = result.data || result;
      // Depending on API version, check data.

      const gatewayStatus = data.status; // success, failure, userCancelled...

      const finalStatus = gatewayStatus === "success" ? "completed" : "failed";

      if (payment.status !== finalStatus) {
        await supabaseAdmin
          .from("payments")
          .update({
            status: finalStatus,
            gateway_response: result,
            processed_at: new Date().toISOString(),
          })
          .eq("id", payment.id);

        // Update Log
        await supabaseAdmin.from("payment_logs").insert({
          payment_id: payment.id,
          booking_id: bookingId,
          event_type: "STATUS_CHECK",
          status: finalStatus,
          response_payload: result,
        });

        if (finalStatus === "completed") {
          await supabaseAdmin
            .from("bookings")
            .update({
              status: "confirmed",
              payment_status: "paid",
              balance_amount: 0,
              advance_paid: payment.amount,
            })
            .eq("id", bookingId);
        }
      }

      return NextResponse.json({ status: finalStatus, raw: result });
    } else {
      return NextResponse.json({
        status: payment.status,
        message: "Could not fetch status from gateway",
      });
    }
  } catch (err: any) {
    console.error("Status check error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
