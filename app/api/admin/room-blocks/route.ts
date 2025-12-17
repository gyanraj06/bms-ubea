import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * GET /api/admin/room-blocks
 * Get all room blocks or blocks for a specific room
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("room_id");

    let query = supabaseAdmin
      .from("room_blocks")
      .select(
        `
        *,
        rooms (
          room_number,
          room_type
        )
      `
      )
      .order("start_date", { ascending: false });

    if (roomId) {
      query = query.eq("room_id", roomId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching room blocks:", error);
      return NextResponse.json(
        { success: false, error: "Failed to fetch room blocks" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, blocks: data });
  } catch (error: any) {
    console.error("Get room blocks error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/room-blocks
 * Create a new room block
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { room_id, start_date, end_date, reason, notes, created_by } = body;

    // Validate required fields
    if (!room_id || !start_date || !end_date || !reason) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (endDate < startDate) {
      return NextResponse.json(
        { success: false, error: "End date must be after start date" },
        { status: 400 }
      );
    }

    // Check for overlapping blocks
    const { data: overlapping, error: overlapError } = await supabaseAdmin
      .from("room_blocks")
      .select("id")
      .eq("room_id", room_id)
      .lte("start_date", end_date)
      .gte("end_date", start_date);

    if (overlapError) {
      console.error("Error checking overlapping blocks:", overlapError);
      return NextResponse.json(
        { success: false, error: "Failed to check for overlapping blocks" },
        { status: 500 }
      );
    }

    if (overlapping && overlapping.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "This room already has a block for these dates",
        },
        { status: 400 }
      );
    }

    // Create the block
    const { data, error } = await supabaseAdmin
      .from("room_blocks")
      .insert({
        room_id,
        start_date,
        end_date,
        reason,
        notes,
        created_by,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating room block:", error);
      return NextResponse.json(
        { success: false, error: "Failed to create room block" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Room block created successfully",
      block: data,
    });
  } catch (error: any) {
    console.error("Create room block error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/room-blocks
 * Delete a room block
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Block ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("room_blocks")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting room block:", error);
      return NextResponse.json(
        { success: false, error: "Failed to delete room block" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Room block deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete room block error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
