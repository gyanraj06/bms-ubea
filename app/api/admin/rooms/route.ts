import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Fetch all rooms
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const is_active = searchParams.get('is_active');

    let query = supabaseAdmin
      .from('rooms')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter by active status if provided
    if (is_active !== null) {
      query = query.eq('is_active', is_active === 'true');
    }

    const { data: rooms, error } = await query;

    if (error) {
      console.error('Error fetching rooms:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch rooms', details: error.message },
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
      { success: false, error: 'Failed to fetch rooms', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new room
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      room_number,
      room_type,
      floor,
      max_guests,
      base_price,
      description,
      amenities,
      size_sqft,
      bed_type,
      view_type,
      is_available,
      is_active,
      images,
    } = body;

    // Validation
    if (!room_number || !room_type || !base_price || !max_guests) {
      return NextResponse.json(
        {
          success: false,
          error: 'Room number, type, price, and max guests are required',
        },
        { status: 400 }
      );
    }

    // Check if room number already exists
    const { data: existingRoom } = await supabaseAdmin
      .from('rooms')
      .select('id')
      .eq('room_number', room_number)
      .single();

    if (existingRoom) {
      return NextResponse.json(
        {
          success: false,
          error: 'A room with this number already exists',
        },
        { status: 409 }
      );
    }

    // Insert new room
    const { data: newRoom, error } = await supabaseAdmin
      .from('rooms')
      .insert({
        room_number,
        room_type,
        floor: floor || 1,
        max_guests,
        base_price,
        description: description || '',
        amenities: amenities || [],
        size_sqft: size_sqft || 0,
        bed_type: bed_type || '',
        view_type: view_type || '',
        is_available: is_available !== false,
        is_active: is_active !== false,
        images: images || [],
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating room:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create room', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Room created successfully',
      room: newRoom,
    });
  } catch (error: any) {
    console.error('POST room error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create room', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update an existing room
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Room ID is required' },
        { status: 400 }
      );
    }

    // Check if room exists
    const { data: existingRoom } = await supabaseAdmin
      .from('rooms')
      .select('id')
      .eq('id', id)
      .single();

    if (!existingRoom) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      );
    }

    // Update room
    const { data: updatedRoom, error } = await supabaseAdmin
      .from('rooms')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating room:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update room', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Room updated successfully',
      room: updatedRoom,
    });
  } catch (error: any) {
    console.error('PUT room error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update room', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete a room
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Room ID is required' },
        { status: 400 }
      );
    }

    // Check if room exists
    const { data: existingRoom } = await supabaseAdmin
      .from('rooms')
      .select('id, images')
      .eq('id', id)
      .single();

    if (!existingRoom) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      );
    }

    // Delete room (cascade will handle related media)
    const { error } = await supabaseAdmin
      .from('rooms')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting room:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete room', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Room deleted successfully',
    });
  } catch (error: any) {
    console.error('DELETE room error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete room', details: error.message },
      { status: 500 }
    );
  }
}
