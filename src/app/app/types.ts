export type ScheduleItem = {
  time: string;
  title: string;
  description: string;
};
  
export type ScheduleDay = {
  date: string;
  day: string;
  items: ScheduleItem[];
};
  