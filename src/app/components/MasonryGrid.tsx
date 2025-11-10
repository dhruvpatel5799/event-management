'use client';
import { useState, useEffect } from 'react';
import img1 from '@/app/pics/1.jpg';
import img2 from '@/app/pics/2.jpg';
import img3 from '@/app/pics/3.jpg';
import img4 from '@/app/pics/4.jpg';
import img5 from '@/app/pics/5.jpg';
import img6 from '@/app/pics/6.jpg';
import img7 from '@/app/pics/7.jpg';
import img8 from '@/app/pics/8.jpg';
import img9 from '@/app/pics/9.jpg';
import img10 from '@/app/pics/10.jpg';
import img11 from '@/app/pics/11.jpg';
import img12 from '@/app/pics/12.jpg';
import img13 from '@/app/pics/13.jpg';
import img14 from '@/app/pics/14.jpg';
import img15 from '@/app/pics/15.jpg';
import img16 from '@/app/pics/16.jpg';
import img17 from '@/app/pics/17.jpg';
import img18 from '@/app/pics/18.jpg';
import img19 from '@/app/pics/19.jpg';
import img20 from '@/app/pics/20.jpg';
import img21 from '@/app/pics/21.jpg';
import Image from 'next/image';
import { getGalleryImages, generateThumbnailUrl, type GalleryImage } from '@/app/services/galleryService';
import ImageFeedModal from '@/app/components/ImageFeedModal';
import { useSearchParams,  } from 'next/navigation';

interface ImageData {
  public_id: string;
  src: string;
  alt: string;
  isStatic?: boolean;
}

