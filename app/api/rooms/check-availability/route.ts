import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

/**
 * POST /api/rooms/check-availability
 * Check which rooms are available for a given date range
 * Public endpoint - no authentication required
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { check_in, check_out, room_type, num_guests, num_rooms } = body;

    // Validate input
    if (!check_in || !check_out) {
      return NextResponse.json(
        {
          success: false,
          error: 'Check-in and check-out dates are required',
        },
        { status: 400 }
      );
    }

    // Parse dates
    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);

    // Validate dates
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid date format. Use ISO date format (YYYY-MM-DD)',
        },
        { status: 400 }
      );
    }

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Check-out date must be after check-in date',
        },
        { status: 400 }
      );
    }

    // Check if check-in is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (checkInDate < today) {
      return NextResponse.json(
        {
          success: false,
          error: 'Check-in date cannot be in the past',
        },
        { status: 400 }
      );
    }

    // Find all bookings that overlap with the requested date range
    // Overlap condition: existing booking's check_in < new check_out AND existing booking's check_out > new check_in
    const { data: overlappingBookings, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select('room_id')
      .lt('check_in', check_out) // booking starts before requested check-out
      .gt('check_out', check_in) // booking ends after requested check-in
      .in('status', ['Confirmed', 'Pending']); // Only consider active bookings

    if (bookingError) {
      console.error('Error fetching bookings:', bookingError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to check room availability',
          details: bookingError.message,
        },
        { status: 500 }
      );
    }

    // Extract booked room IDs
    const bookedRoomIds = overlappingBookings?.map((booking) => booking.room_id) || [];

    // Build query for available rooms
    let query = supabase
      .from('rooms')
      .select('*')
      .eq('is_active', true)
      .eq('is_available', true);

    // Filter by room type if provided
    if (room_type) {
      query = query.eq('room_type', room_type);
    }

    // Exclude booked rooms
    if (bookedRoomIds.length > 0) {
      query = query.not('id', 'in', `(${bookedRoomIds.join(',')})`);
    }

    query = query.order('base_price', { ascending: true });

    const { data: availableRooms, error: roomsError } = await query;

    if (roomsError) {
      console.error('Error fetching rooms:', roomsError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch available rooms',
          details: roomsError.message,
        },
        { status: 500 }
      );
    }

    // Calculate number of nights
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // Check guest capacity if num_guests provided
    let roomsMatchingGuestCapacity = availableRooms || [];
    if (num_guests && num_guests > 0) {
      roomsMatchingGuestCapacity = availableRooms?.filter(room => room.max_guests >= num_guests) || [];
    }

    // Check if we need multiple rooms
    const requestedRooms = num_rooms || 1;
    const hasEnoughRooms = roomsMatchingGuestCapacity.length >= requestedRooms;

    // Build appropriate message
    let message = '';
    let warning = '';

    if (roomsMatchingGuestCapacity.length === 0 && availableRooms && availableRooms.length > 0) {
      // Rooms available but none fit the guest count
      const maxCapacity = Math.max(...availableRooms.map(r => r.max_guests));
      message = `No rooms available for ${num_guests} guest${num_guests === 1 ? '' : 's'}`;
      warning = `We have ${availableRooms.length} room${availableRooms.length === 1 ? '' : 's'} available, but they can accommodate maximum ${maxCapacity} guest${maxCapacity === 1 ? '' : 's'} each. Please reduce the number of guests or book multiple rooms.`;
    } else if (!hasEnoughRooms && requestedRooms > 1) {
      // Not enough rooms for the requested quantity
      message = `Only ${roomsMatchingGuestCapacity.length} room${roomsMatchingGuestCapacity.length === 1 ? '' : 's'} available`;
      warning = `You requested ${requestedRooms} rooms, but we only have ${roomsMatchingGuestCapacity.length} available for your dates. Please reduce the number of rooms or adjust your dates.`;
    } else if (roomsMatchingGuestCapacity.length > 0) {
      message = `${roomsMatchingGuestCapacity.length} room${roomsMatchingGuestCapacity.length === 1 ? '' : 's'} available for ${nights} night${nights === 1 ? '' : 's'}`;
      if (num_guests) {
        message += ` (${num_guests} guest${num_guests === 1 ? '' : 's'})`;
      }
    } else {
      message = 'No rooms available for the selected dates';
    }

    return NextResponse.json({
      success: roomsMatchingGuestCapacity.length > 0,
      available_rooms: roomsMatchingGuestCapacity,
      total_available: roomsMatchingGuestCapacity.length,
      booked_room_ids: bookedRoomIds,
      total_booked: bookedRoomIds.length,
      has_enough_rooms: hasEnoughRooms,
      requested_rooms: requestedRooms,
      search_criteria: {
        check_in,
        check_out,
        nights,
        room_type: room_type || 'All',
        num_guests: num_guests || 'Not specified',
        num_rooms: requestedRooms,
      },
      message,
      warning: warning || undefined,
    });
  } catch (error: any) {
    console.error('Check availability error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check room availability',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
