const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env vars manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
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

    const output = [];
    const log = (...args) => {
        console.log(...args);
        output.push(args.join(' '));
    };

    log('='.repeat(60));
    log('CHECKING BOOKINGS FOR ROOM');
    log('='.repeat(60));
    log('Room ID:', roomId);
    log('Check-in:', checkIn);
    log('Check-out:', checkOut);
    log('');

    // Get room details
    const { data: room } = await supabaseAdmin
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();

    if (room) {
        log('ROOM DETAILS:');
        log('  Room Number:', room.room_number);
        log('  Room Type:', room.room_type);
        log('  is_available:', room.is_available);
        log('  is_active:', room.is_active);
        log('');
    }

    // Get ALL bookings for this room (regardless of dates)
    const { data: allBookings } = await supabaseAdmin
        .from('bookings')
        .select('*')
        .eq('room_id', roomId)
        .order('check_in', { ascending: true });

    log('ALL BOOKINGS FOR THIS ROOM:', allBookings?.length || 0);
    if (allBookings && allBookings.length > 0) {
        allBookings.forEach((booking, idx) => {
            log(`\n  Booking ${idx + 1}:`);
            log('    Booking Number:', booking.booking_number);
            log('    Check-in:', booking.check_in);
            log('    Check-out:', booking.check_out);
            log('    Status:', booking.status);
            log('    Payment Status:', booking.payment_status);
            log('    Guest:', booking.guest_name);
        });
    }
    log('');

    // Get overlapping bookings with OLD status check (capitalized only)
    const { data: overlapsOld } = await supabaseAdmin
        .from('bookings')
        .select('*')
        .eq('room_id', roomId)
        .lt('check_in', checkOut)
        .gt('check_out', checkIn)
        .in('status', ['Confirmed', 'Pending']);

    log('OVERLAPPING BOOKINGS (OLD CHECK - Capitalized only):', overlapsOld?.length || 0);

    // Get overlapping bookings with NEW status check (all variations)
    const { data: overlapsNew } = await supabaseAdmin
        .from('bookings')
        .select('*')
        .eq('room_id', roomId)
        .lt('check_in', checkOut)
        .gt('check_out', checkIn)
        .in('status', ['Confirmed', 'Pending', 'confirmed', 'pending', 'verification_pending']);

    log('OVERLAPPING BOOKINGS (NEW CHECK - All variations):', overlapsNew?.length || 0);
    if (overlapsNew && overlapsNew.length > 0) {
        overlapsNew.forEach((booking, idx) => {
            log(`\n  Overlap ${idx + 1}:`);
            log('    Booking Number:', booking.booking_number);
            log('    Check-in:', booking.check_in);
            log('    Check-out:', booking.check_out);
            log('    Status:', booking.status, '<-- NOTE THE CASE');
            log('    Payment Status:', booking.payment_status);
        });
    }
    log('');

    // Check all rooms of this type
    if (room) {
        const { data: allRoomsOfType } = await supabaseAdmin
            .from('rooms')
            .select('id, room_number, is_available, is_active')
            .eq('room_type', room.room_type);

        log(`ALL ROOMS OF TYPE "${room.room_type}":`, allRoomsOfType?.length || 0);
        if (allRoomsOfType) {
            for (const r of allRoomsOfType) {
                const { data: roomOverlaps } = await supabaseAdmin
                    .from('bookings')
                    .select('id, status')
                    .eq('room_id', r.id)
                    .lt('check_in', checkOut)
                    .gt('check_out', checkIn)
                    .in('status', ['Confirmed', 'Pending', 'confirmed', 'pending', 'verification_pending']);

                log(`  Room ${r.room_number}:`, JSON.stringify({
                    id: r.id,
                    is_available: r.is_available,
                    is_active: r.is_active,
                    has_overlaps: roomOverlaps && roomOverlaps.length > 0,
                    overlap_count: roomOverlaps?.length || 0
                }));
            }
        }
    }

    log('');
    log('='.repeat(60));
    log('DIAGNOSIS:');
    log('='.repeat(60));
    if (overlapsOld?.length === 0 && overlapsNew && overlapsNew.length > 0) {
        log('❌ BUG CONFIRMED!');
        log('   The room appears available with OLD check (capitalized statuses)');
        log('   But is UNAVAILABLE with NEW check (all status variations)');
        log('   This is why search showed it available but booking failed!');
    } else if (overlapsNew && overlapsNew.length > 0) {
        log('✅ Room is correctly showing as UNAVAILABLE');
        log('   There are overlapping bookings for the requested dates');
    } else {
        log('✅ Room is AVAILABLE for the requested dates');
    }
    log('='.repeat(60));

    fs.writeFileSync('debug-output.txt', output.join('\n'));
}

checkBookings().catch(err => {
    console.error(err);
    fs.writeFileSync('debug-output.txt', 'Error: ' + err.message);
});
