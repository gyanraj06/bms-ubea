import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { hashPassword } from '@/lib/auth';

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
 * Seed admin users - ONLY RUN ONCE during initial setup
 * This endpoint should be disabled in production
 */
async function seedAdminUsers() {
  try {
    // Debug: Log what we're using (remove in production)
    console.log('=== SEED ADMIN USERS DEBUG ===');
    console.log('Supabase URL:', supabaseUrl);
    console.log('Service Role Key exists:', !!serviceRoleKey);
    console.log('Service Role Key preview:', serviceRoleKey?.substring(0, 20) + '...');

    // FIRST: Delete all existing admin users to start fresh
    console.log('Deleting existing admin users...');
    const { error: deleteError } = await supabaseAdmin
      .from('admin_users')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (neq with fake uuid)

    if (deleteError) {
      console.log('Delete error (might be empty table):', deleteError);
    } else {
      console.log('Existing admin users deleted successfully');
    }

    // Admin users to seed
    const adminUsers = [
      {
        email: 'owner@happyholidays.com',
        password: 'Owner@123',
        full_name: 'Happy Holidays Owner',
        role: 'Owner',
        phone: '+919876543210',
      },
      {
        email: 'manager@happyholidays.com',
        password: 'Manager@123',
        full_name: 'Property Manager',
        role: 'Manager',
        phone: '+919876543211',
      },
      {
        email: 'frontdesk@happyholidays.com',
        password: 'FrontDesk@123',
        full_name: 'Front Desk Staff',
        role: 'Front Desk',
        phone: '+919876543212',
      },
      {
        email: 'accountant@happyholidays.com',
        password: 'Accountant@123',
        full_name: 'Account Manager',
        role: 'Accountant',
        phone: '+919876543213',
      },
    ];

    const results = [];

    for (const user of adminUsers) {
      // Hash password
      const password_hash = await hashPassword(user.password);

      // Insert into database
      const { data, error } = await supabaseAdmin
        .from('admin_users')
        .insert({
          email: user.email,
          password_hash,
          full_name: user.full_name,
          role: user.role,
          phone: user.phone,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        // If user already exists, skip
        if (error.code === '23505') {
          results.push({
            email: user.email,
            status: 'already_exists',
          });
          continue;
        }

        results.push({
          email: user.email,
          status: 'error',
          error: error.message,
        });
        continue;
      }

      results.push({
        email: user.email,
        status: 'created',
        id: data.id,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Admin users seeding completed',
      results,
    });
  } catch (error: any) {
    console.error('Error seeding admin users:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to seed admin users',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Allow both GET and POST for convenience
export async function GET() {
  return seedAdminUsers();
}

export async function POST() {
  return seedAdminUsers();
}
