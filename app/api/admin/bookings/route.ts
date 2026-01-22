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

    // Filter by status if provided
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

    return NextResponse.json({ success: true, bookings: bookings || [] });
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
