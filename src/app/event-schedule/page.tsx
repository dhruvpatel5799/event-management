import Image from 'next/image';
import ScheduleImage from '@/app/pics/Schedule.png';

export default function SchedulePage() {
  return <Image className='mb-10' src={ScheduleImage.src} alt="Schedule" width={1000} height={1000} />;
}
