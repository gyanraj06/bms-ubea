import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, supabase } from '@/lib/supabase';

import { verifyToken } from '@/lib/auth';
import jwt from 'jsonwebtoken';

export const runtime = 'nodejs';

/**
 * POST /api/bookings
 * Create a new booking (requires authentication)
 * Supports single or multiple room bookings
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

    const body = await request.json();
    const {
      check_in,
      check_out,
      bookings, // Array of { room_id, quantity }
      guest_details,
      special_requests,
      booking_for,
      // Legacy support
      room_id,
      num_guests,
    } = body;

    // Verify Supabase token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token. Please login again' },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Get user details
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('full_name, email, phone, role')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Normalize bookings input
    let bookingsToCreate: any[] = [];
    if (bookings && Array.isArray(bookings)) {
      bookingsToCreate = bookings;
    } else if (room_id) {
      bookingsToCreate = [{ room_id, quantity: 1 }];
    } else {
      return NextResponse.json(
        { success: false, error: 'No rooms selected' },
        { status: 400 }
      );
    }

    if (!check_in || !check_out) {
      return NextResponse.json(
        { success: false, error: 'Check-in and check-out dates are required' },
        { status: 400 }
      );
    }

    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);
    const totalNights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

    if (totalNights <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid date range' },
        { status: 400 }
      );
    }

    const createdBookings = [];
    const errors = [];

    // Process each booking item
    // Note: In a real production app, this should be a transaction.
    // Supabase JS client doesn't support transactions directly yet without RPC.
    // We will process sequentially and hope for the best for now.

    for (const item of bookingsToCreate) {
      const { room_id: targetRoomId, quantity = 1 } = item;

      // If quantity > 1, we need to find other available rooms of the same type
      // 1. Get the room type of the requested room
      const { data: targetRoom, error: roomError } = await supabaseAdmin
        .from('rooms')
        .select('*')
        .eq('id', targetRoomId)
        .single();

      if (roomError || !targetRoom) {
        errors.push(`Room ${targetRoomId} not found`);
        continue;
      }

      // 2. Find ALL available rooms of this type
      // We need to check availability for all rooms of this type
      const { data: allRoomsOfType, error: typeError } = await supabaseAdmin
        .from('rooms')
        .select('id, room_number, base_price, gst_percentage')
        .eq('room_type', targetRoom.room_type)
        .eq('is_available', true);

      if (typeError || !allRoomsOfType) {
        errors.push(`Failed to find rooms of type ${targetRoom.room_type}`);
        continue;
      }

      // 3. Check availability for each room of this type
      const availableRoomIds = [];

      for (const room of allRoomsOfType) {
        const { data: overlaps } = await supabaseAdmin
          .from('bookings')
          .select('id')
          .eq('room_id', room.id)
          .lt('check_in', check_out)
          .gt('check_out', check_in)
          .in('status', ['Confirmed', 'Pending']);

        if (!overlaps || overlaps.length === 0) {
          availableRoomIds.push(room);
        }
      }

      if (availableRoomIds.length < quantity) {
        errors.push(`Not enough available rooms of type ${targetRoom.room_type}. Requested: ${quantity}, Available: ${availableRoomIds.length}`);
        continue;
      }

      // 4. Create bookings for the first N available rooms
      const roomsToBook = availableRoomIds.slice(0, quantity);

      for (const roomToBook of roomsToBook) {
        const roomCharges = roomToBook.base_price * totalNights;
        const gstAmount = roomCharges * ((roomToBook.gst_percentage || 12) / 100);
        const totalAmount = roomCharges + gstAmount;

        // For now, assume 100% advance or whatever logic
        const advancePaid = totalAmount;
        const balanceAmount = 0;

        const bookingNumber = `BK${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

        const { data: newBooking, error: createError } = await supabaseAdmin
          .from('bookings')
          .insert({
            booking_number: bookingNumber,
            user_id: userId,
            room_id: roomToBook.id,
            guest_name: userData.full_name,
            guest_email: userData.email,
            guest_phone: userData.phone,
            check_in: checkInDate.toISOString().split('T')[0],
            check_out: checkOutDate.toISOString().split('T')[0],
            total_nights: totalNights,
            num_guests: Math.ceil((num_guests || 1) / bookingsToCreate.length), // Distribute guests roughly
            room_charges: roomCharges,
            gst_amount: gstAmount,
            total_amount: totalAmount,
            advance_paid: advancePaid,
            balance_amount: balanceAmount,
            special_requests: special_requests || '',
            status: 'confirmed',
            payment_status: 'paid', // Assuming full payment for now
            booking_for: booking_for || 'self',
            guest_details: guest_details || [], // Attach all guest details to all bookings for now? Or just first?
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating booking:', createError);
          errors.push(`Failed to book room ${roomToBook.room_number}`);
        } else {
          createdBookings.push(newBooking);
        }
      }
    }

    if (createdBookings.length === 0 && errors.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Booking failed', details: errors },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Bookings created successfully',
      bookings: createdBookings,
      booking_ids: createdBookings.map(b => b.id),
      errors: errors.length > 0 ? errors : undefined
    }, { status: 201 });

  } catch (error: any) {
    console.error('POST booking error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
