import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, supabase } from '@/lib/supabase';

/**
 * POST /api/bookings
 * Create a new booking (requires authentication)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify user is logged in
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Please login to book a room' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify Supabase token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token. Please login again' },
        { status: 401 }
      );
    }

    const userId = user.id;

    const body = await request.json();
    const {
      room_id,
      check_in,
      check_out,
      num_guests,
      num_adults,
      num_children,
      special_requests,
      advance_percentage, // 25, 50, or 100
    } = body;

    // Get user details
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('full_name, email, phone')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Validation
    if (!room_id) {
      return NextResponse.json(
        { success: false, error: 'Room is required' },
        { status: 400 }
      );
    }

    if (!check_in || !check_out) {
      return NextResponse.json(
        { success: false, error: 'Check-in and check-out dates are required' },
        { status: 400 }
      );
    }

    // Get room details
    const { data: room, error: roomError } = await supabaseAdmin
      .from('rooms')
      .select('*')
      .eq('id', room_id)
      .single();

    if (roomError || !room) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      );
    }

    if (!room.is_available) {
      return NextResponse.json(
        { success: false, error: 'Room is not available' },
        { status: 400 }
      );
    }

    // Calculate total nights
    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);
    const totalNights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

    // ✅ NEW: Check for overlapping bookings before creating the booking
    const { data: overlappingBookings, error: overlapError } = await supabaseAdmin
      .from('bookings')
      .select('id, booking_number, check_in, check_out')
      .eq('room_id', room_id)
      .lt('check_in', check_out)
      .gt('check_out', check_in)
      .in('status', ['Confirmed', 'Pending']);

    if (overlapError) {
      console.error('Error checking overlapping bookings:', overlapError);
      return NextResponse.json(
        { success: false, error: 'Failed to verify room availability' },
        { status: 500 }
      );
    }

    if (overlappingBookings && overlappingBookings.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'This room is already booked for the selected dates',
          code: 'ROOM_UNAVAILABLE',
          conflicting_bookings: overlappingBookings.map(b => ({
            booking_number: b.booking_number,
            check_in: b.check_in,
            check_out: b.check_out,
          })),
        },
        { status: 409 }
      );
    }

    if (totalNights <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid date range' },
        { status: 400 }
      );
    }

    // Calculate pricing
    const roomCharges = room.base_price * totalNights;
    const gstAmount = roomCharges * 0.12; // 12% GST
    const totalAmount = roomCharges + gstAmount;

    // Calculate advance payment
    const advancePaid = totalAmount * ((advance_percentage || 100) / 100);
    const balanceAmount = totalAmount - advancePaid;

    // Generate booking number
    const bookingNumber = `BK${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    // Create booking
    const { data: newBooking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert({
        booking_number: bookingNumber,
        user_id: userId,
        room_id,
        guest_name: userData.full_name,
        guest_email: userData.email,
        guest_phone: userData.phone,
        check_in: checkInDate.toISOString().split('T')[0],
        check_out: checkOutDate.toISOString().split('T')[0],
        total_nights: totalNights,
        num_guests: num_guests || 1,
        num_adults: num_adults || num_guests || 1,
        num_children: num_children || 0,
        room_charges: roomCharges,
        gst_amount: gstAmount,
        total_amount: totalAmount,
        advance_paid: advancePaid,
        balance_amount: balanceAmount,
        special_requests: special_requests || '',
        status: 'confirmed',
        payment_status: advance_percentage === 100 ? 'paid' : 'partial',
      })
      .select(`
        *,
        rooms:room_id (
          room_number,
          room_type,
          images
        )
      `)
      .single();

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      return NextResponse.json(
        { success: false, error: 'Failed to create booking', details: bookingError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Booking created successfully',
      booking: newBooking,
      booking_number: bookingNumber,
    }, { status: 201 });
  } catch (error: any) {
    console.error('POST booking error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
