import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, supabase } from '@/lib/supabase';

import { verifyToken } from '@/lib/auth';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

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
      phone, // Phone from checkout form
      // New Comprehensive Fields
      bank_id_number,
      govt_id_image_url,
      bank_id_image_url,
      needs_cot,
      num_cots,
      needs_extra_bed,
      num_extra_beds,
      // Guest Specific
      guest_id_number,
      guest_id_image_url,
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
    let { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('full_name, email, phone')
      .eq('id', userId)
      .single();

    console.log('User lookup result:', { userId, userData, userError, errorCode: userError?.code });

    // If user profile doesn't exist, create it
    if (!userData) {
      console.log(`User profile missing for ${userId}, creating now...`);
      console.log('Auth user data:', { email: user.email, metadata: user.user_metadata });

      const password_hash = await bcrypt.hash('external_auth_placeholder', 10);

      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          id: userId,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Guest',
          phone: user.user_metadata?.phone || null,
          is_verified: true,
          is_active: true,
          password_hash,
          created_at: new Date().toISOString()
        })
        .select('full_name, email, phone')
        .single();

      console.log('User creation result:', { newUser, createError });

      if (createError) {
        console.error('Failed to create user profile:', {
          code: createError.code,
          message: createError.message,
          details: createError.details,
          hint: createError.hint
        });
        return NextResponse.json(
          { success: false, error: 'User profile creation failed', details: createError.message },
          { status: 500 }
        );
      }

      userData = newUser;
      userError = null;
    }

    if (!userData) {
      console.error('User data still null after creation attempt');
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

      console.log(`[BOOKING DEBUG] Room type: ${targetRoom.room_type}`);
      console.log(`[BOOKING DEBUG] All rooms of this type:`, allRoomsOfType?.length || 0);
      console.log(`[BOOKING DEBUG] Rooms:`, allRoomsOfType?.map(r => ({ id: r.id, number: r.room_number })));

      if (typeError || !allRoomsOfType) {
        console.error(`[BOOKING DEBUG] Error finding rooms:`, typeError);
        errors.push(`Failed to find rooms of type ${targetRoom.room_type}`);
        continue;
      }

      // 3. Check availability for each room of this type
      const availableRoomIds = [];

      for (const room of allRoomsOfType) {
        const { data: overlaps } = await supabaseAdmin
          .from('bookings')
          .select('id, check_in, check_out, status, booking_number')
          .eq('room_id', room.id)
          .lt('check_in', checkOutDate.toISOString())
          .gt('check_out', checkInDate.toISOString())
          .in('status', ['Confirmed', 'Pending', 'confirmed', 'pending', 'verification_pending']);

        console.log(`[BOOKING DEBUG] Room ${room.room_number} (${room.id}):`, {
          has_overlaps: overlaps && overlaps.length > 0,
          overlap_count: overlaps?.length || 0,
          overlaps: overlaps?.map(o => ({
            booking: o.booking_number,
            check_in: o.check_in,
            check_out: o.check_out,
            status: o.status
          }))
        });

        if (!overlaps || overlaps.length === 0) {
          availableRoomIds.push(room);
        }
      }

      console.log(`[BOOKING DEBUG] Available rooms after check:`, availableRoomIds.length);
      console.log(`[BOOKING DEBUG] Available room IDs:`, availableRoomIds.map(r => r.id));

      if (availableRoomIds.length < quantity) {
        const errorMsg = `Not enough available rooms of type "${targetRoom.room_type}". Requested: ${quantity}, Available: ${availableRoomIds.length}`;
        console.error(errorMsg, {
          room_type: targetRoom.room_type,
          requested: quantity,
          available: availableRoomIds.length,
          check_in,
          check_out,
          all_rooms_of_type: allRoomsOfType?.length || 0
        });
        errors.push(errorMsg);
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
            guest_phone: phone || userData.phone || 'Not provided',
            check_in: checkInDate.toISOString(),
            check_out: checkOutDate.toISOString(),
            total_nights: totalNights,
            num_guests: Math.ceil((parseInt(num_guests) || 1) / bookingsToCreate.length), // Distribute guests roughly
            room_charges: roomCharges,
            gst_amount: gstAmount,
            total_amount: totalAmount,
            advance_paid: advancePaid,
            balance_amount: balanceAmount,
            // Enhanced Fields
            special_requests: special_requests || '',
            status: 'pending',
            payment_status: 'pending',
            booking_for: booking_for || 'self',
            guest_details: guest_details || [],
            bank_id_number: bank_id_number || null,
            govt_id_image_url: govt_id_image_url || null,
            bank_id_image_url: bank_id_image_url || null,
            needs_cot: !!needs_cot,
            num_cots: parseInt(num_cots) || 0,
            needs_extra_bed: !!needs_extra_bed,
            num_extra_beds: parseInt(num_extra_beds) || 0,
            guest_id_number: guest_id_number || null,
            guest_id_image_url: guest_id_image_url || null,
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating booking:', createError);
          errors.push(`Failed to book room ${roomToBook.room_number}: ${createError.message} (${createError.code})`);
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

    // Send confirmation email asynchronously (fire and forget)
    // We don't want to block the response if email fails
    if (createdBookings.length > 0) {
      const primaryBooking = createdBookings[0];
      
      // Calculate total amount for all bookings
      const totalBookingAmount = createdBookings.reduce((sum, b) => sum + b.total_amount, 0);
      
      const emailData = {
        user_name: userData.full_name || 'Guest',
        user_email: userData.email,
        // If multiple rooms, show the booking number of the first one or a combined ref if available
        // The booking number is unique per room booking in this schema, so maybe show the first one
        booking_reference: createdBookings.map(b => b.booking_number).join(', '), 
        check_in_date: new Date(check_in).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        check_out_date: new Date(check_out).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        room_count: createdBookings.length,
        total_amount: Math.round(totalBookingAmount),
        website_url: request.headers.get('origin') || 'https://unionawasholidayhome.com'
      };

      // Import dynamically to avoid top-level await issues or circular deps if any
      const { sendBookingConfirmationEmail } = await import('@/lib/email-service');
      
      // Run in background without awaiting
      sendBookingConfirmationEmail(emailData).then(result => {
        console.log('Email sending initiated:', result);
      }).catch(err => {
        console.error('Failed to initiate email sending:', err);
      });
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
