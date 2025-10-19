import EventSchedule from '@/app/Components/EventSchedule';
import { ScheduleDay } from '@/app/types';

const scheduleData: ScheduleDay[] = [
  {
    date: '04',
    day: 'Thursday',
    items: [
      {
        time: '7:00 – 9:00 AM',
        title: 'Ring Ceremony',
        description: '',
      },
      {
        time: '11:45 – 12:45 AM',
        title: 'Lunch',
        description: 'Enjoy your lunch with your family and friends.',
      },
      {
        time: '1:30 – 2:45 AM',
        title: 'Mandap Muhurat',
        description: 'Lunch is provided with your conference experience.',
      },
      {
        time: '04:00 – 07:00 PM',
        title: 'Haldi Ceremony',
        description: 'Get an in-depth look at the work behind the work of some of our favorite creative thinkers and organizations.',
      },
      {
        time: '07:00 – 08:30 PM',
        title: 'Dinner',
        description: 'Dive into new disciplines, frameworks, and ideas with breakout workshops and creative labs.',
      },
      {
        time: '8:30 – 9:30 PM',
        title: 'Sangeet Sandhya',
        description: 'Spend the evening exploring the workplaces of favorite creative organizations.',
      },
    ],
  },
  {
    date: '05',
    day: 'Friday',
    items: [
      {
        time: '8:30 – 9:30 AM',
        title: 'Late Registration & Breakfast',
        description: '',
      },
      {
        time: '9:30 – 10:45 AM',
        title: 'Breakout Sessions: Master Classes',
        description: 'Get an in-depth look at the work behind the work of some of our favorite creative thinkers and organizations.',
      },
      {
        time: '12:15 – 2:00 PM',
        title: 'Breakout Sessions: Workshops',
        description: 'Dive into new disciplines, frameworks, and ideas with breakout workshops and creative labs.',
      },
      {
        time: '2:15 – 3:15 PM',
        title: 'Lunch',
        description: 'Lunch is provided with your conference experience.',
      },
      {
        time: '3:15 – 6:00 PM',
        title: 'Main Stage: The Future is Human',
        description: 'Insightful talks from creatives working to bring more humanity into technology and industry.',
      },
      {
        time: '9:00 – 12:00 PM',
        title: 'Closing Party',
        description: 'Join us for an evening of celebration.',
      },
    ],
  },
];

export default function SchedulePage() {
  return <EventSchedule days={scheduleData} />;
}
