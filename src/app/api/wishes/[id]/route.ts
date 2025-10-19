import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/database/supabase/server';
import { auth } from '@clerk/nextjs/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const supabase = await createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('best_wishes')
      .update(body)
      .eq('id', (await params).id)
      .eq('user_id', userId) // Users can only update their own wishes
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ wish: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update wish' + error },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const supabase = await createClient();

    const { error } = await supabase
      .from('best_wishes')
      .update({ is_deleted: true })
      .eq('id', (await params).id)
      .eq('user_id', userId);

    if (error) throw error;

    return NextResponse.json({ message: 'Wish deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete wish' + error },
      { status: 500 }
    );
  }
}