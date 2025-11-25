import React from "react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/user-context";
import {
  NotificationModal,
  type Notification,
} 
from "../components/NotificationModal";
import {
  SearchSVG,
  ProfileSVG,
  CalendarSVG,
  ClockSVG,
  LocationPinSVG,
  VolunteerSVG,
  NotificationBellSVG,
} from "../assets/Svg";

interface Event {
  id: number;
  name: string;
  date: string;
  time: string;
  location: string;
  type: string;
  description: string;
  organization: string;
  volunteersSignedUp: number;
  maxVolunteers: number;
  requirements: string[];
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
  skills: string[];
  joinDate: string;
  totalHours: number;
}

const PALETTE = {
  navy: "#22577A",
  teal: "#38A3A5",
  green: "#26A96C",
  mint: "#80ED99",
  sand: "#F0EADF",
};

// Helper function to format skills from form data
const formatSkills = (skills: string[] = []): string[] => {
  return skills.map(skill => {
    return skill
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  });
};

const formatAddress = (rawProfile: any): string => {
  const address1 = rawProfile?.address1 ?? rawProfile?.address ?? rawProfile?.location ?? "";
  const address2 = rawProfile?.address2 ?? "";
  const city = rawProfile?.city ?? "";
  const state = rawProfile?.state ?? "";
  const zip = rawProfile?.zip ?? rawProfile?.zipCode ?? rawProfile?.postalCode ?? "";
  const country = rawProfile?.country ?? "";

  const firstLine = [address1, address2].filter(Boolean).join(", ");
  const cityState = [city, state].filter(Boolean).join(", ");
  const segments = [firstLine, cityState, zip, country]
    .filter((part) => part && part.trim().length > 0)
    .map((part) => part.trim());

  return segments.join(", ");
};

const normalizeJoinDate = (rawDate?: string) => {
  if (!rawDate) return new Date();
  const date = new Date(rawDate);
  return isNaN(date.getTime()) ? new Date() : date;
};

const buildUserProfile = (rawProfile: any, fallbackAuthUser?: any): UserProfile => {
  const firstName =
    rawProfile?.firstName ??
    rawProfile?.first_name ??
    fallbackAuthUser?.first_name ??
    (fallbackAuthUser?.name ? fallbackAuthUser.name.split(" ")[0] : "");
  const lastName =
    rawProfile?.lastName ??
    rawProfile?.last_name ??
    fallbackAuthUser?.last_name ??
    (fallbackAuthUser?.name ? fallbackAuthUser.name.split(" ").slice(1).join(" ") : "");

  const name =
    rawProfile?.fullName ||
    rawProfile?.name ||
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    fallbackAuthUser?.name ||
    "User";

  const email = rawProfile?.email ?? fallbackAuthUser?.email ?? "user@example.com";
  const address = formatAddress(rawProfile);
  const bio = rawProfile?.preferences ?? rawProfile?.bio ?? rawProfile?.description ?? "";
  const skills = Array.isArray(rawProfile?.skills)
    ? formatSkills(rawProfile.skills.map(String))
    : [];
  const joinDate = normalizeJoinDate(
    rawProfile?.joinDate ?? rawProfile?.join_date ?? rawProfile?.created_at
  ).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return {
    name,
    email,
    phone: rawProfile?.phone ?? rawProfile?.phoneNumber ?? "",
    address: address || "-",
    bio: bio || "No bio provided yet.",
    skills,
    joinDate,
    totalHours: rawProfile?.totalHours ?? 0,
  };
};

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

