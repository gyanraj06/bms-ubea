
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const serviceRoleLength = process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0;
  
  let storageStatus = 'unchecked';
  let errorDetails = null;

  try {
    const { data, error } = await supabaseAdmin.storage.listBuckets();
    if (error) {
      storageStatus = 'failed';
      errorDetails = error;
    } else {
      storageStatus = 'success';
    }
  } catch (e) {
    storageStatus = 'exception';
    errorDetails = e;
  }

  return NextResponse.json({
    hasServiceRole,
    serviceRoleLength,
    storageStatus,
    errorDetails
  });
}
