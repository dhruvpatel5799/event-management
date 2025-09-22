'use client';
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

interface ImageData {
  id: number;
  src: string;
  alt: string;
  height: number;
}

const MasonryGrid = () => {
  // Sample images with different heights for masonry effect
  const images: ImageData[] = [
    { id: 1, src: img1.src, alt: "Gallery Image 1", height: 400 },
    { id: 2, src: img2.src, alt: "Gallery Image 2", height: 350 },
    { id: 3, src: img3.src, alt: "Gallery Image 3", height: 450 },
    { id: 4, src: img4.src, alt: "Gallery Image 4", height: 300 },
    { id: 5, src: img5.src, alt: "Gallery Image 5", height: 380 },
    { id: 6, src: img6.src, alt: "Gallery Image 6", height: 420 },
    { id: 7, src: img7.src, alt: "Gallery Image 7", height: 360 },
    { id: 8, src: img8.src, alt: "Gallery Image 8", height: 480 },
    { id: 9, src: img9.src, alt: "Gallery Image 9", height: 340 },
    { id: 10, src: img10.src, alt: "Gallery Image 10", height: 460 },
    { id: 11, src: img11.src, alt: "Gallery Image 11", height: 320 },
    { id: 12, src: img12.src, alt: "Gallery Image 12", height: 440 },
    { id: 13, src: img13.src, alt: "Gallery Image 12", height: 440 },
    { id: 14, src: img14.src, alt: "Gallery Image 13", height: 440 },
    { id: 15, src: img15.src, alt: "Gallery Image 14", height: 440 },
    { id: 16, src: img16.src, alt: "Gallery Image 15", height: 440 },
    { id: 17, src: img17.src, alt: "Gallery Image 16", height: 440 },
    { id: 18, src: img18.src, alt: "Gallery Image 17", height: 440 },
    { id: 19, src: img19.src, alt: "Gallery Image 18", height: 440 },
    { id: 20, src: img20.src, alt: "Gallery Image 19", height: 440 },
    { id: 21, src: img21.src, alt: "Gallery Image 20", height: 440 },
  ];

     return (
     <div
       className="columns-3 lg:columns-5"
       style={{ columnGap: '.25rem' }}
     >
       {images.map((image, index) => (
         <div key={index} className="mb-1">
           <img
             className="h-auto w-full rounded-lg"
             src={image.src}
             alt={image.alt}
           />
         </div>
       ))}
     </div>

  );
};

export default MasonryGrid;
