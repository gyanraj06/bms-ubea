import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

/**
 * GET /api/newsletter
 * Fetch all published newsletters (Public)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    let query = supabaseAdmin
      .from('newsletters')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (type && type !== 'all') {
      query = query.eq('type', type);
    }

    const { data: newsletters, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, newsletters: newsletters || [] });
  } catch (error: any) {
    console.error('Error fetching public newsletters:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
