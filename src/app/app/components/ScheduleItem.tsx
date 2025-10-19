type Props = {
  time: string;
  title: string;
  description: string;
};

export default function ScheduleItem({ time, title, description }: Props) {
  return (
    <div className="flex flex-row mb-4 border-t border-gray-300 pt-4">
      <p className="text-md w-1/3 text-black">{time}</p>
      <div className="w-2/3">
        <h4 className="text-lg font-semibold text-red-700">{title}</h4>
        <p className="text-md text-black">{description}</p>
      </div>
    </div>
  );
}
  