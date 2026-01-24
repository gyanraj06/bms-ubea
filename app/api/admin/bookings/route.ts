import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";

/**
 * Verify admin token
 */
function verifyAdminAuth(request: NextRequest): {
  valid: boolean;
  role?: string;
  userId?: string;
  error?: string;
} {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { valid: false, error: "Missing or invalid authorization header" };
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded || decoded.type !== "admin") {
    return { valid: false, error: "Invalid or expired token" };
  }

  return { valid: true, role: decoded.role, userId: decoded.id };
}

/**
 * GET /api/admin/bookings
 * Fetch all bookings for admin (requires admin auth)
 */
export async function GET(request: NextRequest) {
  try {
    const auth = verifyAdminAuth(request);
    if (!auth.valid) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // 1. Fetch all bookings
    let query = supabaseAdmin
      .from("bookings")
      .select(
        `
        *,
        rooms:room_id (
          room_number,
          room_type,
          images
        ),
        users:user_id (
          email,
          full_name,
          phone
        ),
        payment_logs (
          transaction_id,
          status,
          created_at,
          data
        )
      `,
      )
      .order("created_at", { ascending: false });

    // Filter by status if provided (Partial filter: if any room in group has status, we might include, but here filtering rows)
    if (status) {
      query = query.eq("status", status);
    }

    const { data: bookings, error } = await query;

    if (error) {
      console.error("Error fetching bookings:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch bookings",
          details: error.message,
        },
        { status: 500 },
      );
    }

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ success: true, bookings: [] });
    }

    // 2. Extract IDs for Payment Log Lookup
    const bookingNumbers = Array.from(
      new Set(bookings.map((b) => b.booking_number).filter(Boolean)),
    );
    const bookingIds = bookings.map((b) => b.id);

    // 3. Fetch Payment Logs (Link via booking_number OR booking_id)
    // We'll fetch logs that match any of our booking numbers or IDs
    // Note: URL limit might be an issue for very large datasets, limiting to recent for now or handling chunks is better but complex.
    // Given the scale, we'll try to fetch logs that have booking_number matching.
    // Fallback: For old logs, we might miss them if we only check booking_number.
    // Correction: We should try to fetch logs where booking_number IN (...) OR booking_id IN (...)
    // Supersbase .or syntax: .or('booking_number.in.(...),booking_id.in.(...)')

    let paymentLogs: any[] = [];
    if (bookingNumbers.length > 0 || bookingIds.length > 0) {
      // To avoid URL too large, we might just split or fetch distinct if huge.
      // For now, assuming manageable size.
      const { data: logs, error: logError } = await supabaseAdmin
        .from("payment_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (logError) {
        console.error("[AdminAPI] Error fetching payment logs:", logError);
      } else {
        console.log(
          `[AdminAPI] Fetched ${logs?.length || 0} total payment logs from DB`,
        );
      }

      // Filtering in memory to avoid query complexity limits for now
      if (logs) {
        paymentLogs = logs.filter(
          (log) =>
            (log.booking_number &&
              bookingNumbers.includes(log.booking_number)) ||
            (log.booking_id && bookingIds.includes(log.booking_id)),
        );
      }
    }

    // 4. Group Bookings
    const groupedMap = new Map();

    bookings.forEach((booking) => {
      const bn = booking.booking_number;
      if (!groupedMap.has(bn)) {
        groupedMap.set(bn, {
          // Base details from the first booking encounter (usually latest due to sort)
          id: booking.id, // Primary ID for key (though UI should use booking_number)
          booking_number: bn,
          guest_name: booking.guest_name,
          guest_email: booking.guest_email,
          guest_phone: booking.guest_phone,
          guest_relation: booking.guest_relation,
          check_in: booking.check_in,
          check_out: booking.check_out,
          total_nights: booking.total_nights,
          num_guests: 0, // Sum later
          room_charges: 0, // Sum later
          gst_amount: 0, // Sum later
          total_amount: 0, // Sum later
          advance_paid: 0, // Sum later
          balance_amount: 0, // Sum later
          status: booking.status, // Aggregate status?
          payment_status: booking.payment_status, // Aggregate?
          special_requests: booking.special_requests,
          created_at: booking.created_at,
          users: booking.users,
          // Lists
          rooms: [], // Changed from single object to array
          payment_logs: [],
          items: [], // Full booking items
        });
      }

      const group = groupedMap.get(bn);

      // Aggregate Totals
      group.num_guests += Number(booking.num_guests || 0);
      group.room_charges += Number(booking.room_charges || 0);
      group.gst_amount += Number(booking.gst_amount || 0);
      group.total_amount += Number(booking.total_amount || 0);
      group.advance_paid += Number(booking.advance_paid || 0);
      group.balance_amount += Number(booking.balance_amount || 0);

      // Add Room Item
      if (booking.rooms) {
        group.rooms.push({
          ...booking.rooms,
          booking_id: booking.id, // Keep ref to specific booking row
          status: booking.status,
        });
      }

      group.items.push(booking);
    });

    console.log(
      `[AdminAPI] Grouped ${bookings.length} raw bookings into ${groupedMap.size} orders`,
    );

    // 5. Attach Payment Logs to Groups (Using booking_number ONLY)
    let linkedCount = 0;
    paymentLogs.forEach((log) => {
      if (log.booking_number && groupedMap.has(log.booking_number)) {
        groupedMap.get(log.booking_number).payment_logs.push(log);
        linkedCount++;
      }
    });

    console.log(
      `[AdminAPI] Linked ${linkedCount} payment logs to bookings via booking_number`,
    );

    const groupedBookings = Array.from(groupedMap.values());

    return NextResponse.json({ success: true, bookings: groupedBookings });
  } catch (error: any) {
    console.error("GET admin bookings error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/admin/bookings
 * Update booking status (requires admin auth)
 */
export async function PUT(request: NextRequest) {
  try {
    const auth = verifyAdminAuth(request);
    if (!auth.valid) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 401 },
      );
    }

    const body = await request.json();
    const {
      id,
      booking_status,
      status,
      payment_status,
      payment_method,
      notes,
      special_requests,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Booking ID is required" },
        { status: 400 },
      );
    }

    // Check if booking exists
    const { data: existingBooking } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("id", id)
      .single();

    if (!existingBooking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 },
      );
    }

    // Update booking
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Support both 'status' and 'booking_status' for backward compatibility
    if (booking_status) updateData.status = booking_status;
    if (status) updateData.status = status;
    if (payment_status) updateData.payment_status = payment_status;
    if (payment_method) updateData.payment_method = payment_method;
    // Support both 'notes' and 'special_requests' (notes is mapped to special_requests)
    if (notes !== undefined) updateData.special_requests = notes;
    if (special_requests !== undefined)
      updateData.special_requests = special_requests;

    const { data: updatedBooking, error } = await supabaseAdmin
      .from("bookings")
      .update(updateData)
      .eq("id", id)
      .select(
        `
        *,
        rooms:room_id (
          room_number,
          room_type,
          images
        )
      `,
      )
      .single();

    if (error) {
      console.error("Error updating booking:", error);
      return NextResponse.json(
        { success: false, error: "Failed to update booking" },
        { status: 500 },
      );
    }

    // Create audit log
    await supabaseAdmin.from("audit_logs").insert({
      user_id: auth.userId,
      action: "UPDATE",
      table_name: "bookings",
      record_id: id,
      new_data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Booking updated successfully",
      booking: updatedBooking,
    });
  } catch (error: any) {
    console.error("PUT admin booking error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
