'use client';

// Constants for modern image optimization
const DEFAULT_QUALITY = 0.92;        // High quality for modern content
const DEFAULT_MAX_WIDTH = 2560;      // Support higher resolutions
const DEFAULT_MAX_HEIGHT = 1440;     // Support higher resolutions
const MAX_FILE_SIZE_MB = 3;          // 3MB max for high quality
const QUALITY_THRESHOLDS = {
  HIGH_QUALITY: 0.95,     // For photos with fine details
  STANDARD: 0.92,         // Default high quality
  COMPRESSED: 0.85,       // For large files that need compression
  MINIMUM: 0.75           // Absolute minimum acceptable quality
};

export interface ImageUploadOptions {
  maxSizeKB?: number;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'svg';
}

export interface UploadResult {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
  optimizedSize?: number;
}

export interface ImageMetadata {
  originalName: string;
  originalSize: number;
  optimizedSize: number;
  dimensions: { width: number; height: number };
  format: string;
}

/**
 * Modern adaptive image compression with quality preservation
 * Skips compression for files under 2MB to preserve original quality
 */
export async function compressImage(
  file: File, 
  options: ImageUploadOptions = {}
): Promise<{ file: File; metadata: ImageMetadata }> {
  const {
    maxWidth = DEFAULT_MAX_WIDTH,
    maxHeight = DEFAULT_MAX_HEIGHT,
    quality = DEFAULT_QUALITY,
    format = 'webp'
  } = options;

  // Skip compression for files under 2MB - preserve original quality
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB < 2) {
    console.log(`Skipping compression for ${file.name} (${fileSizeMB.toFixed(2)}MB < 2MB)`);
    
    const metadata: ImageMetadata = {
      originalName: file.name,
      originalSize: file.size,
      optimizedSize: file.size, // Same size since no compression
      dimensions: await getImageDimensions(file),
      format: file.type.split('/')[1] || 'unknown'
    };

    return Promise.resolve({ file, metadata });
  }

  console.log(`Compressing ${file.name} (${fileSizeMB.toFixed(2)}MB >= 2MB)`);

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = async () => {
      try {
        // Calculate optimal dimensions
        const { width: newWidth, height: newHeight } = calculateDimensions(
          img.width, 
          img.height, 
          maxWidth, 
          maxHeight
        );

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Use high-quality rendering
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, newWidth, newHeight);
        }

        // Determine optimal quality based on image characteristics
        const optimalQuality = await determineOptimalQuality(
          file, 
          newWidth, 
          newHeight, 
          quality
        );

        // Try multiple compression attempts for best quality/size balance
        const result = await compressWithAdaptiveQuality(
          canvas, 
          file.name, 
          format, 
          optimalQuality,
          file.size
        );

        const metadata: ImageMetadata = {
          originalName: file.name,
          originalSize: file.size,
          optimizedSize: result.size,
          dimensions: { width: newWidth, height: newHeight },
          format: format
        };

        resolve({ file: result, metadata });
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Determine optimal quality based on image characteristics
 */
async function determineOptimalQuality(
  file: File,
  width: number,
  height: number,
  requestedQuality: number
): Promise<number> {
  const fileSizeMB = file.size / (1024 * 1024);
  const megapixels = (width * height) / 1000000;
  
  // High-resolution images can use slightly lower quality without visible loss
  if (megapixels > 8) {
    return Math.max(QUALITY_THRESHOLDS.STANDARD, requestedQuality);
  }
  
  // Medium resolution - use high quality
  if (megapixels > 2) {
    return Math.max(QUALITY_THRESHOLDS.HIGH_QUALITY, requestedQuality);
  }
  
  // Small images - preserve maximum quality
  return QUALITY_THRESHOLDS.HIGH_QUALITY;
}

/**
 * Adaptive compression with multiple quality attempts
 */
