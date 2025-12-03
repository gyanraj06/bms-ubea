import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * GET /api/admin/newsletter
 * Fetch all newsletters (Admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || decoded.type !== 'admin') {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const { data: newsletters, error } = await supabaseAdmin
      .from('newsletters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, newsletters });
  } catch (error: any) {
    console.error('Error fetching newsletters:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/newsletter
 * Create a new newsletter (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded || decoded.type !== 'admin') {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { title, type, content, file_url, attachments, is_published } = body;

    if (!title || !type) {
      return NextResponse.json({ success: false, error: 'Title and Type are required' }, { status: 400 });
    }

    const { data: newsletter, error } = await supabaseAdmin
      .from('newsletters')
      .insert({
        title,
        type,
        content,
        file_url,
        attachments: attachments || [], // Save attachments array
        is_published,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, newsletter });
  } catch (error: any) {
    console.error('Error creating newsletter:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
