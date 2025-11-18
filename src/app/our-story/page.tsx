import Image from 'next/image';
import story from '@/app/pics/Story.png';

export default function OurStory() {
  return <Image src={story.src} alt="Story" className="w-full h-auto mb-12" width={1000} height={1000} />
}