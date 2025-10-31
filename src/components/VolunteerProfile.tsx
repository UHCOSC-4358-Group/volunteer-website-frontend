import React from "react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
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
const formatSkills = (skills: string[]): string[] => {
  return skills.map(skill => {
    return skill
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  });
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
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [signedUpEvents, setSignedUpEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Load user profile from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('volunteerProfile');
    if (savedProfile) {
      const profileData = JSON.parse(savedProfile);
      
      // Transform the profile data to match UserProfile interface
      const transformedProfile: UserProfile = {
        name: profileData.fullName || "User",
        email: "user@example.com", // You may want to add this to Profile form
        phone: "(555) 000-0000", // You may want to add this to Profile form
        address: [
          profileData.address1,
          profileData.address2,
          `${profileData.city}, ${profileData.state} ${profileData.zip}`
        ].filter(Boolean).join(', '),
        bio: profileData.preferences || "No bio provided yet.",
        skills: formatSkills(profileData.skills),
        joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        totalHours: 0 // This will be calculated from events
      };
      
      setUserProfile(transformedProfile);
    }
  }, []);

  // Load signed-up events from localStorage
  useEffect(() => {
    const savedEvents = localStorage.getItem('signedUpEvents');
    if (savedEvents) {
      const events = JSON.parse(savedEvents);
      setSignedUpEvents(events);
      
      // Update total hours based on events (estimate 3 hours per event)
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          totalHours: events.length * 3
        });
      }
    }
  }, []);

  const filteredEvents = signedUpEvents.filter(event => 
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const upcomingEvents = signedUpEvents.filter(event => {
    const eventDate = new Date(event.date + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate >= today;
  });

  const notifications: Notification[] = [
    {
      title: "Event Summary",
      description: `You have ${upcomingEvents.length} upcoming event${upcomingEvents.length !== 1 ? 's' : ''}`,
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
                    : `You have ${upcomingEvents.length} upcoming event${upcomingEvents.length !== 1 ? 's' : ''}`
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
              icon={<SearchSVG size={64} />}
              title={upcomingEvents.length.toString()}
              subtitle="Upcoming events"
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
                    : `${filteredEvents.length} event${filteredEvents.length !== 1 ? 's' : ''} found`
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
          </div>

          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 pt-5 pb-5 gap-4 md:gap-8 justify-items-center max-w-7xl mx-auto">
            {filteredEvents.length === 0 ? (
              <div className="col-span-3 text-center p-12 bg-white rounded-2xl shadow-md">
                <div className="text-6xl mb-4" style={{ color: PALETTE.mint }}>📋</div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: PALETTE.navy }}>
                  {signedUpEvents.length === 0 ? "No Events Signed Up Yet" : "No Events Match Your Search"}
                </h3>
                <p className="mb-6" style={{ color: PALETTE.teal }}>
                  {signedUpEvents.length === 0 
                    ? "Browse available events and sign up to see them here!" 
                    : "Try adjusting your search terms."
                  }
                </p>
                {signedUpEvents.length === 0 && (
                  <button
                    onClick={() => navigate('/user-event-site')}
                    className="font-semibold py-3 px-8 rounded-full shadow-md inline-block transition-transform hover:scale-105"
                    style={{ backgroundColor: PALETTE.teal, color: "white" }}
                  > 
                    Browse Events
                  </button>
                )}
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