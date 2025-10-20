import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/database/supabase/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    // Get auth info
    const { userId } = await auth();
    
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.text || !body.author) {
      return NextResponse.json(
        { error: 'Missing required fields: text and author are required' },
        { status: 400 }
      );
    }
    
    const supabase = await createClient();

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
    
    const { data, error } = await supabase
      .from('best_wishes')
      .insert([wishData])
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json({ wish: data }, { status: 201 });
  } catch (error) {
    console.error('POST /api/wishes error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create wish',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}