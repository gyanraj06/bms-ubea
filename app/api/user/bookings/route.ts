import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, supabase } from '@/lib/supabase';

/**
 * GET /api/user/bookings
 * Get all bookings for the logged-in user
 */
export async function GET(request: NextRequest) {
  try {
    // Verify user is logged in
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Please login to view bookings' },
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

    // Get all bookings for this user
    const { data: bookings, error: bookingsError } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        rooms:room_id (
          id,
          room_number,
          room_type,
          images
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      bookings: bookings || [],
    });
  } catch (error: any) {
    console.error('GET user bookings error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
