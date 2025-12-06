import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  // Sign out from Supabase (revokes logic)
  await supabase.auth.signOut();

  // Force redirect to home, which effectively clears checking
  return NextResponse.json({ success: true });
}
