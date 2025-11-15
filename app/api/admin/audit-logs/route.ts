import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Fetch recent audit logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const user_id = searchParams.get('user_id');

    let query = supabaseAdmin
      .from('audit_logs')
      .select(`
        *,
        admin_users!audit_logs_user_id_fkey (
          full_name,
          email,
          role
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Filter by user if provided
    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    const { data: logs, error } = await query;

    if (error) {
      console.error('Error fetching audit logs:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch audit logs', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      logs: logs || [],
    });
  } catch (error: any) {
    console.error('GET audit logs error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch audit logs', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create audit log entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      action,
      table_name,
      record_id,
      old_data,
      new_data,
      ip_address,
      user_agent,
    } = body;

    // Validation
    if (!user_id || !action || !table_name) {
      return NextResponse.json(
        { success: false, error: 'user_id, action, and table_name are required' },
        { status: 400 }
      );
    }

    // Insert audit log
    const { data: log, error } = await supabaseAdmin
      .from('audit_logs')
      .insert({
        user_id,
        action,
        table_name,
        record_id: record_id || null,
        old_data: old_data || null,
        new_data: new_data || null,
        ip_address: ip_address || null,
        user_agent: user_agent || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating audit log:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create audit log', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Audit log created successfully',
      log,
    });
  } catch (error: any) {
    console.error('POST audit log error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create audit log', details: error.message },
      { status: 500 }
    );
  }
}
