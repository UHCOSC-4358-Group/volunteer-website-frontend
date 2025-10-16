import React from "react";

import { useState } from "react";
import {
  NotificationModal,
  type Notification,
} from "../components/NotificationModal";
import {
  HamburgerMenuSVG,
  SearchSVG,
  SettingsCogSVG,
  ProfileSVG,
  CalendarSVG,
  ClockSVG,
  LocationPinSVG,
  VolunteerSVG,
  NotificationBellSVG,
} from "../assets/Svg";

interface EventCardProps {
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

/** Brand palette */
const PALETTE = {
  navy: "#22577A",
  teal: "#38A3A5",
  green: "#26A96C",
  mint: "#80ED99",
  sand: "#F0EADF",
};


const DUMMY_DATA: EventCardProps[] = [
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

function Card({
  icon = <CalendarSVG size={64} />,
  title = "20",
  subtitle = "Events completed",
}: {
  icon?: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div
      className="flex items-center rounded-xl gap-4 p-3 pr-[clamp(0.5rem,5vw,8rem)] w-full max-w-[400px] border shadow-sm"
      style={{ borderColor: PALETTE.mint, backgroundColor: "#fff" }}
    >
      <div className="shrink-0" style={{ color: PALETTE.teal }}>
        {icon}
      </div>
      <div className="text-xl">
        <div className="font-bold" style={{ color: PALETTE.navy }}>
          {title}
        </div>
        <div style={{ color: PALETTE.teal }}>{subtitle}</div>
      </div>
    </div>
  );
}

function EventCard(props: EventCardProps) {
  const { name, org, category, description, date, timerange, place, currVolunteers, maxVolunteers } = props;

  const capacityPct = Math.min(100, Math.round((currVolunteers / maxVolunteers) * 100));
  const capacityBarColor = capacityPct > 80 ? "#e67e22" : PALETTE.green;

  return (
    <div
      className="shadow-lg rounded-xl p-6 h-full min-h-[300px] w-full max-w-[500px] border"
      style={{ backgroundColor: "#fff", borderColor: PALETTE.mint }}
    >
      <div>
        <div className="flex gap-1 justify-between items-center">
          <div className="font-medium text-lg" style={{ color: PALETTE.navy }}>
            {name}
          </div>
          <div
            className="text-sm pt-1 pb-1 pl-3 pr-3 font-semibold rounded-xl"
            style={{ backgroundColor: PALETTE.teal, color: "#fff" }}
          >
            {category}
          </div>
        </div>
        <div className="font-normal" style={{ color: "#64748B" }}>
            {org}
        </div>
      </div>

      <div className="pt-4 pb-4" style={{ color: "#475569" }}>
        <div className="pb-2">{description}</div>

        <div className="flex items-center gap-2">
          <CalendarSVG size={20} />
          <div>{date}</div>
        </div>

        <div className="flex items-center gap-2">
          <ClockSVG size={20} />
          <div>
            {timerange[0]} - {timerange[1]}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LocationPinSVG size={20} />
          <div>{place}</div>
        </div>

        <div className="flex items-center gap-2">
          <VolunteerSVG size={20} />
          <div>
            {currVolunteers} / {maxVolunteers} volunteers
          </div>
        </div>

        {/* capacity bar */}
        <div className="mt-3 h-2 w-full rounded-full" style={{ backgroundColor: "#eef7f0" }}>
          <div
            className="h-2 rounded-full"
            style={{ width: `${capacityPct}%`, backgroundColor: capacityBarColor }}
          />
        </div>
      </div>

      <div className="flex justify-around font-semibold">
        <button
          className="pt-1 pb-1 pl-8 pr-8 rounded-3xl shadow"
          style={{
            color: PALETTE.teal,
            backgroundColor: "#ffffff",
            border: `2px solid ${PALETTE.teal}`,
          }}
        >
          View Details
        </button>
        <button
          className="pt-1 pb-1 pl-8 pr-8 rounded-3xl shadow text-white"
          style={{ backgroundColor: PALETTE.green }}
        >
          Signed up
        </button>
      </div>
    </div>
  );
}

function VolunteerProfile() {
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  const notifications: Notification[] = [
    {
      title: "Event Reminder",
      description: "Your Park Cleanup event is tomorrow at 9:00 AM",
    },
    {
      title: "New Event Available",
      description: "Beach Cleanup event has been posted for next weekend",
    },
    {
      title: "Event Cancelled",
      description:
        "The River Restoration event on Nov 5th has been cancelled due to weather",
    },
  ];

  return (
    <>
      {/* Header */}
      <header className="text-white" style={{ backgroundColor: PALETTE.teal }}>
        <nav className="flex justify-between items-center">
          <div className="flex items-center gap-4 pl-3">
            <div className="sm:hidden">
              <HamburgerMenuSVG size={54} />
            </div>
            <div>
              <VolunteerSVG size={64} />
            </div>
            <div className="text-4xl font-thin">Volunteer</div>
          </div>

          <div className="hidden sm:flex gap-4 items-center">
            <a href="/">Features</a>
            <a href="/">About</a>
            <a href="/">Contact</a>
            <ProfileSVG size={48} />
          </div>
        </nav>
      </header>

      {/* Main */}
      <main style={{ backgroundColor: PALETTE.sand, minHeight: "100%", }}>
        <section>
          <div className="p-8 text-2xl">
            <div className="flex justify-between">
              <div>
                <div style={{ color: PALETTE.navy }}>Welcome back, Alex!</div>
                <div className="text-lg" style={{ color: "#64748B" }}>
                  Ready to make a difference today?
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  className="border p-3 rounded-xl transition-colors relative bg-white"
                  style={{ borderColor: PALETTE.mint }}
                  onClick={() => setIsNotificationModalOpen(true)}
                >
                  <NotificationBellSVG size={30} />
                  {notifications.length > 0 && (
                    <span
                      className="absolute -top-1 -right-1 text-xs rounded-full h-5 w-5 flex items-center justify-center"
                      style={{ backgroundColor: "#ef4444", color: "#fff" }}
                    >
                      {notifications.length}
                    </span>
                  )}
                </button>
                <button
                  className="border p-3 rounded-xl transition-colors bg-white"
                  style={{ borderColor: PALETTE.mint }}
                >
                  <SettingsCogSVG size={30} />
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="ml-5 mr-5" style={{ borderTop: `1px solid ${PALETTE.mint}` }} />

        {/* Stats */}
        <section>
          <div className="flex justify-around gap-8 p-4 flex-col items-center md:flex-row">
            <Card
              icon={<VolunteerSVG size={64} />}
              title="21"
              subtitle="Events completed"
            />
            <Card
              icon={<ClockSVG size={64} />}
              title="63"
              subtitle="Hours volunteered"
            />
            <Card
              icon={<SearchSVG size={64} />}
              title="4"
              subtitle="Upcoming events"
            />
          </div>
        </section>

        {/* Search + Upcoming */}
        <section className="">
          <div className="">
            <div className="grid grid-rows-2 md:grid-rows-1 md:grid-cols-3 gap-2 md:justify-items-between justify-center items-center max-w-6xl mx-auto">
              <div className="md:col-span-1">
                <div className="text-2xl" style={{ color: PALETTE.navy }}>
                  Your Upcoming Events
                </div>
                <div className="text-xl" style={{ color: "#64748B" }}>
                  Events you've signed up for
                </div>
              </div>

              <div role="search" className="relative col-span-2">
                <button
                  className="absolute top-1/2 left-1 transform -translate-y-1/2 z-10 rounded-full p-1.5"
                  style={{ color: PALETTE.teal }}
                >
                  <SearchSVG size={24} />
                </button>
                <input
                  type="text"
                  className="pl-10 pr-4 py-2 rounded-full w-full focus:outline-none transition-all bg-white"
                  style={{
                    border: `1px solid ${PALETTE.mint}`,
                    boxShadow: `0 0 0 0 rgba(0,0,0,0)`,
                  }}
                  placeholder="Search Events"
                  onFocus={(e) =>
                    (e.currentTarget.style.boxShadow = `0 0 0 3px rgba(56,163,165,0.2)`)
                  }
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                />
              </div>
            </div>
          </div>

          {/* Event cards */}
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 pt-5 pb-5 gap-4 md:gap-8 justify-items-center w-[clamp(1rem, 5vw, 8rem)]">
            {DUMMY_DATA.map((cardData) => (
              <EventCard key={cardData.name} {...cardData} />
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className="p-10 font-bold text-white flex justify-center items-center"
        style={{ backgroundColor: PALETTE.teal }}
      >
        <div>Made by COSC 4358 team!</div>
      </footer>
            
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notifications={notifications}
      />
    </>
  );
}

export default VolunteerProfile;
