import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Code is required' },
        { status: 400 }
      );
    }

    // Fetch the stored permission code
    const { data: setting, error } = await supabaseAdmin
      .from('admin_settings')
      .select('value')
      .eq('key', 'permission_code')
      .single();

    if (error) {
      console.error('Error fetching permission code:', error);
      // Fallback or error handling
      return NextResponse.json(
        { success: false, error: 'Failed to verify code' },
        { status: 500 }
      );
    }

    if (!setting) {
        // If no code is set, maybe deny or allow?
        // Defaulting to deny if not configured
        return NextResponse.json(
            { success: false, valid: false, error: 'Permission code not configured' },
            { status: 200 } // Return 200 so frontend handles it as "invalid" logic rather than server error
        );
    }

    const valid = setting.value === code;

    return NextResponse.json({
      success: true,
      valid: valid
    });

  } catch (error: any) {
    console.error('Verify permission code error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
