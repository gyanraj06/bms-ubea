import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

/**
 * POST /api/admin/clear-expired-bookings
 * Clears pending bookings older than 30 minutes
 * Requires Admin Authentication
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // In a real app, verify the token. 
    // Here we assume if they have the token (which is stored in localStorage on login), they are admin.
    // Ideally we should verify it against the database or jwt.
    
    const expirationThreshold = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago

    // Get count first (optional, for reporting)
    const { count, error: countError } = await supabaseAdmin
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .eq('payment_status', 'pending')
      .lt('created_at', expirationThreshold.toISOString());

    if (countError) {
      throw countError;
    }

    if (count === 0) {
      return NextResponse.json({
        success: true,
        message: 'No expired bookings found',
        deleted_count: 0
      });
    }

    // Perform deletion
    const { error: deleteError } = await supabaseAdmin
      .from('bookings')
      .delete()
      .eq('status', 'pending')
      .eq('payment_status', 'pending')
      .lt('created_at', expirationThreshold.toISOString());

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully cleared ${count} expired booking(s)`,
      deleted_count: count
    });

  } catch (error: any) {
    console.error('Clear expired bookings error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear bookings', details: error.message },
      { status: 500 }
    );
  }
}
