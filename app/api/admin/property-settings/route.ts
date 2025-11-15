import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

/**
 * Verify admin token for protected operations
 */
function verifyAdminAuth(request: NextRequest): { valid: boolean; role?: string; userId?: string; error?: string } {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'Missing or invalid authorization header' };
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded || decoded.type !== 'admin') {
    return { valid: false, error: 'Invalid or expired token' };
  }

  return { valid: true, role: decoded.role, userId: decoded.id };
}

/**
 * GET /api/admin/property-settings
 * Fetch property settings (public endpoint - no auth required for public display)
 */
export async function GET(request: NextRequest) {
  try {
    const { data: settings, error } = await supabaseAdmin
      .from('property_settings')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching property settings:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch property settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      settings: settings || null,
    });
  } catch (error: any) {
    console.error('GET property settings error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/property-settings
 * Update property settings (requires admin auth)
 */
export async function PUT(request: NextRequest) {
  try {
    // Verify auth - only Owner can update property settings
    const auth = verifyAdminAuth(request);
    if (!auth.valid) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    if (auth.role !== 'Owner') {
      return NextResponse.json(
        { success: false, error: 'Only Owners can update property settings' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      property_name,
      address,
      phone,
      email,
      gst_number,
      check_in_time,
      check_out_time,
      google_maps_embed_url,
      description,
    } = body;

    // Validate required fields
    if (!property_name || !address || !phone || !email) {
      return NextResponse.json(
        { success: false, error: 'Property name, address, phone, and email are required' },
        { status: 400 }
      );
    }

    // Get existing settings
    const { data: existingSettings } = await supabaseAdmin
      .from('property_settings')
      .select('*')
      .limit(1)
      .single();

    const updateData = {
      property_name,
      address,
      phone,
      email,
      gst_number: gst_number || '',
      check_in_time,
      check_out_time,
      google_maps_embed_url: google_maps_embed_url || null,
      description: description || null,
      updated_at: new Date().toISOString(),
      updated_by: auth.userId,
    };

    let updatedSettings;
    let error;

    if (existingSettings) {
      // Update existing settings
      const result = await supabaseAdmin
        .from('property_settings')
        .update(updateData)
        .eq('id', existingSettings.id)
        .select()
        .single();

      updatedSettings = result.data;
      error = result.error;
    } else {
      // Insert new settings if none exist
      const result = await supabaseAdmin
        .from('property_settings')
        .insert(updateData)
        .select()
        .single();

      updatedSettings = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Error updating property settings:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update property settings' },
        { status: 500 }
      );
    }

    // Create audit log
    await supabaseAdmin.from('audit_logs').insert({
      user_id: auth.userId,
      action: existingSettings ? 'UPDATE' : 'CREATE',
      table_name: 'property_settings',
      record_id: updatedSettings.id,
      new_data: { property_name, phone, email },
    });

    return NextResponse.json({
      success: true,
      message: 'Property settings updated successfully',
      settings: updatedSettings,
    });
  } catch (error: any) {
    console.error('PUT property settings error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
