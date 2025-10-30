import { createClient } from '@/app/database/supabase/client';

interface CloudinaryOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'limit' | 'scale';
  gravity?: 'auto' | 'center' | 'face';
  quality?: string;
  format?: string;
  dpr?: 'auto' | number;
}

export interface GalleryImage {
  id: string;
  image_url: string;
}

const supabase = createClient();

// ========== IMAGE TRANSFORMATION UTILITIES ==========

/**
 * Insert a Cloudinary transformation into the URL right after '/upload/'.
 */
function applyTransformation(url: string, transformation: string): string {
  if (!url.includes('/upload/')) return url;
  return url.replace('/upload/', `/upload/${transformation}/`);
}

/**
 * Build transformation string from options.
 * These are delivery-time transforms (your upload preset already handles base optimization).
 */
function buildTransformation({
  width,
  height,
  crop = 'fill',
  gravity = 'auto',
  quality = 'auto',
  format = 'auto',
  dpr = 'auto'
}: CloudinaryOptions): string {
  return [
    `c_${crop}`,
    `g_${gravity}`,
    width && `w_${width}`,
    height && `h_${height}`,
    `q_${quality}`,
    `f_${format}`,
    `dpr_${dpr}`
  ]
    .filter(Boolean)
    .join(',');
}

/**
 * Generate thumbnail URL from Cloudinary public URL
 */
export function generateThumbnailUrl(
    imageUrl: string,
    options: CloudinaryOptions = {}
  ): string {
    const transformation = buildTransformation({
      width: options.width ?? 400,
      height: options.height ?? 400,
      crop: options.crop ?? 'fill',
      gravity: options.gravity ?? 'auto',
      quality: options.quality ?? 'auto:low', // slightly more aggressive for thumbnails
      format: options.format ?? 'auto',
      dpr: options.dpr ?? 'auto'
    });
  
    return applyTransformation(imageUrl, transformation);
  }

/**
 * Generate full display image URL — mild optimization for delivery.
 */
export function generateFullImageUrl(imageUrl: string): string {
  return applyTransformation(imageUrl, 'q_auto,f_auto,dpr_auto');
}


// ========== DATA OPERATIONS ==========

/**
 * Fetch all non-deleted images
 */
export async function getGalleryImages(limit = 20, offset = 0): Promise<GalleryImage[]> {
  const { data, error } = await supabase
    .from('uploaded_images')
    .select('id, image_url')
    .eq('is_deleted', false)
    .order('uploaded_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) throw error;
  return data || [];
}

/**
 * Get images by user
 */
export async function getUserImages(userId: string): Promise<GalleryImage[]> {
  const { data, error } = await supabase
    .from('uploaded_images')
    .select('id, image_url')
    .eq('user_id', userId)
    .eq('is_deleted', false)
    .order('uploaded_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

/**
 * Soft delete image
 */
export async function deleteImage(id: string): Promise<void> {
  const { error } = await supabase
    .from('uploaded_images')
    .update({ is_deleted: true })
    .eq('id', id);
  
  if (error) throw error;
}
