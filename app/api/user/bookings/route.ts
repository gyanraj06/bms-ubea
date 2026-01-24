import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, supabase } from "@/lib/supabase";

/**
 * GET /api/user/bookings
 * Get all bookings for the logged-in user
 */
export async function GET(request: NextRequest) {
  try {
    // Verify user is logged in
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Please login to view bookings" },
        { status: 401 },
      );
    }

    const token = authHeader.substring(7);

    // Verify Supabase token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Invalid token. Please login again" },
        { status: 401 },
      );
    }

    const userId = user.id;

    // Get all bookings for this user
    const { data: bookings, error: bookingsError } = await supabaseAdmin
      .from("bookings")
      .select(
        `
        *,
        rooms:room_id (
          id,
          room_number,
          room_type,
          images
        )
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (bookingsError) {
      console.error("Error fetching bookings:", bookingsError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch bookings" },
        { status: 500 },
      );
    }

    // Group bookings by booking_number
    const groupedBookingsMap = new Map();

    if (bookings) {
      bookings.forEach((booking) => {
        if (!groupedBookingsMap.has(booking.booking_number)) {
          // Initialize group with first booking's details
          groupedBookingsMap.set(booking.booking_number, {
            ...booking,
            // Override aggregates
            total_amount: 0,
            advance_paid: 0,
            room_charges: 0,
            gst_amount: 0,
            discount_amount: 0,
            // Create items array
            items: [],
          });
        }

        const group = groupedBookingsMap.get(booking.booking_number);

        // Sum up financial values
        group.total_amount += parseFloat(booking.total_amount || 0);
        group.advance_paid += parseFloat(booking.advance_paid || 0);
        group.room_charges += parseFloat(booking.room_charges || 0);
        group.gst_amount += parseFloat(booking.gst_amount || 0);
        group.discount_amount += parseFloat(booking.discount_amount || 0);

        // Add room to items list
        group.items.push({
          id: booking.id, // Individual booking ID
          room_id: booking.room_id,
          room: booking.rooms, // Nested room details
          status: booking.status,
          payment_status: booking.payment_status, // Keep individual status just in case
        });
      });
    }

    const groupedBookings = Array.from(groupedBookingsMap.values());

    return NextResponse.json({
      success: true,
      bookings: groupedBookings,
    });
  } catch (error: any) {
    console.error("GET user bookings error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
