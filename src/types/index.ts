export interface EventCardProps {
  name: string;
  org: string;
  category: string;
  description: string;
  date: string;
  timerange: [string, string];
  place: string;
  currVolunteers: number;
  maxVolunteers: number;
}