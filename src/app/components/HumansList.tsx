type Human = {
  name: string;
  role: string;
};
  
type HumansListProps = {
  title: string;
  humans: Human[];
};
  
export default function HumansList({ title, humans }: HumansListProps) {
  return (
    <div className="space-y-1 mb-6 w-full">
      <h2 className="text-lg font-semibold mb-4 text-center text-black">{title}</h2>
      <ul>
        {humans.map((human) => (
          <li
            key={human.name}
            className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100"
          >
            <div className="flex items-center space-x-2">
              <span className="h-1 w-1 rounded-full bg-green-500"></span>
              <span className="text-sm text-gray-900">{human.name}</span>
            </div>
            <span className="text-xs text-gray-500">{human.role}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
  