import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";

/**
 * POST /api/admin/rooms/availability
 * Check room availability for given dates (Admin only, bypasses RLS)
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify Admin Token
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
    const { check_in, check_out } = body;

    if (!check_in || !check_out) {
      return NextResponse.json(
        { success: false, error: "check_in and check_out are required" },
        { status: 400 },
      );
    }

    // 2. Fetch all rooms that are marked available
    const { data: allRooms, error: roomsError } = await supabaseAdmin
      .from("rooms")
      .select("id, room_number, room_type, base_price")
      .eq("is_available", true);

    if (roomsError || !allRooms) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch rooms" },
        { status: 500 },
      );
    }

    // 3. Find overlapping bookings (using supabaseAdmin - bypasses RLS!)
    const { data: overlaps, error: overlapError } = await supabaseAdmin
      .from("bookings")
      .select("room_id")
      .lt("check_in", check_out)
      .gt("check_out", check_in)
      .in("status", ["confirmed", "paid", "pending", "checked-in"]);

    if (overlapError) {
      console.error("Overlap query error:", overlapError);
      return NextResponse.json(
        { success: false, error: "Failed to check bookings" },
        { status: 500 },
      );
    }

    // 4. Filter out blocked rooms
    const blockedIds = overlaps?.map((o) => o.room_id) || [];
    const availableRooms = allRooms.filter((r) => !blockedIds.includes(r.id));

    return NextResponse.json({
      success: true,
      rooms: availableRooms,
      blocked_count: blockedIds.length,
    });
  } catch (error: any) {
    console.error("Availability check error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
