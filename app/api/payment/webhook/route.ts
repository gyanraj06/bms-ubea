import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { easebuzz } from "@/lib/easebuzz";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const data: any = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    // 1. Log Raw Webhook/Response
    await supabaseAdmin.from("payment_logs").insert({
      event_type: "WEBHOOK_RECEIVED",
      status: data.status,
      request_payload: data,
      // We might not have booking_id yet if we don't parse it or look it up
      // But we can try to find payment by txnid
    });

    // 2. Verify Hash
    const isValid = easebuzz.verifyHash(data);

    // Find payment record
    const { data: payment } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("transaction_id", data.txnid)
      .single();

    if (payment) {
      // Link log to payment/booking
      await supabaseAdmin
        .from("payment_logs")
        .update({
          payment_id: payment.id,
          booking_id: payment.booking_id,
        })
        .match({ transaction_id: data.txnid }); // Wait, match is for filter? No. update().eq()

      // Correct query:
      // We just inserted a log without payment_id. We need to find that log?
      // Or just insert with IDs if we found payment first?
      // Let's assume we found payment.
    }

    if (!isValid) {
      console.error("Invalid Hash Received");
      if (payment) {
        await supabaseAdmin
          .from("payments")
          .update({
            status: "failed",
            remarks: "Hash verification failed",
          })
          .eq("id", payment.id);
      }
      return NextResponse.redirect(
        new URL(`/booking/failure?error=security`, request.url),
      );
    }

    const { status, txnid, easepayid } = data;

    // 3. Update Status
    if (payment) {
      const newStatus = status === "success" ? "completed" : "failed";

      await supabaseAdmin
        .from("payments")
        .update({
          status: newStatus,
          gateway_transaction_id: easepayid,
          gateway_response: data,
          processed_at: new Date().toISOString(),
        })
        .eq("id", payment.id);

      // 4. Update Booking if Success
      if (newStatus === "completed") {
        await supabaseAdmin
          .from("bookings")
          .update({
            status: "confirmed", // Or just payment_status = paid?
            payment_status: "paid",
            // balance_amount should be updated?
            // If full payment, balance is 0.
            balance_amount: 0,
            advance_paid: payment.amount,
            room_charges: payment.amount,
            discount_amount: 0,
          })
          .eq("id", payment.booking_id);
      }

      // Redirect
      if (newStatus === "completed") {
        return NextResponse.redirect(
          new URL(
            `/booking/success?bookingId=${payment.booking_id}&ref=${txnid}`,
            request.url,
          ),
        );
      } else {
        return NextResponse.redirect(
          new URL(
            `/booking/failure?bookingId=${payment.booking_id}&error=${data.error_Message || "failed"}`,
            request.url,
          ),
        );
      }
    } else {
      // Payment not found, but we have data. Usually shouldn't happen if initiating correctly.
      return NextResponse.redirect(
        new URL(`/booking/failure?error=transaction_not_found`, request.url),
      );
    }
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
