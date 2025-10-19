import { createClient } from '@/app/database/supabase/client';
import type { BestWish, CreateWishRequest } from '@/app/utils/types';

const supabase = createClient();

/**
 * Fetch all approved wishes
 */
export async function getWishes(limit = 50, offset = 0): Promise<BestWish[]> {
    const { data, error } = await supabase
      .from('best_wishes')
      .select('*')
      .eq('is_approved', true)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

  if (error) throw error;
  return data || [];
}

/**
 * Create a new wish
 */
export async function createWish(wish: CreateWishRequest): Promise<BestWish> {
    const { data, error } = await supabase
      .from('best_wishes')
      .insert([wish])
      .select()
      .single();

  if (error) throw error;
  return data;
}

/**
 * Get wishes by user
 */
export async function getUserWishes(userId: string): Promise<BestWish[]> {
    const { data, error } = await supabase
      .from('best_wishes')
      .select('*')
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Update wish
 */
export async function updateWish(id: string, updates: Partial<BestWish>): Promise<BestWish> {
    const { data, error } = await supabase
      .from('best_wishes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

  if (error) throw error;
  return data;
}

/**
 * Soft delete wish
 */
export async function deleteWish(id: string): Promise<void> {
    const { error } = await supabase
      .from('best_wishes')
      .update({ is_deleted: true })
      .eq('id', id);

  if (error) throw error;
}