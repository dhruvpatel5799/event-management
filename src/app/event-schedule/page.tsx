import EventSchedule from '@/app/components/EventSchedule';
import { ScheduleDay } from '@/app/types';

const scheduleData: ScheduleDay[] = [
  {
    date: '04',
    day: 'Thursday',
    items: [
      {
        time: '07:30 AM',
        title: 'Ring Ceremony',
        description: '',
      },
      {
        time: '01:30 PM',
        title: 'Mandap Muhurat',
        description: 'The Foundation of Forever',
      },
      {
        time: '04:00 PM',
        title: 'Haldi Ceremony',
        description: '',
      },
      {
        time: '08:30 PM',
        title: 'Sangeet Sandhya',
        description: 'The Rhythm of Love',
      },
    ],
  },
  {
    date: '05',
    day: 'Friday',
    items: [
      {
        time: '06:30 AM',
        title: 'Jaan Prasthan',
        description: '',
      },
      {
        time: '10:00 AM',
        title: 'Hast Melap',
        description: 'The Saga of Forever',
      },
    ],
  },
];

export default function SchedulePage() {
  return <EventSchedule days={scheduleData} />;
}
