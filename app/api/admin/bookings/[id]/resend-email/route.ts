import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendPaymentVerifiedEmail } from "@/lib/email-service";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id;
    
    // Authorization check
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch booking details
    const { data: booking, error: fetchError } = await supabaseAdmin
      .from("bookings")
      .select(`
        *,
        rooms (
          room_type
        )
      `)
      .eq("id", bookingId)
      .single();

    if (fetchError || !booking) {
      console.error("Error fetching booking:", fetchError);
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Ensure booking is paid or failed before resending
    if (booking.payment_status !== 'paid' && booking.payment_status !== 'failed') {
      return NextResponse.json({ error: "Booking is not in a final state (paid/failed)" }, { status: 400 });
    }

    // Prepare email base data
    const emailData = {
      user_name: booking.guest_name,
      user_email: booking.guest_email,
      booking_reference: booking.booking_number,
      check_in_date: new Date(booking.check_in).toLocaleDateString(),
      check_out_date: new Date(booking.check_out).toLocaleDateString(),
      room_count: 1, 
      total_amount: booking.total_amount,
      website_url: process.env.NEXT_PUBLIC_APP_URL || 'https://happyholidays.com',
      payment_date: new Date().toLocaleDateString(), 
      amount_paid: booking.total_amount, 
    };

    let emailResult;
    
    // Select email type based on status
    if (booking.payment_status === 'paid') {
        const { sendPaymentVerifiedEmail } = await import("@/lib/email-service");
        emailResult = await sendPaymentVerifiedEmail(emailData);
    } else if (booking.payment_status === 'failed') {
        const { sendPaymentRejectedEmail } = await import("@/lib/email-service");
        emailResult = await sendPaymentRejectedEmail(emailData);
    }

    if (!emailResult || !emailResult.success) {
      console.error("Failed to resend email:", emailResult?.error);
      return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error resending email:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
