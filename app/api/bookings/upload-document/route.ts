import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
const STORAGE_BUCKET = 'booking-documents';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string; // 'govt_id' or 'bank_id'

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!documentType || !['govt_id', 'bank_id'].includes(documentType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid document type. Must be govt_id or bank_id' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        },
        { status: 400 }
      );
    }

    // Generate unique file name
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const fileExt = file.name.split('.').pop();
    const fileName = `${documentType}_${timestamp}_${randomString}.${fileExt}`;
    const filePath = `${documentType}/${fileName}`;

    // Convert File to ArrayBuffer then to Buffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json(
        {
          success: false,
          error: `Upload failed: ${uploadError.message}`,
        },
        { status: 500 }
      );
    }

    // Get public URL (even though bucket is private, we need the URL structure)
    const { data: urlData } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    // For private buckets, we'll store the path and generate signed URLs when needed
    const fileUrl = urlData.publicUrl;

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        fileName,
        filePath,
        fileUrl,
        fileSize: file.size,
        fileType: file.type,
        documentType,
      },
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve signed URL for private document
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('filePath');

    if (!filePath) {
      return NextResponse.json(
        { success: false, error: 'File path required' },
        { status: 400 }
      );
    }

    // Generate signed URL valid for 1 hour
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(filePath, 3600);

    if (error) {
      console.error('Signed URL error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to generate signed URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      signedUrl: data.signedUrl,
    });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get signed URL',
      },
      { status: 500 }
    );
  }
}
