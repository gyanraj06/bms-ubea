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
                // status: 'cancelled', // Optional: do we cancel the booking or just fail payment?
                // Let's keep status as pending or maybe cancelled if payment fails?
                // For now, let's just mark payment failed, user might retry.
                updated_at: new Date().toISOString(),
            };
        }

        const { error: updateError } = await supabaseAdmin
            .from('bookings')
            .update(updateData)
            .eq('id', bookingId);

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
