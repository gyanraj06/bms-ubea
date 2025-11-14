import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, full_name, phone } = body;

    // Validate input
    if (!email || !password || !full_name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email, password, and full name are required',
          code: 'MISSING_FIELDS',
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email format',
          code: 'INVALID_EMAIL',
        },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: 'Password must be at least 8 characters long',
          code: 'WEAK_PASSWORD',
        },
        { status: 400 }
      );
    }

    // Check if user already exists in our database
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'An account with this email already exists',
          code: 'EMAIL_EXISTS',
        },
        { status: 409 }
      );
    }

    // Create user in Supabase Auth using admin client (bypasses email confirmation)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name,
        phone,
      },
    });

    if (authError) {
      console.error('Supabase Auth error:', authError);
      return NextResponse.json(
        {
          success: false,
          error: authError.message || 'Failed to create account',
          code: 'AUTH_ERROR',
        },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create user account',
          code: 'USER_CREATION_FAILED',
        },
        { status: 500 }
      );
    }

    // Hash password for our database
    const password_hash = await hashPassword(password);

    // Create user record in our users table
    const { data: userData, error: dbError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email: email.toLowerCase(),
        password_hash,
        full_name,
        phone: phone || null,
        is_verified: true, // Auto-verify all users (email verification disabled)
        is_active: true,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);

      // Rollback: Delete from Supabase Auth if database insert fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create user profile',
          code: 'DB_ERROR',
        },
        { status: 500 }
      );
    }

    // Sign in the user immediately after registration
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Account created successfully! You are now logged in.',
      user: {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        phone: userData.phone,
      },
      session: signInData?.session || null,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Registration failed. Please try again.',
        code: 'SERVER_ERROR',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
