import { useState } from "react";
import {
  NotificationModal,
  type Notification,
} from "../components-js30/NotificationModal";
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
} from "../assets/SVG";

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
    <div className="flex items-center border border-gray-500 rounded-xl gap-4 p-3 pr-[clamp(0.5rem,5vw,8rem)] w-full max-w-[400px]">
      <div className="shrink-0">{icon}</div>
      <div className="text-xl">
        <div className="font-bold">{title}</div>
        <div>{subtitle}</div>
      </div>
    </div>
  );
}

function EventCard(props: EventCardProps) {
  return (
    <div className="shadow-lg rounded-xl p-6 h-full min-h-[300px] w-full max-w-[500px]">
      <div>
        <div className="flex gap-1 justify-between items-center">
          <div className="font-medium text-lg">{props.name}</div>
          <div className="text-sm pt-1 pb-1 pl-2 pr-2 bg-(--color-jade) text-white font-semibold rounded-xl">
            {props.category}
          </div>
        </div>
        <div className="text-gray-600 font-normal">{props.org}</div>
      </div>
      <div className="text-gray-600 pt-4 pb-4">
        <div className="pb-2">{props.description}</div>
        <div className="flex items-center gap-2">
          <CalendarSVG size={20} />
          <div>{props.date}</div>
        </div>
        <div className="flex items-center gap-2">
          <ClockSVG size={20} />
          <div>
            {props.timerange[0]} - {props.timerange[1]}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LocationPinSVG size={20} />
          <div>{props.place}</div>
        </div>
        <div className="flex items-center gap-2">
          <VolunteerSVG size={20} />
          <div>
            {props.currVolunteers} / {props.maxVolunteers} volunteers
          </div>
        </div>
      </div>
      <div className="flex justify-around font-semibold text-white">
        <button className="pt-1 pb-1 pl-8 pr-8 shadow-lg bg-(--color-blue) rounded-3xl">
          View Details
        </button>
        <button className="pt-1 pb-1 pl-8 pr-8 shadow-lg bg-(--color-jade) rounded-3xl">
          Signed up
        </button>
      </div>
    </div>
  );
}

function VolunteerProfile() {
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  // Sample notifications data
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
      <header className="text-white bg-(--color-jade) p-1">
        <nav className="flex justify-between items-center">
          <div className="flex items-center gap-4 pl-3">
            <div className="sm:hidden">
              {/*FIXME: STILL NEED TO CONFIGURE MENU*/}
              <HamburgerMenuSVG size={54} />
            </div>
            <div>
              <VolunteerSVG size={64} />
            </div>
            <div className="text-4xl font-thin">Volunter</div>
          </div>

          <div className="hidden sm:flex gap-4 items-center">
            <a href="/">Features</a>
            <a href="/">About</a>
            <a href="/">Contact</a>
            <ProfileSVG size={48} />
          </div>
        </nav>
      </header>
      <main>
        <section>
          <div className="p-8 text-2xl">
            <div className="flex justify-between">
              <div>
                <div>Welcome back, Alex!</div>
                <div className="text-lg text-gray-500">
                  Ready to make a difference today?
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  className="border p-3 rounded-xl hover:bg-gray-200 transition-colors relative"
                  onClick={() => setIsNotificationModalOpen(true)}
                >
                  <NotificationBellSVG size={30} />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
                <button className="border p-3 rounded-xl hover:bg-gray-200 transition-colors">
                  <SettingsCogSVG size={30} />
                </button>
              </div>
            </div>
          </div>
        </section>
        <div className="border-t-1 border-gray-500 ml-5 mr-5"></div>
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
        <section className="">
          <div className="">
            <div className="grid grid-rows-2 md:grid-rows-1 md:grid-cols-3 gap-2 md:justify-items-between justify-center items-center max-w-6xl mx-auto">
              <div className="md:col-span-1">
                <div className="text-2xl">Your Upcoming Events</div>
                <div className="text-xl text-gray-600">
                  Events you've signed up for
                </div>
              </div>
              <div role="search" className="relative col-span-2">
                <button className="absolute top-1/2 left-1 transform -translate-y-1/2 z-10 rounded-full hover:bg-gray-300 p-1.5 transition-colors">
                  <SearchSVG size={24} />
                </button>
                <input
                  type="text"
                  className="border border-gray-500 pl-10 pr-4 py-2 rounded-full w-full focus:outline-none focus:ring-blue-500 transition-all"
                  placeholder="Search Events"
                />
              </div>
            </div>
          </div>
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 pt-5 pb-5 gap-4 md:gap-8 justify-items-center w-[clamp(1rem, 5vw, 8rem)]">
            {DUMMY_DATA.map((cardData) => (
              <EventCard {...cardData} />
            ))}
          </div>
        </section>
      </main>
      <footer className="bg-(--color-blue) p-10 font-bold text-white flex justify-center items-center">
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
