import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@/app/database/supabase/server';

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