async function compressWithAdaptiveQuality(
  canvas: HTMLCanvasElement,
  fileName: string,
  format: string,
  targetQuality: number,
  originalSize: number
): Promise<File> {
  const maxSizeBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
  
  // Start with high quality
  let currentQuality = targetQuality;
  let attempts = 0;
  const maxAttempts = 4;

  while (attempts < maxAttempts) {
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, `image/${format}`, currentQuality);
    });

    if (!blob) {
      throw new Error('Failed to compress image');
    }

    // If size is acceptable or we're at minimum quality, use this result
    if (blob.size <= maxSizeBytes || currentQuality <= QUALITY_THRESHOLDS.MINIMUM) {
      return new File([blob], fileName, {
        type: `image/${format}`,
        lastModified: Date.now(),
      });
    }

    // Reduce quality for next attempt
    currentQuality = Math.max(
      QUALITY_THRESHOLDS.MINIMUM,
      currentQuality - 0.1
    );
    attempts++;
  }

  // Fallback - return the last attempt
  const finalBlob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, `image/${format}`, QUALITY_THRESHOLDS.MINIMUM);
  });

  if (!finalBlob) {
    throw new Error('Failed to compress image');
  }

  return new File([finalBlob], fileName, {
    type: `image/${format}`,
    lastModified: Date.now(),
  });
}

/**
 * Get image dimensions without compression
 */
async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src); // Clean up
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for dimension calculation'));
    };
    
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Upload image directly to Cloudinary using unsigned upload
 * Clean, simple implementation - user context stored in database later
 */
export async function uploadToCloudinary(file: File): Promise<UploadResult> {
  try {
    // Get environment variables
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'unsigned';

    if (!cloudName || !uploadPreset) {
      throw new Error('Missing Cloudinary configuration. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET');
    }

    // Simple FormData - let Cloudinary handle public_id generation
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    // Note: No transformations - they're configured in the upload preset
    // Note: No public_id - Cloudinary will auto-generate a unique one
    // Note: No user context - we'll store that in our database

    // Direct upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      optimizedSize: file.size
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

/**
 * Save image metadata to Supabase with user context
 * This is where we store the relationship between user and uploaded image
 */
export async function saveImageMetadata(
  imageUrl: string,
  publicId: string,
  metadata: ImageMetadata, 
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: imageUrl,
        public_id: publicId,
        original_name: metadata.originalName,
        original_size: metadata.originalSize,
        optimized_size: metadata.optimizedSize,
        width: metadata.dimensions.width,
        height: metadata.dimensions.height,
        format: metadata.format,
        user_id: userId, // This is where we store user context
        uploaded_at: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save image metadata');
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save metadata'
    };
  }
}

/**
 * Complete image upload process with optimization and database storage
 * This is a convenience function that handles the entire workflow
 */
export async function uploadImage(
  file: File, 
  userId: string,
  options: ImageUploadOptions = {}
): Promise<UploadResult & { metadata?: ImageMetadata }> {
  try {
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Step 1: Compress image
    const { file: compressedFile, metadata } = await compressImage(file, options);

    // Step 2: Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(compressedFile);
    
    if (!uploadResult.success) {
      return uploadResult;
    }

    // Step 3: Save metadata to Supabase with user context
    if (uploadResult.url && uploadResult.publicId) {
      const saveResult = await saveImageMetadata(
        uploadResult.url, 
        uploadResult.publicId,
        metadata, 
        userId
      );
      
      if (!saveResult.success) {
        console.warn('Failed to save image metadata:', saveResult.error);
        // Don't fail the entire upload if metadata save fails
      }
    }

    return {
      ...uploadResult,
      metadata,
      optimizedSize: metadata.optimizedSize
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload process failed'
    };
  }
}

/**
 * Validate file before upload
 */
function validateFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'File must be an image' };
    }

    // Check file size (10MB max for free tier)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB' };
    }

    // Check supported formats
    const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg'];
    if (!supportedFormats.includes(file.type)) {
      return { valid: false, error: 'Unsupported file format' };
    }

  return { valid: true };
}

/**
 * Calculate optimal dimensions maintaining aspect ratio
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight };

    // Scale down if necessary
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

  return { width: Math.round(width), height: Math.round(height) };
}

/**
 * Generate optimized Cloudinary URL with transformations
 */
export function generateOptimizedUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: 'auto' | number;
    format?: 'auto' | string;
    crop?: 'fill' | 'fit' | 'scale';
  } = {}
): string {
    const {
      width = 800,
      height = 600,
      quality = 'auto',
      format = 'auto',
      crop = 'fit'
    } = options;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const transformations = [
      `w_${width}`,
      `h_${height}`,
      `c_${crop}`,
      `q_${quality}`,
      `f_${format}`
    ].join(',');

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`;
}

/**
 * Clean up object URLs to prevent memory leaks
 */
export function cleanupObjectUrl(url: string): void {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}
