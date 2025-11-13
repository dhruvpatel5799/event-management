import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/app/database/supabase/server';
import { auth } from '@clerk/nextjs/server';
import { BestWish } from '@/app/utils/types';

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

export async function PUT(request: NextRequest) {
  try {
    // Get auth info
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: User must be logged in to update wishes' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.id) {
      return NextResponse.json(
        { error: 'Missing required field: id is required to update a wish' },
        { status: 400 }
      );
    }
    
    const supabase = await createAdminClient();

    // First, verify the wish exists and belongs to the user
    const { data: existingWish, error: fetchError } = await supabase
      .from('best_wishes')
      .select('id, user_id, is_deleted')
      .eq('id', body.id)
      .single();      
    
    if (fetchError || !existingWish) {
      return NextResponse.json(
        { error: 'Wish not found' },
        { status: 404 }
      );
    }
    
    if (existingWish.is_deleted) {
      return NextResponse.json(
        { error: 'Cannot update deleted wish' },
        { status: 400 }
      );
    }
    
    // Check if user owns the wish
    if (existingWish.user_id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden: You can only update your own wishes' },
        { status: 403 }
      );
    }
    
    // Prepare update data (only allow certain fields to be updated)
    const allowedUpdates: Partial<BestWish> = {};
    
    if (body.text !== undefined) allowedUpdates.text = body.text;
    if (body.author !== undefined) allowedUpdates.author = body.author;
    if (body.image_url !== undefined) allowedUpdates.image_url = body.image_url;
    if (body.image_filename !== undefined) allowedUpdates.image_filename = body.image_filename;
    if (body.image_size !== undefined) allowedUpdates.image_size = body.image_size;
    if (body.is_deleted !== undefined) allowedUpdates.is_deleted = body.is_deleted;
    
    // Add updated_at timestamp
    allowedUpdates.updated_at = new Date().toISOString();
    
    // Validate that at least one field is being updated
    if (Object.keys(allowedUpdates).length === 1) { // Only updated_at
      return NextResponse.json(
        { error: 'No valid fields provided for update' },
        { status: 400 }
      );
    }
    
    // Perform the update
    const { data, error } = await supabase
      .from('best_wishes')
      .update(allowedUpdates)
      .eq('id', body.id)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({ wish: data }, { status: 200 });
  } catch (error) {
    console.error('PUT /api/wishes error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to update wish',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}