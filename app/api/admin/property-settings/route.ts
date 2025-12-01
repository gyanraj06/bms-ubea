import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // Mimic debug-db exactly BUT with explicit cache busting
    const adminClient = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
      global: {
        headers: { 'Cache-Control': 'no-store' },
        fetch: (url, options) => {
          return fetch(url, {
            ...options,
            cache: 'no-store',
            next: { revalidate: 0 }
          });
        }
      }
    });

    const { data: settings, error } = await adminClient
      .from('property_settings')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching property settings:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch property settings' },
        { status: 500 }
      );
    }

    const firstSetting = settings && settings.length > 0 ? settings[0] : null;

    const response = NextResponse.json({
      success: true,
      settings: firstSetting,
    });

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
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

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error: Missing Service Role Key' },
        { status: 500 }
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

    // Validate required field
    if (!property_name || !address || !phone || !email) {
      return NextResponse.json(
        { success: false, error: 'Property name, address, phone, and email are required' },
        { status: 400 }
      );
    }

    // Create a fresh client to ensure we use the service role key
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get existing settings using admin client
    const { data: existingSettings } = await adminClient
      .from('property_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

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
      const result = await adminClient
        .from('property_settings')
        .update(updateData)
        .eq('id', existingSettings.id)
        .select()
        .single();

      updatedSettings = result.data;
      error = result.error;
    } else {
      // Insert new settings if none exist
      const result = await adminClient
        .from('property_settings')
        .insert(updateData)
        .select()
        .single();

      updatedSettings = result.data;
      error = result.error;
    }

    if (error) {
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

    const response = NextResponse.json({
      success: true,
      message: 'Property settings updated successfully',
      settings: updatedSettings,
    });

    // Disable caching for PUT response
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error: any) {
    console.error('PUT property settings error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
