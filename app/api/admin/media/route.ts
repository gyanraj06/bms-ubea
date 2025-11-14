import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Fetch media
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const room_id = searchParams.get('room_id');

    let query = supabaseAdmin
      .from('media')
      .select('*')
      .order('display_order', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    if (room_id) {
      query = query.eq('room_id', room_id);
    }

    const { data: media, error } = await query;

    if (error) {
      console.error('Error fetching media:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch media', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      media: media || [],
    });
  } catch (error: any) {
    console.error('GET media error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch media', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Upload media
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string;
    const room_id = formData.get('room_id') as string | null;
    const title = formData.get('title') as string | null;
    const description = formData.get('description') as string | null;
    const alt_text = formData.get('alt_text') as string | null;
    const is_featured = formData.get('is_featured') === 'true';
    const uploaded_by = formData.get('uploaded_by') as string;

    if (!file || !category || !uploaded_by) {
      return NextResponse.json(
        { success: false, error: 'File, category, and uploaded_by are required' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${category.toLowerCase()}_${timestamp}.${fileExt}`;
    const filePath = `property-media/${category.toLowerCase()}/${fileName}`;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('property-media')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { success: false, error: 'Failed to upload file', details: uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('property-media')
      .getPublicUrl(filePath);

    // Get display order (next available)
    const { data: existingMedia } = await supabaseAdmin
      .from('media')
      .select('display_order')
      .eq('category', category)
      .order('display_order', { ascending: false })
      .limit(1);

    const display_order = existingMedia && existingMedia.length > 0
      ? existingMedia[0].display_order + 1
      : 0;

    // Insert media record
    const { data: mediaRecord, error: dbError } = await supabaseAdmin
      .from('media')
      .insert({
        file_name: fileName,
        file_path: filePath,
        file_url: publicUrl,
        file_size: file.size,
        file_type: file.type,
        category,
        room_id: room_id || null,
        title: title || null,
        description: description || null,
        alt_text: alt_text || file.name,
        is_featured,
        display_order,
        uploaded_by,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Cleanup: delete uploaded file
      await supabaseAdmin.storage.from('property-media').remove([filePath]);
      return NextResponse.json(
        { success: false, error: 'Failed to save media record', details: dbError.message },
        { status: 500 }
      );
    }

    // If this media is for a room, update the room's images array
    if (room_id) {
      const { data: room } = await supabaseAdmin
        .from('rooms')
        .select('images')
        .eq('id', room_id)
        .single();

      if (room) {
        const updatedImages = [...(room.images || []), publicUrl];
        await supabaseAdmin
          .from('rooms')
          .update({ images: updatedImages, updated_at: new Date().toISOString() })
          .eq('id', room_id);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Media uploaded successfully',
      media: mediaRecord,
    });
  } catch (error: any) {
    console.error('POST media error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload media', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete media
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Media ID is required' },
        { status: 400 }
      );
    }

    // Get media record
    const { data: media, error: fetchError } = await supabaseAdmin
      .from('media')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !media) {
      return NextResponse.json(
        { success: false, error: 'Media not found' },
        { status: 404 }
      );
    }

    // Delete from storage
    const { error: storageError } = await supabaseAdmin.storage
      .from('property-media')
      .remove([media.file_path]);

    if (storageError) {
      console.error('Storage delete error:', storageError);
    }

    // If this media is linked to a room, remove from room's images array
    if (media.room_id) {
      const { data: room } = await supabaseAdmin
        .from('rooms')
        .select('images')
        .eq('id', media.room_id)
        .single();

      if (room) {
        const updatedImages = (room.images || []).filter((url: string) => url !== media.file_url);
        await supabaseAdmin
          .from('rooms')
          .update({ images: updatedImages, updated_at: new Date().toISOString() })
          .eq('id', media.room_id);
      }
    }

    // Delete from database
    const { error: deleteError } = await supabaseAdmin
      .from('media')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Database delete error:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete media record', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Media deleted successfully',
    });
  } catch (error: any) {
    console.error('DELETE media error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete media', details: error.message },
      { status: 500 }
    );
  }
}
