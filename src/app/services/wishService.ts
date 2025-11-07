import { createClient } from '@/app/database/supabase/client';
import type { BestWish } from '@/app/utils/types';

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
        .select('id, text, author, image_url, created_at, user_id')
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
  try {
    const response = await fetch('/api/wishes', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: id,
        is_deleted: true
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete wish');
    }

    // Clear cache after successful deletion
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('Error deleting wish:', error);
    throw error;
  }
}