import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * POST /api/admin/bookings/[id]/validate
 * Admin validates or rejects a payment
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const bookingId = params.id;

        // Verify admin JWT token
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);

        if (!decoded || decoded.type !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Invalid or expired admin token' },
                { status: 401 }
            );
        }

        // Token is valid and user is admin
        console.log('Admin validation request from:', decoded.email, 'Role:', decoded.role);

        const body = await request.json();
        const { action } = body; // 'approve' or 'reject'

        if (!['approve', 'reject'].includes(action)) {
            return NextResponse.json(
                { success: false, error: 'Invalid action' },
                { status: 400 }
            );
        }

        let updateData = {};
        if (action === 'approve') {
            updateData = {
                payment_status: 'paid',
                status: 'confirmed',
                updated_at: new Date().toISOString(),
            };
        } else {
            updateData = {
                payment_status: 'failed',
                status: 'failed',
                updated_at: new Date().toISOString(),
            };
        }

        const { data: updatedBooking, error: updateError } = await supabaseAdmin
            .from('bookings')
            .update(updateData)
            .eq('id', bookingId)
            .select() // Select updated data
            .single();

        if (updateError) {
            console.error('Error validating booking:', updateError);
            return NextResponse.json(
                { success: false, error: 'Failed to update booking' },
                { status: 500 }
            );
        }

        // Send Email if Approved
        if (action === 'approve' && updatedBooking) {
            // Fetch User Details if not present in booking
            // Note: Booking table has guest_name, guest_email, guest_phone
            // We can use those directly.
            
            const emailData = {
                user_name: updatedBooking.guest_name || 'Guest',
                user_email: updatedBooking.guest_email,
                booking_reference: updatedBooking.booking_number,
                check_in_date: new Date(updatedBooking.check_in).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
                check_out_date: new Date(updatedBooking.check_out).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
                room_count: 1, // Logic might need adjustment if validating bulk bookings, but usually ID is per room booking here
                total_amount: Math.round(updatedBooking.total_amount),
                website_url: request.headers.get('origin') || 'https://unionawasholidayhome.com',
                payment_date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
                amount_paid: Math.round(updatedBooking.total_amount) // Assuming full payment
            };

            // Send in background
            const { sendPaymentVerifiedEmail } = await import('@/lib/email-service');
            sendPaymentVerifiedEmail(emailData).then(res => console.log('Payment verified email sent:', res));
        }

        // Send Email if Rejected
        if (action === 'reject' && updatedBooking) {
            const emailData = {
                user_name: updatedBooking.guest_name || 'Guest',
                user_email: updatedBooking.guest_email,
                booking_reference: updatedBooking.booking_number,
                check_in_date: new Date(updatedBooking.check_in).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
                check_out_date: new Date(updatedBooking.check_out).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
                room_count: 1,
                total_amount: Math.round(updatedBooking.total_amount),
                website_url: request.headers.get('origin') || 'https://unionawasholidayhome.com',
                payment_date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }), // Not used but keeps interface happy if shared
                amount_paid: 0
            };

            const { sendPaymentRejectedEmail } = await import('@/lib/email-service');
            sendPaymentRejectedEmail(emailData).then(res => console.log('Payment rejection email sent:', res));
        }

        if (updateError) {
            console.error('Error validating booking:', updateError);
            return NextResponse.json(
                { success: false, error: 'Failed to update booking' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `Payment ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
        });

    } catch (error: any) {
        console.error('Admin validation error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
