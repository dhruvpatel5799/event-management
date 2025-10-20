'use client';

// Constants for modern image optimization
const DEFAULT_QUALITY = 0.92;        // High quality for modern content
const DEFAULT_MAX_WIDTH = 2560;      // Support higher resolutions
const DEFAULT_MAX_HEIGHT = 1440;     // Support higher resolutions
const MAX_FILE_SIZE_MB = 2;          // 2MB max for high quality
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
          newWidth, 
          newHeight, 
          quality
        );

        // Try multiple compression attempts for best quality/size balance
        const result = await compressWithAdaptiveQuality(
          canvas, 
          file.name, 
          format, 
          optimalQuality
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
  width: number,
  height: number,
  requestedQuality: number
): Promise<number> {
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
  targetQuality: number
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
export async function uploadToCloudinary(file: File, folder?: string): Promise<UploadResult> {
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
    if (folder) formData.append('folder', folder);
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
 * Clean up object URLs to prevent memory leaks
 */
export function cleanupObjectUrl(url: string): void {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}
