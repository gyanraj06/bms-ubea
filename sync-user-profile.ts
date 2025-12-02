import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

// Load env vars manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};
envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        envVars[key] = value;
    }
});

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseServiceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function syncUserProfile() {
    // Get the user ID from the token you provided
    const userId = '92dd9963-2bfc-481d-b220-ec0b040b19bf'; // From your latest token

    console.log('Syncing user profile for:', userId);

    // 1. Get user from Auth
    const { data: { user }, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (authError || !user) {
        console.error('Auth user not found:', authError);
        return;
    }

    console.log('Auth user found:', user.email);
    console.log('User metadata:', user.user_metadata);

    // 2. Check if profile exists
    const { data: existing, error: fetchError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (existing) {
        console.log('User profile already exists:', existing);
        return;
    }

    console.log('User profile not found, creating...');

    // 3. Create user profile
    const password_hash = await bcrypt.hash('placeholder_password', 10);

    const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
            id: userId,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Guest',
            phone: user.user_metadata?.phone || null,
            role: 'customer',
            is_verified: true,
            is_active: true,
            password_hash,
            created_at: new Date().toISOString()
        })
        .select()
        .single();

    if (createError) {
        console.error('FAILED to create user profile:');
        console.error('Error code:', createError.code);
        console.error('Error message:', createError.message);
        console.error('Error details:', createError.details);
        console.error('Error hint:', createError.hint);
    } else {
        console.log('✅ User profile created successfully:', newUser);
    }
}

syncUserProfile();
