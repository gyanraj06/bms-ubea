import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("gallery_images")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, images: data });
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const uploaded_by = formData.get("uploaded_by") as string;
    const width = formData.get("width") ? parseInt(formData.get("width") as string) : null;
    const height = formData.get("height") ? parseInt(formData.get("height") as string) : null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Check count limit
    const { count, error: countError } = await supabaseAdmin
        .from("gallery_images")
        .select("*", { count: 'exact', head: true });
    
    if (countError) throw countError;

    if (count !== null && count >= 20) {
         return NextResponse.json(
        { success: false, error: "Gallery limit reached (max 20 images). Please delete some images first." },
        { status: 400 }
      );
    }

    // Check size limit (1MB = 1048576 bytes)
    if (file.size > 1048576) {
        return NextResponse.json(
            { success: false, error: "File size exceeds 1MB limit." },
            { status: 400 }
          );
    }

    // Upload to Supabase Storage
    const fileExt = file.name.split(".").pop();
    const fileName = `gallery-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("gallery") // Ensure this bucket exists
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from("gallery")
      .getPublicUrl(filePath);

    // Save to Database
    const { data, error: dbError } = await supabaseAdmin
      .from("gallery_images")
      .insert([
        {
          image_url: publicUrl,
          storage_path: filePath,
          uploaded_by,
          width,
          height
        },
      ])
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({ success: true, image: data });
  } catch (error: any) {
    console.error("Error uploading gallery image:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Image ID is required" },
        { status: 400 }
      );
    }

    // Get storage path first
    const { data: image, error: fetchError } = await supabaseAdmin
      .from("gallery_images")
      .select("storage_path")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    // Delete from Storage
    if (image?.storage_path) {
      const { error: storageError } = await supabaseAdmin.storage
        .from("gallery")
        .remove([image.storage_path]);
      
      if (storageError) {
          console.error("Error removing from storage:", storageError);
          // Continue to delete from DB even if storage fails? 
          // Better to log and proceed to keep DB clean, or fail? 
          // Use soft delete? No, just proceed.
      }
    }

    // Delete from Database
    const { error: deleteError } = await supabaseAdmin
      .from("gallery_images")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true, message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting gallery image:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
