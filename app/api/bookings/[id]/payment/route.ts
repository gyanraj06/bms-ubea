import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, supabase } from '@/lib/supabase';

export const runtime = 'nodejs';

/**
 * POST /api/bookings/[id]/payment
 * User marks a booking as paid
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const bookingId = params.id;

        // Verify user is logged in
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7);
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Invalid token' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { action, transaction_id, payment_screenshot_url } = body;

        if (action !== 'mark_paid') {
            return NextResponse.json(
                { success: false, error: 'Invalid action' },
                { status: 400 }
            );
        }

        // Verify booking belongs to user
        const { data: booking, error: fetchError } = await supabaseAdmin
            .from('bookings')
            .select('user_id, status, payment_status')
            .eq('id', bookingId)
            .single();

        console.log('Booking lookup:', { bookingId, booking, fetchError, userId: user.id });

        if (fetchError || !booking) {
            console.error('Booking fetch error:', fetchError);
            return NextResponse.json(
                { success: false, error: 'Booking not found', details: fetchError?.message },
                { status: 404 }
            );
        }

        if (booking.user_id !== user.id) {
            console.error('User ID mismatch:', { bookingUserId: booking.user_id, authUserId: user.id });
            return NextResponse.json(
                { success: false, error: 'Unauthorized access to booking' },
                { status: 403 }
            );
        }

        // Update payment status to verification_pending (waiting for admin verification)
        const updateData: any = {
            payment_status: 'verification_pending',
            updated_at: new Date().toISOString(),
        };

        // Add screenshot URL if provided
        if (payment_screenshot_url) {
            updateData.payment_screenshot_url = payment_screenshot_url;
        }

        const { error: updateError } = await supabaseAdmin
            .from('bookings')
            .update(updateData)
            .eq('id', bookingId);

        if (updateError) {
            console.error('Error updating booking payment status:', updateError);
            return NextResponse.json(
                { success: false, error: 'Failed to update payment status', details: updateError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Payment marked as pending verification',
        });

    } catch (error: any) {
        console.error('Payment update error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
