import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

export const runtime = 'nodejs';

// GET: Fetch the current permission code
export async function GET(request: NextRequest) {
  try {
    // 1. Get Token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.substring(7);

    // 2. Verify with Project's Custom Auth
    const decoded = verifyToken(token);
    if (!decoded) {
        return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    // 3. Admin Check (Flexible: either 'admin' type or role)
    if (decoded.type !== 'admin' && decoded.role !== 'admin') {
         return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    // Fetch code using admin client
    const { data, error } = await supabaseAdmin
      .from('admin_settings')
      .select('value')
      .eq('key', 'permission_code')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[API] Error fetching setting:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      code: data?.value || ''
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Update the permission code
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.substring(7);

    const decoded = verifyToken(token);
    if (!decoded) {
        return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    if (decoded.type !== 'admin' && decoded.role !== 'admin') {
         return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ success: false, error: 'Code is required' }, { status: 400 });
    }

    console.log("[API] Updating permission code. User:", decoded.email);

    // Upsert the code using Service Role (supabaseAdmin)
    const { error } = await supabaseAdmin
      .from('admin_settings')
      .upsert({ 
        key: 'permission_code', 
        value: code,
        updated_at: new Date().toISOString()
     });

    if (error) {
      console.error('[API] Error updating permission code:', error);
      return NextResponse.json({ success: false, error: 'Failed to update code' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Permission code updated successfully'
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
