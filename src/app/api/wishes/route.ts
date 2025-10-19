import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/database/supabase/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data, error } = await supabase
      .from('best_wishes')
      .select('*')
      .eq('is_approved', true)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({ wishes: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch wishes' + error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/wishes - Starting request processing');
    
    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json(
        { error: 'Server configuration error: Missing Supabase credentials' },
        { status: 500 }
      );
    }
    
    // Get auth info
    const { userId } = await auth();
    console.log('Auth userId:', userId);
    
    // Parse request body
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    // Validate required fields
    if (!body.text || !body.author) {
      console.log('Missing required fields - text:', !!body.text, 'author:', !!body.author);
      return NextResponse.json(
        { error: 'Missing required fields: text and author are required' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();
    console.log('Supabase client created');

    const wishData = {
      text: body.text,
      author: body.author,
      user_id: userId || null,
      image_url: body.image_url || null,
      image_filename: body.image_filename || null,
      image_size: body.image_size || null,
      is_approved: true, // Auto-approve wishes for event
      is_deleted: false,  // Default to not deleted
      event_id: null,     // Default to no specific event
    };
    
    console.log('Wish data to insert:', JSON.stringify(wishData, null, 2));

    const { data, error } = await supabase
      .from('best_wishes')
      .insert([wishData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log('Successfully created wish:', data);
    return NextResponse.json({ wish: data }, { status: 201 });
  } catch (error) {
    console.error('POST /api/wishes error:', error);
    
    // Return more specific error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Error && 'details' in error ? error.details : null;
    
    return NextResponse.json(
      { 
        error: 'Failed to create wish',
        message: errorMessage,
        details: errorDetails
      },
      { status: 500 }
    );
  }
}