import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { comparePassword, generateToken } from '@/lib/auth';

// Create admin client directly with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('=== ADMIN LOGIN DEBUG ===');
    console.log('Login attempt for email:', email);
    console.log('Password provided:', !!password);

    // Validate input
    if (!email || !password) {
      console.log('Missing credentials');
      return NextResponse.json(
        {
          success: false,
          error: 'Email and password are required',
          code: 'MISSING_CREDENTIALS',
        },
        { status: 400 }
      );
    }

    // Find admin user by email
    console.log('Searching for user with email:', email.toLowerCase());
    const { data: adminUser, error: fetchError } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .single();

    console.log('Fetch error:', fetchError);
    console.log('User found:', !!adminUser);
    if (adminUser) {
      console.log('User details:', {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        has_password_hash: !!adminUser.password_hash,
        password_hash_length: adminUser.password_hash?.length
      });
    }

    if (fetchError || !adminUser) {
      console.log('User not found or fetch error');
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS',
        },
        { status: 401 }
      );
    }

    // Verify password
    console.log('Comparing password...');
    const isPasswordValid = await comparePassword(password, adminUser.password_hash);
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('Password comparison failed');
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS',
        },
        { status: 401 }
      );
    }

    console.log('Login successful!');

    // Update last login
    await supabaseAdmin
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', adminUser.id);

    // Create audit log
    await supabaseAdmin.from('audit_logs').insert({
      user_id: adminUser.id,
      action: 'LOGIN',
      table_name: 'admin_users',
      record_id: adminUser.id,
      new_data: { email: adminUser.email, role: adminUser.role },
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
    });

    // Generate JWT token
    const token = generateToken({
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      type: 'admin',
    });

    // Return success response
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        full_name: adminUser.full_name,
        role: adminUser.role,
        phone: adminUser.phone,
      },
    });
  } catch (error: any) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Login failed. Please try again.',
        code: 'SERVER_ERROR',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
