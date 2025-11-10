import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient, createAdminClient } from '@/app/database/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      image_url,
      public_id,
      user_id
    } = body;

    // Validate required fields
    if (!image_url || !public_id) {
      return NextResponse.json(
        { error: 'Missing required fields: image_url and public_id are required' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = await createClient();

    // Insert image metadata
    const { data, error } = await supabase
      .from('uploaded_images')
      .insert([
        {
          image_url,
          public_id,
          user_id: user_id || userId,
          uploaded_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save image metadata' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      image: data 
    }, { status: 201 });

  } catch (error) {
    console.error('Image metadata save error:', error);
    return NextResponse.json(
      { error: 'Failed to save image metadata' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get image ID from URL search params
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('id');

    if (!imageId) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = await createAdminClient();

    // First, verify the user owns this image
    const { data: imageData, error: fetchError } = await supabase
      .from('uploaded_images')
      .select('id, user_id, public_id')
      .eq('public_id', imageId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !imageData) {
      return NextResponse.json(
        { error: 'Image not found or access denied' },
        { status: 404 }
      );
    }
    
    // Delete the image in database
    const { error: deleteError } = await supabase
      .from('uploaded_images')
      .delete()
      .eq('public_id', imageId)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Database deletion error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete image' },
        { status: 500 }
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);

    const crypto = await import("crypto");
    const signature = crypto
      .createHash("sha1")
      .update(`public_id=${imageId}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`)
      .digest("hex");

    const formData = new URLSearchParams();
    formData.append("public_id", imageId);
    formData.append("signature", signature);
    formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ?? '');
    formData.append("timestamp", timestamp.toString());
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/destroy`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (data.result !== "ok") {
      return NextResponse.json({ error: "Failed to delete image", details: data }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Image deleted successfully' 
    });

  } catch (error) {
    console.error('Image deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}