import { ScheduleItem as ItemType } from '@/app/types';
import ScheduleItem from './ScheduleItem';

type Props = {
  date: string;
  day: string;
  items: ItemType[];
};

export default function ScheduleDay({ date, day, items }: Props) {
  return (
    <div className="w-full md:w-1/2 px-4">
      <div className="relative flex flex-col items-start mb-8">
        <span className="text-9xl font-bold text-red-700 leading-none">{date}</span>
        <span className="text-md ml-1 mt-1 text-black">{day}</span>
      </div>
      <div>
        {items.map((item, i) => (
          <ScheduleItem
            key={i}
            time={item.time}
            title={item.title}
            description={item.description}
          />
        ))}
      </div>
    </div>
  );
}
