import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '@/lib/auth';

// Create admin client directly with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Verify admin token and check if user is Owner (only Owners can manage permissions)
 */
function verifyAdminAuth(request: NextRequest): { valid: boolean; role?: string; error?: string } {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'Missing or invalid authorization header' };
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded || decoded.type !== 'admin') {
    return { valid: false, error: 'Invalid or expired token' };
  }

  // Only Owner can manage permissions
  if (decoded.role !== 'Owner') {
    return { valid: false, error: 'Unauthorized. Only Owners can manage permissions.' };
  }

  return { valid: true, role: decoded.role };
}

/**
 * GET /api/admin/permissions
 * Get all permissions with their role assignments
 */
export async function GET(request: NextRequest) {
  try {
    // Verify auth
    const auth = verifyAdminAuth(request);
    if (!auth.valid) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    // Fetch all permissions from database
    const { data: permissions, error } = await supabaseAdmin
      .from('permissions')
      .select('*')
      .order('permission_key', { ascending: true });

    if (error) {
      console.error('Error fetching permissions:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch permissions' }, { status: 500 });
    }

    // Transform to frontend format (roles is already an array in the DB)
    const formattedPermissions = permissions.map((perm) => ({
      id: perm.id,
      name: perm.name,
      description: perm.description,
      key: perm.permission_key,
      href: perm.href,
      roles: perm.roles || [], // roles is already a TEXT[] in database
    }));

    return NextResponse.json({ success: true, permissions: formattedPermissions });
  } catch (error: any) {
    console.error('GET /api/admin/permissions error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * PUT /api/admin/permissions
 * Update permissions (bulk update)
 * Expects: { permissions: Array<{ key: string, roles: string[] }> }
 */
export async function PUT(request: NextRequest) {
  try {
    // Verify auth
    const auth = verifyAdminAuth(request);
    if (!auth.valid) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const { permissions } = body;

    if (!permissions || !Array.isArray(permissions)) {
      return NextResponse.json(
        { success: false, error: 'Permissions array is required' },
        { status: 400 }
      );
    }

    // Update each permission in the database
    const updatePromises = permissions.map(async (perm: { key: string; roles: string[] }) => {
      const { key, roles } = perm;

      // Update the roles array directly
      const { error } = await supabaseAdmin
        .from('permissions')
        .update({ roles })
        .eq('permission_key', key);

      if (error) {
        console.error(`Error updating permission ${key}:`, error);
        throw error;
      }

      return { key, success: true };
    });

    await Promise.all(updatePromises);

    // Create audit log
    const { data: adminUser } = await supabaseAdmin
      .from('admin_users')
      .select('id')
      .eq('role', 'Owner')
      .limit(1)
      .single();

    if (adminUser) {
      await supabaseAdmin.from('audit_logs').insert({
        user_id: adminUser.id,
        action: 'UPDATE',
        table_name: 'permissions',
        new_data: { permissions_updated: permissions.length },
      });
    }

    return NextResponse.json({
      success: true,
      message: `${permissions.length} permissions updated successfully`,
    });
  } catch (error: any) {
    console.error('PUT /api/admin/permissions error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
