'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { getGalleryImages, generateFullImageUrl, type GalleryImage } from '@/app/services/galleryService';

interface ImageFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialImageIndex: number;
  allImages: Array<{
    public_id: string;
    src: string;
    uploaded_at?: string;
    alt: string;
    isStatic?: boolean;
  }>;
  onImageChange: (newIndex: number) => void;
}

interface FeedImage extends GalleryImage {
  username: string;
}

// Simple SVG icons as components
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default function ImageFeedModal({ isOpen, onClose, initialImageIndex, allImages, onImageChange }: ImageFeedModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialImageIndex);
  const [feedImages, setFeedImages] = useState<FeedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    setCurrentIndex(initialImageIndex);
  }, [initialImageIndex]);

  // Convert initial images to feed format
  const convertToFeedImages = useCallback((images: typeof allImages): FeedImage[] => {
    return images.map((img) => ({
      public_id: img.public_id,
      image_url: img.src,
      username: 'Event Gallery',
      uploaded_at: img.uploaded_at ?? '',
    }));
  }, []);

  // Initialize feed with current images
  useEffect(() => {
    if (isOpen && allImages.length > 0) {
      const initialFeed = convertToFeedImages(allImages);
      setFeedImages(initialFeed);
      setCurrentIndex(initialImageIndex);
    }
  }, [isOpen, allImages, initialImageIndex, convertToFeedImages]);

  // Load more images for infinite scroll
  const loadMoreImages = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const newImages = await getGalleryImages(10, offset + allImages.length);
      if (newImages.length === 0) {
        setHasMore(false);
        return;
      }

      const newFeedImages: FeedImage[] = newImages.map((img, index) => ({
        ...img,
        username: `Guest ${offset + allImages.length + index + 1}`,
        uploaded_at: newImages[index].uploaded_at,
      }));

      setFeedImages(prev => [...prev, ...newFeedImages]);
      setOffset(prev => prev + newImages.length);
    } catch (error) {
      console.error('Failed to load more images:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, offset, allImages.length]);

  // Handle scroll for infinite loading
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;
    
    // Load more images when near bottom
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      loadMoreImages();
    }
  
    // Update current index based on scroll position
    const newIndex = Math.round(scrollTop / clientHeight);
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < feedImages.length) {
      setCurrentIndex(newIndex);
      
      // Only call onImageChange if the index is valid
      if (onImageChange && newIndex < allImages.length) {
        onImageChange(newIndex);
      }
    }
  }, [loadMoreImages, currentIndex, feedImages.length, onImageChange, allImages.length]);

  // Scroll to the selected image when modal opens
useEffect(() => {
    if (isOpen && feedImages.length > 0 && containerRef.current) {
      // Small delay to ensure the modal is fully rendered
      const timer = setTimeout(() => {
        const targetElement = containerRef.current?.children[initialImageIndex] as HTMLElement;
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'instant', block: 'start' });
          setCurrentIndex(initialImageIndex);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, feedImages.length, initialImageIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowUp' && currentIndex > 0) {
        const newIndex = currentIndex - 1;
        setCurrentIndex(newIndex);
        if (containerRef.current) {
          containerRef.current.scrollTop = newIndex * window.innerHeight;
        }
        // Update URL
        if (onImageChange) {
          onImageChange(newIndex);
        }
      } else if (e.key === 'ArrowDown' && currentIndex < feedImages.length - 1) {
        const newIndex = currentIndex + 1;
        setCurrentIndex(newIndex);
        if (containerRef.current) {
          containerRef.current.scrollTop = newIndex * window.innerHeight;
        }
        // Update URL
        if (onImageChange) {
          onImageChange(newIndex);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, currentIndex, feedImages.length, onClose, onImageChange]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-60 text-white hover:text-gray-300 transition-colors p-2"
        aria-label="Close modal"
      >
        <CloseIcon />
      </button>

      {/* Feed container */}
      <div className="w-full h-full bg-black overflow-hidden">
        <div
          ref={containerRef}
          className="h-full overflow-y-auto"
          onScroll={handleScroll}
          style={{ 
            scrollSnapType: 'y mandatory',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none'
          }}
        >
          {feedImages.map((image, index) => (
            <div
              key={image.public_id}
              className="min-h-screen flex flex-col bg-black text-white relative"
              style={{ scrollSnapAlign: 'start' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full p-0.5">
                    <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        {image.username[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-white">{image.username}</p>
                    <p className="text-xs text-gray-400">{image.uploaded_at}</p>
                  </div>
                </div>
              </div>

              {/* Image */}
              <div className="flex-1 relative">
                <Image
                  src={generateFullImageUrl(image.image_url)}
                  alt={`Feed image ${index + 1}`}
                  fill
                  className="object-contain"
                  priority={index <= 2}
                  //sizes="(max-width: 768px) 100vw, 448px"
                />
              </div>

              {/* Bottom info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="space-y-2">
                  <p className="text-sm text-white">
                    <span className="font-semibold">{image.username}</span>
                    <span className="ml-2 text-gray-300">
                      {image.username.includes('Event') 
                        ? 'Beautiful memories from our special event ✨' 
                        : 'What an amazing moment! 📸'
                      }
                    </span>
                  </p>
                  <p className="text-xs text-gray-400">{image.uploaded_at}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* End of feed message */}
          {!hasMore && !loading && (
            <div className="flex items-center justify-center py-8 text-gray-400">
              <p className="text-sm">You&apos;ve reached the end of the gallery</p>
            </div>
          )}
        </div>
      </div>

      {/* Swipe hint for mobile */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/50 text-xs text-center md:hidden">
        Swipe up/down to navigate
      </div>
    </div>
  );
}
