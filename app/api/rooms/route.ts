import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Public GET - Fetch active rooms for customers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const room_type = searchParams.get('room_type');

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
