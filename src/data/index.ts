import type { EventCardProps } from '../types';

export const DUMMY_DATA: EventCardProps[] = [
  {
    name: "Park Cleanup",
    org: "Green City Org",
    category: "Environment",
    description:
      "Help remove litter and sort recyclables to keep our community park clean.",
    date: "2025-10-12",
    timerange: ["9:00 AM", "12:00 PM"],
    place: "Memorial Park, Houston, TX",
    currVolunteers: 18,
    maxVolunteers: 30,
  },
  {
    name: "Food Bank Packing",
    org: "Houston Food Network",
    category: "Community",
    description:
      "Sort and pack food boxes for local families in need. Light lifting involved.",
    date: "2025-10-20",
    timerange: ["9:00 AM", "12:00 PM"],
    place: "Downtown Distribution Center, Houston, TX",
    currVolunteers: 42,
    maxVolunteers: 60,
  },
  {
    name: "River Restoration",
    org: "Bayou Guardians",
    category: "Environment",
    description:
      "Plant native species along the bayou and document invasive plants.",
    date: "2025-11-05",
    timerange: ["9:00 AM", "12:00 PM"],
    place: "Buffalo Bayou, Houston, TX",
    currVolunteers: 12,
    maxVolunteers: 25,
  },
];