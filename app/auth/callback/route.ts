import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Exchange the code for a session
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent(error.message)}`);
    }

    if (session?.user) {
      const user = session.user;
      
      // Sync user to public.users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existingUser) {
        // Create new user profile
        await supabase.from('users').insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
          google_id: user.user_metadata?.sub, // Google ID
          is_verified: true,
          is_active: true,
        });
      } else {
        // Update existing user
        await supabase.from('users').update({
          google_id: user.user_metadata?.sub,
          is_verified: true,
        }).eq('id', user.id);
      }
    }
  }

  // URL to redirect to after sign in process completes
  const redirectUrl = new URL(next, requestUrl.origin);
  // Add a query param to indicate we just finished SSO, helpful for client-side forcing updates
  redirectUrl.searchParams.set('auth_callback', 'true');
  
  return NextResponse.redirect(redirectUrl);
}