const MasonryGrid = () => {
  const searchParams = useSearchParams();
  // Static images as initial content
  const staticImages: ImageData[] = [
    { public_id: 'static-1', src: img1.src, alt: "Gallery Image 1", isStatic: true },
    { public_id: 'static-2', src: img2.src, alt: "Gallery Image 2", isStatic: true },
    { public_id: 'static-3', src: img3.src, alt: "Gallery Image 3", isStatic: true },
    { public_id: 'static-4', src: img4.src, alt: "Gallery Image 4", isStatic: true },
    { public_id: 'static-5', src: img5.src, alt: "Gallery Image 5", isStatic: true },
    { public_id: 'static-6', src: img6.src, alt: "Gallery Image 6", isStatic: true },
    { public_id: 'static-7', src: img7.src, alt: "Gallery Image 7", isStatic: true },
    { public_id: 'static-8', src: img8.src, alt: "Gallery Image 8", isStatic: true },
    { public_id: 'static-9', src: img9.src, alt: "Gallery Image 9", isStatic: true },
    { public_id: 'static-10', src: img10.src, alt: "Gallery Image 10", isStatic: true },
    { public_id: 'static-11', src: img11.src, alt: "Gallery Image 11", isStatic: true },
    { public_id: 'static-12', src: img12.src, alt: "Gallery Image 12", isStatic: true },
    { public_id: 'static-13', src: img13.src, alt: "Gallery Image 13", isStatic: true },
    { public_id: 'static-14', src: img14.src, alt: "Gallery Image 14", isStatic: true },
    { public_id: 'static-15', src: img15.src, alt: "Gallery Image 15", isStatic: true },
    { public_id: 'static-16', src: img16.src, alt: "Gallery Image 16", isStatic: true },
    { public_id: 'static-17', src: img17.src, alt: "Gallery Image 17", isStatic: true },
    { public_id: 'static-18', src: img18.src, alt: "Gallery Image 18", isStatic: true },
    { public_id: 'static-19', src: img19.src, alt: "Gallery Image 19", isStatic: true },
    { public_id: 'static-20', src: img20.src, alt: "Gallery Image 20", isStatic: true },
    { public_id: 'static-21', src: img21.src, alt: "Gallery Image 21", isStatic: true },
  ];

  const [images, setImages] = useState<ImageData[]>(staticImages);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  useEffect(() => {
    const imageId = searchParams.get('image');
    
    if (imageId && images.length > 0) {
      const actualIndex = images.findIndex(img => img.public_id === imageId);
      
      if (actualIndex !== -1) {
        setSelectedImageIndex(actualIndex);
        setIsModalOpen(true);
        
        // Always ensure URL has correct index
        const currentUrlIndex = searchParams.get('index');
        if (!currentUrlIndex || parseInt(currentUrlIndex) !== actualIndex) {
          const correctedUrl = `${window.location.pathname}?image=${imageId}&index=${actualIndex}`;
          window.history.replaceState(null, '', correctedUrl);
        }
      } else {
        // Image not found, clean up URL
        const newUrl = window.location.pathname;
        window.history.replaceState(null, '', newUrl);
        setIsModalOpen(false);
      }
    }
  }, [searchParams, images]);

  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const imageId = urlParams.get('image');
      const index = urlParams.get('index');
      
      if (!imageId || !index) {
        // No params means modal should be closed
        setIsModalOpen(false);
      } else {
        // Update modal state based on URL
        const imageIndex = parseInt(index);
        if (imageIndex >= 0 && imageIndex < images.length) {
          setSelectedImageIndex(imageIndex);
          setIsModalOpen(true);
        }
      }
    };
  
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [images.length]);

  // Fetch database images silently in the background
  useEffect(() => {  
    fetchDatabaseImages();
  }, []);
  
  const fetchDatabaseImages = async () => {
    try {
      const dbImages = await getGalleryImages(50, 0); // Fetch up to 50 images
      
      // Transform database images to ImageData format with optimized thumbnails
      const transformedDbImages: ImageData[] = dbImages.map((img: GalleryImage) => ({
        public_id: img.public_id,
        src: img.image_url,
        uploaded_at: img.uploaded_at,
        alt: `Gallery Image ${img.public_id}`,
        isStatic: false
      }));

      // Prepend database images to static images (newest first)
      setImages(prev => [...transformedDbImages, ...prev]);
    } catch (error) {
      console.error('Failed to fetch gallery images:', error);
      // Silently fail - users still see static images
    }
  };

  const handleImageClick = (index: number) => {
    const imageId = images[index].public_id;
    setSelectedImageIndex(index);
    setIsModalOpen(true);
    
    // Update URL when opening modal
    const newUrl = `${window.location.pathname}?image=${imageId}&index=${index}`;
    window.history.pushState(null, '', newUrl);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    
    // Remove URL params when closing modal
    const newUrl = window.location.pathname;
    window.history.pushState(null, '', newUrl);
  };

  // Add function to handle image change in modal
  const handleImageChange = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < images.length) {
      const imageId = images[newIndex].public_id;
      setSelectedImageIndex(newIndex);
      
      const newUrl = `${window.location.pathname}?image=${imageId}&index=${newIndex}`;
      window.history.replaceState(null, '', newUrl);
    }
  };

  return (
    <>
    <div
      className="columns-3 lg:columns-5"
      style={{ columnGap: '.25rem' }}
    >
      {images.map((image, index) => (
        <div key={image.public_id} className="mb-1">
          <Image
            className="h-auto w-full rounded-lg"
            src={generateThumbnailUrl(image.src)}
            alt={image.alt}
            width={200}
            height={200}
            loading={image.isStatic ? "eager" : "lazy"} // Load static images immediately, lazy load DB images
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InNoaW1tZXIiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZjNmNGY2Ii8+PHN0b3Agb2Zmc2V0PSI1MCUiIHN0b3AtY29sb3I9IiNlNWU3ZWIiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmM2Y0ZjYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3NoaW1tZXIpIi8+PC9zdmc+"
            onClick={() => handleImageClick(index)}
          />
        </div>
      ))}
    </div>

    {/* Instagram-like Feed Modal */}
    <ImageFeedModal
    isOpen={isModalOpen}
    onClose={handleModalClose}
    initialImageIndex={selectedImageIndex}
    allImages={images}
    onImageChange={handleImageChange}
  />
</>
  );
};

export default MasonryGrid;