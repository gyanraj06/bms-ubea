const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually load environment variables from .env.local
try {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, ''); // Remove quotes if present
        if (key && value) {
            process.env[key] = value;
        }
      }
    });
  }
} catch (e) {
  console.warn("Could not read .env.local file");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Make sure .env.local exists and has NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixPendingBookings() {
  console.log('Starting DB Cleanup...');

  // 1. Get all bookings that are PENDING
  const { data: pendingBookings, error: bookingError } = await supabase
    .from('bookings')
    .select('id, booking_number, status, payment_status')
    .eq('status', 'pending');

  if (bookingError) {
    console.error('Error fetching bookings:', bookingError);
    return;
  }

  console.log(`Found ${pendingBookings.length} pending bookings.`);

  for (const booking of pendingBookings) {
    // 2. Check if there is a FAILED payment log for this booking
    // We look for payment_logs where booking_id matches and status != SUCCESS
    const { data: logs, error: logError } = await supabase
      .from('payment_logs')
      .select('status, transaction_id, updated_at')
      .eq('booking_id', booking.id)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (logError) {
      console.error(`Error checking logs for ${booking.id}:`, logError);
      continue;
    }

    if (logs && logs.length > 0) {
      const lastLog = logs[0];
      // Check if the payment status indicates failure
      // Easebuzz typical statuses: success, failure, userCancelled, dropped
      const isFailed = lastLog.status !== 'success' && lastLog.status !== 'PAID';

      if (isFailed) {
        console.log(`[FIX] Booking ${booking.booking_number} (${booking.id}) has failed payment log (${lastLog.status}). Updating to FAILED...`);
        
        const { error: updateError } = await supabase
            .from('bookings')
            .update({ 
                status: 'failed', 
                payment_status: 'failed' 
            })
            .eq('id', booking.id);
        
        if (updateError) {
            console.error(`Failed to update booking ${booking.id}:`, updateError);
        } else {
            console.log(`Successfully updated ${booking.booking_number} to failed.`);
        }
      } else {
        console.log(`[SKIP] Booking ${booking.booking_number} has success/paid log or undetermined.`);
      }
    } else {
       // Optional: Check if the booking is really old (stale) and expire it?
       // For now, only failing strictly on failed logs as requested.
       console.log(`[SKIP] Booking ${booking.booking_number} has no payment logs.`);
    }
  }

  console.log('Cleanup complete.');
}

fixPendingBookings();
