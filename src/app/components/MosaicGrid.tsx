'use client';
import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { getUserImages, generateThumbnailUrl } from '@/app/services/galleryService';

interface UserImage {
  public_id: string;
  image_url: string;
  uploaded_at: string;
}

interface UserImageGridProps {
  onImageDeleted?: () => void;
  refreshTrigger?: number; // To trigger refresh from parent
}

export default function UserImageGrid({ onImageDeleted, refreshTrigger }: UserImageGridProps) {
  const { user } = useUser();
  const [images, setImages] = useState<UserImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  // Load user images
  const loadUserImages = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const userImages = await getUserImages(user.id);
      setImages(userImages);
    } catch (error) {
      console.error('Failed to load user images:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Initial load and refresh on trigger
  useEffect(() => {
    if (user?.id) {
      loadUserImages();
    }
  }, [user?.id, loadUserImages, refreshTrigger]);

  // Delete image function
  const handleDeleteImage = async (imageId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent image click
    
    if (!confirm('Are you sure you want to delete this image?')) return;
    
    setDeletingIds(prev => new Set(prev).add(imageId));
    
    try {
      const response = await fetch(`/api/images?id=${imageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete image');
      }

      // Remove from local state
      setImages(prev => prev.filter(img => img.public_id !== imageId));
      onImageDeleted?.();
      
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete image. Please try again.');
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageId);
        return newSet;
      });
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">My Photos</h3>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">My Photos</h3>
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-lg font-medium">No photos yet</p>
          <p className="text-sm">Upload some photos to see them here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          My Photos ({images.length})
        </h3>
        <button
          onClick={loadUserImages}
          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          Refresh
        </button>
      </div>
      
      {/* Instagram-style Mosaic Grid */}
      <div className="grid grid-cols-3 gap-1 md:gap-2">
        {images.map((image, index) => {
          const isDeleting = deletingIds.has(image.public_id);
          
          return (
            <div 
              key={image.public_id} 
              className="relative group aspect-square"
            >
              <Image
                src={generateThumbnailUrl(image.image_url)}
                alt={`User photo ${index + 1}`}
                fill
                className={`object-cover rounded-lg transition-all duration-200 ${
                  isDeleting ? 'opacity-50 grayscale' : 'group-hover:opacity-90'
                }`}
                sizes="(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 20vw"
              />
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg" />
              
              {/* Delete button */}
              <button
                onClick={(e) => handleDeleteImage(image.public_id, e)}
                disabled={isDeleting}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-full p-1.5 shadow-lg transition-all duration-200 
                  md:opacity-0 md:group-hover:opacity-100 
                  opacity-80 active:opacity-100"
                title="Delete image"
              >
                {isDeleting ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>

              {/* Upload date overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-b-lg">
                <p className="text-xs text-white font-medium">
                  {new Date(image.uploaded_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}