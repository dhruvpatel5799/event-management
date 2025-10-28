'use client';

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
  optimizedSize?: number;
  dimensions: { width: number; height: number };
  format: string;
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
      optimizedSize: result.bytes
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

/**
 * Clean up object URLs to prevent memory leaks
 */
export function cleanupObjectUrl(url: string): void {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}
