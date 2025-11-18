import { ScheduleDay as DayType } from '@/app/types';
import ScheduleDay from './ScheduleDay';

type Props = {
  days: DayType[];
};

export default function EventSchedule({ days }: Props) {
  return (
    <div className="py-10">
      <div className="flex flex-row items-center mb-10"
      style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23808080' fill-opacity='0.4' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E\")"
      }}
      >
        <div className="w-1/2 bg-red-700 px-8 py-4 text-end rounded-r-3xl">
          <span className="text-lg font-semibold text-white">EVENT SCHEDULE</span>
        </div>
        <div className="w-1/2 text-lg font-light italic text-center text-red-700">
          December &ndash; 2025
        </div>
      </div>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:space-x-10">
          {days.map((day, index) => (
            <ScheduleDay key={index} {...day} />
          ))}
        </div>
        <div className="text-center text-xs text-gray-500 my-10">
          <p>Kadva Patel Samaj</p>
          <p>Main Bus stand Road, Near Makadiyawadi, Jamjodhpur</p>
        </div>
      </div>
    </div>
  );
}
