import { createClient } from '@/app/database/supabase/client';
import type { BestWish, CreateWishRequest } from '@/app/utils/types';

const supabase = createClient();

const CACHE_KEY = 'wishes_cache';
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

/**
 * Fetch all approved wishes
 */
export async function getWishes(limit = 50, offset = 0): Promise<BestWish[]> {
    // TODO: Improve cache management and invalidation mechanism
    const cachedData = localStorage.getItem(CACHE_KEY);
    let cachedWishes: BestWish[] = [];
    if (cachedData) {
      const { wishes, timestamp } = JSON.parse(cachedData);
      if (Date.now() - timestamp < CACHE_TTL) return wishes as BestWish[];
      cachedWishes = wishes as BestWish[];
    }

    try {
      const { data, error } = await supabase
        .from('best_wishes')
        .select('id, text, author, image_url, created_at')
        .eq('is_approved', true)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) throw error;
  
      localStorage.setItem(CACHE_KEY, JSON.stringify({ wishes: data as BestWish[], timestamp: Date.now() }));
      return data as BestWish[] || [];
    }
    catch (error) {
      if (cachedWishes.length > 0) return cachedWishes;
      throw error;
    }
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