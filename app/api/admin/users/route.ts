import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { hashPassword, verifyToken } from '@/lib/auth';

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
 * Verify admin token and check if user is Owner (only Owners can manage users)
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

  // Only Owner can manage users
  if (decoded.role !== 'Owner') {
    return { valid: false, error: 'Unauthorized. Only Owners can manage users.' };
  }

  return { valid: true, role: decoded.role };
}

/**
 * GET /api/admin/users
 * List all admin users
 */
export async function GET(request: NextRequest) {
  try {
    // Verify auth
    const auth = verifyAdminAuth(request);
    if (!auth.valid) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    // Fetch all admin users
    const { data: users, error } = await supabaseAdmin
      .from('admin_users')
      .select('id, email, full_name, role, phone, is_active, last_login, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin users:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
    }

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    console.error('GET /api/admin/users error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/users
 * Create a new admin user
 */
export async function POST(request: NextRequest) {
  try {
    // Verify auth
    const auth = verifyAdminAuth(request);
    if (!auth.valid) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const { email, password, full_name, role, phone } = body;

    // Validate input
    if (!email || !password || !full_name || !role) {
      return NextResponse.json(
        { success: false, error: 'Email, password, full name, and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['Owner', 'Manager', 'Front Desk', 'Accountant'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role. Must be Owner, Manager, Front Desk, or Accountant' },
        { status: 400 }
      );
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Insert into database
    const { data: newUser, error } = await supabaseAdmin
      .from('admin_users')
      .insert({
        email: email.toLowerCase(),
        password_hash,
        full_name,
        role,
        phone: phone || null,
        is_active: true,
      })
      .select('id, email, full_name, role, phone, is_active, created_at')
      .single();

    if (error) {
      // Check for duplicate email
      if (error.code === '23505') {
        return NextResponse.json(
          { success: false, error: 'User with this email already exists' },
          { status: 409 }
        );
      }
      console.error('Error creating admin user:', error);
      return NextResponse.json({ success: false, error: 'Failed to create user' }, { status: 500 });
    }

    // Create audit log
    await supabaseAdmin.from('audit_logs').insert({
      user_id: newUser.id,
      action: 'CREATE',
      table_name: 'admin_users',
      record_id: newUser.id,
      new_data: { email: newUser.email, role: newUser.role },
    });

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/admin/users error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * PUT /api/admin/users
 * Update an existing admin user
 */
export async function PUT(request: NextRequest) {
  try {
    // Verify auth
    const auth = verifyAdminAuth(request);
    if (!auth.valid) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const { id, email, password, full_name, role, phone, is_active } = body;

    // Validate input
    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    // Build update object
    const updateData: any = {};
    if (email) updateData.email = email.toLowerCase();
    if (full_name) updateData.full_name = full_name;
    if (role) {
      const validRoles = ['Owner', 'Manager', 'Front Desk', 'Accountant'];
      if (!validRoles.includes(role)) {
        return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 });
      }
      updateData.role = role;
    }
    if (phone !== undefined) updateData.phone = phone;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (password) {
      updateData.password_hash = await hashPassword(password);
    }

    // Update in database
    const { data: updatedUser, error } = await supabaseAdmin
      .from('admin_users')
      .update(updateData)
      .eq('id', id)
      .select('id, email, full_name, role, phone, is_active, last_login, created_at')
      .single();

    if (error) {
      console.error('Error updating admin user:', error);
      return NextResponse.json({ success: false, error: 'Failed to update user' }, { status: 500 });
    }

    // Create audit log
    await supabaseAdmin.from('audit_logs').insert({
      user_id: updatedUser.id,
      action: 'UPDATE',
      table_name: 'admin_users',
      record_id: updatedUser.id,
      new_data: updateData,
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error('PUT /api/admin/users error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/users
 * Delete an admin user
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify auth
    const auth = verifyAdminAuth(request);
    if (!auth.valid) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    // Get user ID from query params
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    // Prevent deleting the last Owner
    const { data: owners } = await supabaseAdmin
      .from('admin_users')
      .select('id')
      .eq('role', 'Owner')
      .eq('is_active', true);

    const { data: userToDelete } = await supabaseAdmin
      .from('admin_users')
      .select('role')
      .eq('id', id)
      .single();

    if (userToDelete?.role === 'Owner' && owners && owners.length <= 1) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete the last Owner account' },
        { status: 403 }
      );
    }

    // Create audit log before deletion
    await supabaseAdmin.from('audit_logs').insert({
      user_id: id,
      action: 'DELETE',
      table_name: 'admin_users',
      record_id: id,
    });

    // Delete from database
    const { error } = await supabaseAdmin
      .from('admin_users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting admin user:', error);
      return NextResponse.json({ success: false, error: 'Failed to delete user' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('DELETE /api/admin/users error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
