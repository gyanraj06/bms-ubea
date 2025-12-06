import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

// Public GET - Fetch active rooms for customers
// Supports optional date filtering via query params: check_in, check_out
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const room_type = searchParams.get('room_type');
    const check_in = searchParams.get('check_in');
    const check_out = searchParams.get('check_out');

    // If dates are provided, filter by availability
    if (check_in && check_out) {
      // Validate dates
      const checkInDate = new Date(check_in);
      const checkOutDate = new Date(check_out);

      if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
        return NextResponse.json(
          { success: false, error: 'Invalid date format' },
          { status: 400 }
        );
      }

      if (checkOutDate <= checkInDate) {
        return NextResponse.json(
          { success: false, error: 'Check-out must be after check-in' },
          { status: 400 }
        );
      }

      // Find overlapping bookings
      // IMPORTANT: Check all status variations (both capitalized and lowercase)
      const { data: overlappingBookings, error: bookingError } = await supabaseAdmin
        .from('bookings')
        .select('room_id')
        .lt('check_in', check_out)
        .gt('check_out', check_in)
        .in('status', ['Confirmed', 'Pending', 'confirmed', 'pending', 'verification_pending']);

      if (bookingError) {
        console.error('Error fetching bookings:', bookingError);
        return NextResponse.json(
          { success: false, error: 'Failed to check availability' },
          { status: 500 }
        );
      }

      const bookedRoomIds = overlappingBookings?.map((b) => b.room_id) || [];

      // Build query for available rooms
      let query = supabase
        .from('rooms')
        .select('*')
        .eq('is_active', true)
        .eq('is_available', true);

      if (room_type) {
        query = query.eq('room_type', room_type);
      }

      if (bookedRoomIds.length > 0) {
        query = query.not('id', 'in', `(${bookedRoomIds.join(',')})`);
      }

      query = query.order('base_price', { ascending: true });

      const { data: rooms, error } = await query;

      if (error) {
        console.error('Error fetching rooms:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to fetch rooms' },
          { status: 500 }
        );
      }

      // Note: We intentionally do NOT filter by num_guests here anymore.
      // Users may want to book multiple rooms if their group is large.
      // Frontend will handle warnings/suggestions.
      const filteredRooms = rooms || [];

      return NextResponse.json({
        success: true,
        rooms: filteredRooms,
        filtered_by_dates: true,
        check_in,
        check_out,
      });
    }

    // Default behavior: return all active rooms (no date filtering)
    let query = supabase
      .from('rooms')
      .select('*')
      .eq('is_active', true)
      .eq('is_available', true)
      .order('base_price', { ascending: true });

    if (room_type) {
      query = query.eq('room_type', room_type);
    }

    const { data: rooms, error } = await query;

    if (error) {
      console.error('Error fetching rooms:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch rooms' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      rooms: rooms || [],
    });
  } catch (error: any) {
    console.error('GET rooms error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}
