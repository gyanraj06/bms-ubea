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

async function checkBookings() {
    const roomId = '093fcd80-39a9-4feb-81f5-1a05cff00fce';
    const checkIn = '2025-12-02';
    const checkOut = '2025-12-06';

    console.log('='.repeat(60));
    console.log('CHECKING BOOKINGS FOR ROOM');
    console.log('='.repeat(60));
    console.log('Room ID:', roomId);
    console.log('Check-in:', checkIn);
    console.log('Check-out:', checkOut);
    console.log('');

    // Get room details
    const { data: room } = await supabaseAdmin
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();

    if (room) {
        console.log('ROOM DETAILS:');
        console.log('  Room Number:', room.room_number);
        console.log('  Room Type:', room.room_type);
        console.log('  is_available:', room.is_available);
        console.log('  is_active:', room.is_active);
        console.log('');
    }

    // Get ALL bookings for this room (regardless of dates)
    const { data: allBookings } = await supabaseAdmin
        .from('bookings')
        .select('*')
        .eq('room_id', roomId)
        .order('check_in', { ascending: true });

    console.log('ALL BOOKINGS FOR THIS ROOM:', allBookings?.length || 0);
    if (allBookings && allBookings.length > 0) {
        allBookings.forEach((booking, idx) => {
            console.log(`\n  Booking ${idx + 1}:`);
            console.log('    Booking Number:', booking.booking_number);
            console.log('    Check-in:', booking.check_in);
            console.log('    Check-out:', booking.check_out);
            console.log('    Status:', booking.status);
            console.log('    Payment Status:', booking.payment_status);
            console.log('    Guest:', booking.guest_name);
        });
    }
    console.log('');

    // Get overlapping bookings with OLD status check (capitalized only)
    const { data: overlapsOld } = await supabaseAdmin
        .from('bookings')
        .select('*')
        .eq('room_id', roomId)
        .lt('check_in', checkOut)
        .gt('check_out', checkIn)
        .in('status', ['Confirmed', 'Pending']);

    console.log('OVERLAPPING BOOKINGS (OLD CHECK - Capitalized only):', overlapsOld?.length || 0);

    // Get overlapping bookings with NEW status check (all variations)
    const { data: overlapsNew } = await supabaseAdmin
        .from('bookings')
        .select('*')
        .eq('room_id', roomId)
        .lt('check_in', checkOut)
        .gt('check_out', checkIn)
        .in('status', ['Confirmed', 'Pending', 'confirmed', 'pending', 'verification_pending']);

    console.log('OVERLAPPING BOOKINGS (NEW CHECK - All variations):', overlapsNew?.length || 0);
    if (overlapsNew && overlapsNew.length > 0) {
        overlapsNew.forEach((booking, idx) => {
            console.log(`\n  Overlap ${idx + 1}:`);
            console.log('    Booking Number:', booking.booking_number);
            console.log('    Check-in:', booking.check_in);
            console.log('    Check-out:', booking.check_out);
            console.log('    Status:', booking.status, '<-- NOTE THE CASE');
            console.log('    Payment Status:', booking.payment_status);
        });
    }
    console.log('');

    // Check all rooms of this type
    if (room) {
        const { data: allRoomsOfType } = await supabaseAdmin
            .from('rooms')
            .select('id, room_number, is_available, is_active')
            .eq('room_type', room.room_type);

        console.log(`ALL ROOMS OF TYPE "${room.room_type}":`, allRoomsOfType?.length || 0);
        if (allRoomsOfType) {
            for (const r of allRoomsOfType) {
                const { data: roomOverlaps } = await supabaseAdmin
                    .from('bookings')
                    .select('id, status')
                    .eq('room_id', r.id)
                    .lt('check_in', checkOut)
                    .gt('check_out', checkIn)
                    .in('status', ['Confirmed', 'Pending', 'confirmed', 'pending', 'verification_pending']);

                console.log(`  Room ${r.room_number}:`, {
                    id: r.id,
                    is_available: r.is_available,
                    is_active: r.is_active,
                    has_overlaps: roomOverlaps && roomOverlaps.length > 0,
                    overlap_count: roomOverlaps?.length || 0
                });
            }
        }
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('DIAGNOSIS:');
    console.log('='.repeat(60));
    if (overlapsOld?.length === 0 && overlapsNew && overlapsNew.length > 0) {
        console.log('❌ BUG CONFIRMED!');
        console.log('   The room appears available with OLD check (capitalized statuses)');
        console.log('   But is UNAVAILABLE with NEW check (all status variations)');
        console.log('   This is why search showed it available but booking failed!');
    } else if (overlapsNew && overlapsNew.length > 0) {
        console.log('✅ Room is correctly showing as UNAVAILABLE');
        console.log('   There are overlapping bookings for the requested dates');
    } else {
        console.log('✅ Room is AVAILABLE for the requested dates');
    }
    console.log('='.repeat(60));
}

checkBookings().catch(console.error);
