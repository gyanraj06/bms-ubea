import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const target = request.nextUrl.searchParams.get("target"); // Old Number
    const mergeWith = request.nextUrl.searchParams.get("merge_with"); // New Number
    const secret = request.nextUrl.searchParams.get("secret");

    if (secret !== "fix_my_booking_please") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!target || !mergeWith) {
      return NextResponse.json(
        { error: "Target and MergeWith booking numbers required" },
        { status: 400 },
      );
    }

    // Update the booking number of the target to match the mergeWith booking number
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .update({ booking_number: mergeWith })
      .eq("booking_number", target)
      .select();

    if (error) {
      return NextResponse.json(
        { error: "Update failed", details: error },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `Merged booking ${target} into ${mergeWith}`,
      updated_rows: data?.length,
      data: data,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
