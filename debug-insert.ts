
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

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

console.log('URL:', supabaseUrl);
console.log('Service Key exists:', !!supabaseServiceKey);

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey!, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function debugInsert() {
    const userId = 'd6dac326-7ce8-41cc-bb68-ea11b795c331'; // The ID from the token
    console.log('Attempting to sync user:', userId);

    // 1. Try to fetch existing
    const { data: existing, error: fetchError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    console.log('Fetch result:', existing ? 'Found' : 'Not Found');
    if (fetchError) console.log('Fetch error:', fetchError);

    if (!existing) {
        // 2. Try to insert
        console.log('Attempting insert...');
        const { data: newUser, error: createError } = await supabaseAdmin
            .from('users')
            .insert({
                id: userId,
                email: 'rajvaidhyag@gmail.com',
                full_name: 'Gyan Raj',
                phone: '1234567890',
                role: 'customer',
                is_verified: true,
                is_active: true,
                password_hash: 'external_auth',
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (createError) {
            console.error('INSERT FAILED. Full error:', JSON.stringify(createError, null, 2));
        } else {
            console.log('Insert successful:', newUser);
        }
    }
}

debugInsert();
