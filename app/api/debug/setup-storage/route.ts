
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const bucketName = 'booking-documents';
    
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      return NextResponse.json({ success: false, error: 'Failed to list buckets', details: listError }, { status: 500 });
    }

    const exists = buckets.find(b => b.name === bucketName);

    if (exists) {
      return NextResponse.json({ success: true, message: `Bucket '${bucketName}' already exists` });
    }

    // Create bucket
    const { data, error } = await supabaseAdmin.storage.createBucket(bucketName, {
      public: false,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    });

    if (error) {
      return NextResponse.json({ success: false, error: 'Failed to create bucket', details: error }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Bucket '${bucketName}' created successfully`, data });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Unexpected error', details: error }, { status: 500 });
  }
}
