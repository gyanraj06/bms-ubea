import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env vars manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};
envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        envVars[key] = value;
    }
});

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseServiceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function checkRoomAvailability() {
    const roomId = '093fcd80-39a9-4feb-81f5-1a05cff00fce';
    const checkIn = '2025-12-02';
    const checkOut = '2025-12-06';

    console.log('Checking availability for:');
    console.log('Room ID:', roomId);
    console.log('Check-in:', checkIn);
    console.log('Check-out:', checkOut);
    console.log('---');

    // 1. Get the room details
    const { data: room, error: roomError } = await supabaseAdmin
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();

    if (roomError || !room) {
        console.error('Room not found:', roomError);
        return;
    }

    console.log('Room found:', {
        id: room.id,
        room_number: room.room_number,
        room_type: room.room_type,
        is_available: room.is_available
    });
    console.log('---');

    // 2. Get all rooms of this type
    const { data: allRoomsOfType, error: typeError } = await supabaseAdmin
        .from('rooms')
        .select('id, room_number, base_price, is_available')
        .eq('room_type', room.room_type);

    console.log(`All rooms of type "${room.room_type}":`, allRoomsOfType?.length || 0);
    console.log(allRoomsOfType);
    console.log('---');

    // 3. Check for overlapping bookings
    const { data: overlaps } = await supabaseAdmin
        .from('bookings')
        .select('*')
        .eq('room_id', roomId)
        .lt('check_in', checkOut)
        .gt('check_out', checkIn)
        .in('status', ['Confirmed', 'Pending', 'confirmed', 'pending', 'verification_pending']);

    console.log(`Overlapping bookings for room ${room.room_number}:`, overlaps?.length || 0);
    if (overlaps && overlaps.length > 0) {
        console.log(overlaps);
    }
    console.log('---');

    // 4. Check availability for each room of this type
    const availableRooms = [];

    if (allRoomsOfType) {
        for (const r of allRoomsOfType) {
            const { data: roomOverlaps } = await supabaseAdmin
                .from('bookings')
                .select('id, check_in, check_out, status')
                .eq('room_id', r.id)
                .lt('check_in', checkOut)
                .gt('check_out', checkIn)
                .in('status', ['Confirmed', 'Pending', 'confirmed', 'pending', 'verification_pending']);

            const isAvailable = !roomOverlaps || roomOverlaps.length === 0;

            console.log(`Room ${r.room_number} (${r.id}):`, {
                is_available_flag: r.is_available,
                has_overlaps: !isAvailable,
                overlapping_bookings: roomOverlaps?.length || 0
            });

            if (isAvailable && r.is_available) {
                availableRooms.push(r);
            }
        }
    }

    console.log('---');
    console.log(`✅ Available rooms: ${availableRooms.length}`);
    console.log(availableRooms.map(r => `Room ${r.room_number} (${r.id})`));
}

checkRoomAvailability();