function EventCard(props: Event) {
  const { name, organization, type, description, date, time, location, volunteersSignedUp, maxVolunteers } = props;

  const capacityPct = Math.min(100, Math.round((volunteersSignedUp / maxVolunteers) * 100));
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
            {type}
          </div>
        </div>
        <div className="font-normal" style={{ color: "#64748B" }}>
            {organization}
        </div>
      </div>

      <div className="pt-4 pb-4" style={{ color: "#475569" }}>
        <div className="pb-2">{description}</div>

        <div className="flex items-center gap-2">
          <CalendarSVG size={20} />
          <div>{new Date(date + 'T00:00:00').toLocaleDateString()}</div>
        </div>

        <div className="flex items-center gap-2">
          <ClockSVG size={20} />
          <div>{time}</div>
        </div>

        <div className="flex items-center gap-2">
          <LocationPinSVG size={20} />
          <div>{location}</div>
        </div>

        <div className="flex items-center gap-2">
          <VolunteerSVG size={20} />
          <div>
            {volunteersSignedUp} / {maxVolunteers} volunteers
          </div>
        </div>

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
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [signedUpEvents, setSignedUpEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeEventTab, setActiveEventTab] = useState<'all' | 'upcoming' | 'past'>('all');

  // Load user profile from signup data or auth context
  useEffect(() => {
    const savedProfile = localStorage.getItem("volunteerProfile");

    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        setUserProfile(buildUserProfile(parsedProfile, user));
        return;
      } catch (error) {
        console.error("Failed to parse saved volunteer profile", error);
      }
    }

    if (user) {
      setUserProfile(buildUserProfile({}, user));
    }
  }, [user]);

  // Load signed-up events from localStorage
  useEffect(() => {
    const savedEvents = localStorage.getItem('signedUpEvents');
    if (savedEvents) {
      const events = JSON.parse(savedEvents);
      setSignedUpEvents(events);
    }
  }, []);

  useEffect(() => {
    setUserProfile((prev) =>
      prev ? { ...prev, totalHours: signedUpEvents.length * 3 } : prev
    );
  }, [signedUpEvents]);

  // Categorize events
  const upcomingEvents = signedUpEvents.filter(event => {
    const eventDate = new Date(event.date + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate >= today;
  });

  const pastEvents = signedUpEvents.filter(event => {
    const eventDate = new Date(event.date + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate < today;
  });

  // Filter events based on active tab and search term
  const getFilteredEvents = () => {
    let eventsToFilter = signedUpEvents;
    
    if (activeEventTab === 'upcoming') {
      eventsToFilter = upcomingEvents;
    } else if (activeEventTab === 'past') {
      eventsToFilter = pastEvents;
    }

    return eventsToFilter.filter(event => 
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredEvents = getFilteredEvents();

  const notifications: Notification[] = [
    {
      title: "Event Summary",
      description: `You have ${upcomingEvents.length} upcoming event${upcomingEvents.length !== 1 ? 's' : ''} and ${pastEvents.length} past event${pastEvents.length !== 1 ? 's' : ''}`,
    },
    ...(upcomingEvents.length > 0 ? [{
      title: "Next Event",
      description: `${upcomingEvents[0]?.name} on ${new Date(upcomingEvents[0]?.date + 'T12:00:00').toLocaleDateString()}`
    }] : [])
  ];

  // Get first name from full name
  const firstName = userProfile?.name.split(' ')[0] || 'User';

  return (
    <>
      <nav className="flex justify-between items-center">
        <div className="hidden sm:flex gap-4 items-center">
        </div>
      </nav>  

      {isEditProfileModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setIsEditProfileModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-screen overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold" style={{ color: PALETTE.navy }}>
                  My Profile
                </h2>
                <button
                  onClick={() => setIsEditProfileModalOpen(false)}
                  className="text-2xl hover:opacity-80"
                  style={{ color: PALETTE.teal }}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <div className="font-semibold" style={{ color: PALETTE.navy }}>Name</div>
                  <div style={{ color: "#475569" }}>{userProfile?.name ?? "-"}</div>
                </div>
                <div>
                  <div className="font-semibold" style={{ color: PALETTE.navy }}>Email</div>
                  <div style={{ color: "#475569" }}>{userProfile?.email ?? "-"}</div>
                </div>
                <div>
                  <div className="font-semibold" style={{ color: PALETTE.navy }}>Phone</div>
                  <div style={{ color: "#475569" }}>{userProfile?.phone ?? "-"}</div>
                </div>
                <div>
                  <div className="font-semibold" style={{ color: PALETTE.navy }}>Address</div>
                  <div style={{ color: "#475569" }}>{userProfile?.address ?? "-"}</div>
                </div>
                <div>
                  <div className="font-semibold" style={{ color: PALETTE.navy }}>Bio</div>
                  <div style={{ color: "#475569" }}>{userProfile?.bio ?? "-"}</div>
                </div>
                <div>
                  <div className="font-semibold" style={{ color: PALETTE.navy }}>Skills</div>
                  <div style={{ color: "#475569" }}>
                    {(userProfile?.skills && userProfile.skills.length > 0)
                      ? userProfile.skills.join(", ")
                      : "-"}
                  </div>
                </div>
                <div>
                  <div className="font-semibold" style={{ color: PALETTE.navy }}>Member Since</div>
                  <div style={{ color: "#475569" }}>{userProfile?.joinDate ?? "-"}</div>
                </div>
                <div>
                  <div className="font-semibold" style={{ color: PALETTE.navy }}>Total Hours Volunteered</div>
                  <div style={{ color: "#475569" }}>
                    {userProfile?.totalHours != null ? `${userProfile.totalHours} hours` : "-"}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setIsEditProfileModalOpen(false)}
                  className="flex-1 font-semibold py-3 rounded-full border transition-transform hover:scale-105"
                  style={{
                    borderColor: PALETTE.teal,
                    color: PALETTE.teal,
                    backgroundColor: "white",
                  }}
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setIsEditProfileModalOpen(false);
                    navigate('/Profile'); 
                  }}
                  className="flex-1 font-semibold py-3 rounded-full transition-transform hover:scale-105"
                  style={{ backgroundColor: PALETTE.teal, color: "white" }}
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main style={{ backgroundColor: PALETTE.sand, minHeight: "100%" }}>
        <section>
          <div className="p-8 text-2xl">
            <div className="flex justify-between">
              <div>
                <div style={{ color: PALETTE.navy }}>Welcome back, {firstName}!</div>
                <div className="text-lg" style={{ color: "#64748B" }}>
                  {signedUpEvents.length === 0 
                    ? "Ready to make a difference today?" 
                    : `You have ${upcomingEvents.length} upcoming and ${pastEvents.length} past events`
                  }
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
                  onClick={() => setIsEditProfileModalOpen(true)}
                  className="hover:opacity-80 transition-opacity p-1"
                >
                  <ProfileSVG size={45} />
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="ml-5 mr-5" style={{ borderTop: `1px solid ${PALETTE.mint}` }} />

        <section>
          <div className="flex justify-around gap-8 p-4 flex-col items-center md:flex-row">
            <Card
              icon={<VolunteerSVG size={64} />}
              title={signedUpEvents.length.toString()}
              subtitle="Total events"
            />
            <Card
              icon={<ClockSVG size={64} />}
              title={(signedUpEvents.length * 3).toString()}
              subtitle="Hours volunteered"
            />
            <Card
              icon={<CalendarSVG size={64} />}
              title={upcomingEvents.length.toString()}
              subtitle="Upcoming events"
            />
            <Card
              icon={<CalendarSVG size={64} />}
              title={pastEvents.length.toString()}
              subtitle="Past events"
            />
          </div>
        </section>

        <section className="">
          <div className="">
            <div className="grid grid-rows-2 md:grid-rows-1 md:grid-cols-3 gap-2 md:justify-items-between justify-center items-center max-w-6xl mx-auto">
              <div className="md:col-span-1">
                <div className="text-2xl" style={{ color: PALETTE.navy }}>
                  Your Events
                </div>
                <div className="text-xl" style={{ color: "#64748B" }}>
                  {signedUpEvents.length === 0 
                    ? "Events you've signed up for" 
                    : `${filteredEvents.length} ${activeEventTab} event${filteredEvents.length !== 1 ? 's' : ''} found`
                  }
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-full w-full focus:outline-none transition-all bg-white"
                  style={{
                    border: `1px solid ${PALETTE.mint}`,
                    boxShadow: `0 0 0 0 rgba(0,0,0,0)`,
                  }}
                  placeholder="Search your events"
                  onFocus={(e) =>
                    (e.currentTarget.style.boxShadow = `0 0 0 3px rgba(56,163,165,0.2)`)
                  }
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                />
              </div>
            </div>

            {/* Event Type Tabs */}
            <div className="flex justify-center mt-6 mb-4">
              <div className="flex rounded-full p-1" style={{ backgroundColor: PALETTE.sand }}>
                <button
                  onClick={() => setActiveEventTab('all')}
                  className={`px-6 py-2 rounded-full transition-all ${
                    activeEventTab === 'all' 
                      ? 'bg-white shadow-sm' 
                      : 'hover:bg-white hover:bg-opacity-50'
                  }`}
                  style={{ 
                    color: activeEventTab === 'all' ? PALETTE.navy : PALETTE.teal,
                    fontWeight: activeEventTab === 'all' ? '600' : '400'
                  }}
                >
                  All Events ({signedUpEvents.length})
                </button>
                <button
                  onClick={() => setActiveEventTab('upcoming')}
                  className={`px-6 py-2 rounded-full transition-all ${
                    activeEventTab === 'upcoming' 
                      ? 'bg-white shadow-sm' 
                      : 'hover:bg-white hover:bg-opacity-50'
                  }`}
                  style={{ 
                    color: activeEventTab === 'upcoming' ? PALETTE.navy : PALETTE.teal,
                    fontWeight: activeEventTab === 'upcoming' ? '600' : '400'
                  }}
                >
                  Upcoming ({upcomingEvents.length})
                </button>
                <button
                  onClick={() => setActiveEventTab('past')}
                  className={`px-6 py-2 rounded-full transition-all ${
                    activeEventTab === 'past' 
                      ? 'bg-white shadow-sm' 
                      : 'hover:bg-white hover:bg-opacity-50'
                  }`}
                  style={{ 
                    color: activeEventTab === 'past' ? PALETTE.navy : PALETTE.teal,
                    fontWeight: activeEventTab === 'past' ? '600' : '400'
                  }}
                >
                  Past ({pastEvents.length})
                </button>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 pt-5 pb-5 gap-4 md:gap-8 justify-items-center max-w-7xl mx-auto">
            {filteredEvents.length === 0 ? (
              <div className="col-span-3 text-center p-12 bg-white rounded-2xl shadow-md">
                <div className="text-6xl mb-4" style={{ color: PALETTE.mint }}>
                  {activeEventTab === 'upcoming' ? '📅' : activeEventTab === 'past' ? '✅' : '📋'}
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: PALETTE.navy }}>
                  {signedUpEvents.length === 0 
                    ? "No Events Signed Up Yet" 
                    : activeEventTab === 'upcoming'
                    ? "No Upcoming Events"
                    : activeEventTab === 'past'
                    ? "No Past Events"
                    : "No Events Match Your Search"
                  }
                </h3>
                <p className="mb-6" style={{ color: PALETTE.teal }}>
                  {signedUpEvents.length === 0 
                    ? "Browse available events and sign up to see them here!" 
                    : activeEventTab === 'upcoming'
                    ? "You don't have any upcoming events. Check out available events!"
                    : activeEventTab === 'past'
                    ? "You haven't completed any events yet."
                    : "Try adjusting your search terms."
                  }
                </p>
                {signedUpEvents.length === 0 || activeEventTab === 'upcoming' ? (
                  <button
                    onClick={() => navigate('/user-event-site')}
                    className="font-semibold py-3 px-8 rounded-full shadow-md inline-block transition-transform hover:scale-105"
                    style={{ backgroundColor: PALETTE.teal, color: "white" }}
                  > 
                    Browse Events
                  </button>
                ) : null}
              </div>
            ) : (
              filteredEvents.map((event) => (
                <EventCard key={event.id} {...event} />
              ))
            )}
          </div>
        </section>
      </main>

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