import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, type, google_id, full_name } = body;

    // Handle Google SSO login
    if (type === 'google') {
      if (!google_id || !email) {
        return NextResponse.json(
          {
            success: false,
            error: 'Google ID and email are required for Google login',
            code: 'MISSING_GOOGLE_DATA',
          },
          { status: 400 }
        );
      }

      // Check if user exists with this Google ID
      let { data: user, error: fetchError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('google_id', google_id)
        .eq('is_active', true)
        .single();

      // If user doesn't exist, check by email
      if (fetchError || !user) {
        const { data: userByEmail } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('email', email.toLowerCase())
          .eq('is_active', true)
          .single();

        if (userByEmail) {
          // Update existing user with Google ID
          const { data: updatedUser } = await supabaseAdmin
            .from('users')
            .update({ google_id })
            .eq('id', userByEmail.id)
            .select()
            .single();

          user = updatedUser;
        } else {
          // Create new user for Google SSO
          const { data: newUser, error: createError } = await supabaseAdmin
            .from('users')
            .insert({
              email: email.toLowerCase(),
              google_id,
              full_name: full_name || email.split('@')[0],
              is_verified: true, // Auto-verify Google users
              is_active: true,
            })
            .select()
            .single();

          if (createError) {
            return NextResponse.json(
              {
                success: false,
                error: 'Failed to create user account',
                code: 'USER_CREATION_FAILED',
              },
              { status: 500 }
            );
          }

          user = newUser;
        }
      }

      // Sign in with Supabase Auth using Google
      const { data: authData, error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });

      return NextResponse.json({
        success: true,
        message: 'Google login successful',
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
        },
        authUrl: authData?.url,
      });
    }

    // Handle email/password login
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email and password are required',
          code: 'MISSING_CREDENTIALS',
        },
        { status: 400 }
      );
    }

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS',
        },
        { status: 401 }
      );
    }

    // Get user data from our database
    const { data: userData, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .eq('is_active', true)
      .single();

    if (fetchError || !userData) {
      return NextResponse.json(
        {
          success: false,
          error: 'User account not found or inactive',
          code: 'USER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        phone: userData.phone,
        is_verified: userData.is_verified,
      },
      session: authData.session,
    });
  } catch (error: any) {
    console.error('User login error:', error);
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
