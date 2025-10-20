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
      original_name,
      original_size,
      optimized_size,
      width,
      height,
      format,
      user_id
    } = body;

    // Validate required fields
    if (!image_url || !original_name || !public_id) {
      return NextResponse.json(
        { error: 'Missing required fields: image_url, original_name, and public_id are required' },
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
          original_name,
          original_size: original_size || null,
          optimized_size: optimized_size || null,
          width: width || null,
          height: height || null,
          format: format || null,
          user_id: user_id || userId,
          uploaded_at: new Date().toISOString(),
          is_deleted: false,
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

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const userOnly = searchParams.get('user_only') === 'true';

    // Create Supabase client
    const supabase = await createClient();

    // Build query
    let query = supabase
      .from('uploaded_images')
      .select('*')
      .eq('is_deleted', false)
      .order('uploaded_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by user if requested
    if (userOnly) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch images' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      images: data,
      count: data.length 
    });

  } catch (error) {
    console.error('Image fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}