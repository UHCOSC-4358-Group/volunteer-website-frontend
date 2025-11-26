import React from "react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/user-context";
import { getNotifications } from "../services/notificationService";
import { NotificationModal } from "../components/NotificationModal";
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

interface ApiLocation {
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
}

interface ApiVolunteer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  location?: ApiLocation;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  skills?: string[];
  preferences?: {
    indoor_only?: boolean;
    max_distance_miles?: number;
  };
  availability?: string[];
}

interface ApiEvent {
  event_id?: number;
  id?: number;
  name?: string;
  location?: ApiLocation;
  day?: string;
  start_time?: string;
  end_time?: string;
  urgency?: string;
  description?: string;
  organization?: string;
  capacity?: number;
  assigned?: number;
  needed_skills?: string[];
}

interface VolunteerApiResponse {
  volunteer: ApiVolunteer;
  upcoming_events: ApiEvent[];
  past_events: ApiEvent[];
}

const PALETTE = {
  navy: "#22577A",
  teal: "#38A3A5",
  green: "#26A96C",
  mint: "#80ED99",
  sand: "#F0EADF",
};

const API_PREFIX = "/api";

// Helper function to format skills
const formatSkills = (skills: string[] = []): string[] =>
  skills.map((skill) =>
    skill
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );

const formatAddress = (rawProfile: any): string => {
  // Accept nested location objects as well as top-level address fields
  const source = rawProfile?.location ?? rawProfile ?? {};

  const address1 =
    rawProfile?.address1 ??
    source?.address1 ??
    rawProfile?.address ??
    source?.address ??
    rawProfile?.street ??
    source?.street ??
    "";
  const address2 =
    rawProfile?.address2 ??
    source?.address2 ??
    rawProfile?.street2 ??
    source?.street2 ??
    rawProfile?.address_line_2 ??
    source?.address_line_2 ??
    "";
  const city =
    rawProfile?.city ?? source?.city ?? source?.town ?? source?.locality ?? "";
  const state =
    rawProfile?.state ??
    source?.state ??
    source?.province ??
    source?.region ??
    "";
  const zip =
    rawProfile?.zip ??
    rawProfile?.zip_code ??
    rawProfile?.zipCode ??
    rawProfile?.postalCode ??
    source?.zip ??
    source?.zip_code ??
    source?.zipCode ??
    source?.postalCode ??
    "";
  const country = rawProfile?.country ?? source?.country ?? "";

  const firstLine = [address1, address2]
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter(Boolean)
    .join(", ");
  const cityState = [city, state]
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter(Boolean)
    .join(", ");

  const segments = [firstLine, cityState, zip, country]
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter((part) => part.length > 0);

  return segments.join(", ");
};

const buildUserProfileFromApi = (
  vol: ApiVolunteer,
  fallbackAuthUser?: any
): UserProfile => {
  const name =
    [vol.first_name, vol.last_name].filter(Boolean).join(" ").trim() ||
    fallbackAuthUser?.name ||
    "User";

  const preferences: string[] = [];
  if (vol.preferences?.indoor_only) preferences.push("Prefers indoor only");
  if (vol.preferences?.max_distance_miles != null)
    preferences.push(
      `Max distance: ${vol.preferences.max_distance_miles} miles`
    );

  const availability = Array.isArray(vol.availability)
    ? vol.availability.map((day) => {
        // Map numeric codes to day names
        const dayMap: { [key: string]: string } = {
          "1": "Monday",
          "2": "Tuesday",
          "3": "Wednesday",
          "4": "Thursday",
          "5": "Friday",
          "6": "Saturday",
          "7": "Sunday",
        };

        const normalizedDay = day.toString().toLowerCase();
        return dayMap[normalizedDay] || day;
      })
    : [];

  const skills = Array.isArray(vol.skills) ? formatSkills(vol.skills) : [];

  return {
    name,
    email: vol.email ?? fallbackAuthUser?.email ?? "user@example.com",
    phone: vol.phone ?? "",
    address: formatAddress(vol) || "-",
    bio:
      [
        ...preferences,
        availability.length ? `Availability: ${availability.join(", ")}` : "",
      ]
        .filter(Boolean)
        .join(" • ") || "No preferences provided.",
    skills,
    joinDate: new Date().toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    }),
    totalHours: 0, // will be estimated from past events
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
  const {
    name,
    organization,
    type,
    date,
    time,
    location,
    volunteersSignedUp,
    maxVolunteers,
    requirements,
  } = props;

  const capacityPct =
    maxVolunteers > 0
      ? Math.min(100, Math.round((volunteersSignedUp / maxVolunteers) * 100))
      : 0;
  const capacityBarColor = capacityPct > 80 ? "#e67e22" : PALETTE.green;

  const rawUrgency =
    typeof type === "string" && type.includes(".")
      ? type.split(".").pop()
      : type;
  const urgencyLabel = rawUrgency
    ? rawUrgency.charAt(0) + rawUrgency.slice(1).toLowerCase()
    : "General";

  const formattedDate = (() => {
    if (!date) return "";
    // Build date in local time to avoid UTC shift when backend sends YYYY-MM-DD
    const parts = date.split("-");
    if (parts.length === 3) {
      const [y, m, d] = parts.map((p) => Number(p));
      const localDate = new Date(y, (m || 1) - 1, d || 1);
      return localDate.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  })();

  return (
    <div
      className="shadow-lg rounded-xl p-6 h-full min-h-[300px] w-full max-w-[500px] border flex flex-col justify-between"
      style={{ backgroundColor: "#fff", borderColor: PALETTE.mint }}
    >
      <div className="flex justify-between items-start gap-3">
        <div>
          <div className="font-medium text-lg" style={{ color: PALETTE.navy }}>
            {name}
          </div>
          <div className="font-normal" style={{ color: "#64748B" }}>
            {organization}
          </div>
        </div>
        <span
          className="px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap"
          style={{ backgroundColor: PALETTE.teal, color: "#fff" }}
        >
          {urgencyLabel}
        </span>
      </div>

      <div className="pt-4 pb-4 space-y-2" style={{ color: "#475569" }}>
        <div className="flex items-center gap-2">
          <CalendarSVG size={20} />
          <div>{formattedDate}</div>
        </div>

        <div className="flex items-center gap-2">
          <ClockSVG size={20} />
          <div>{time}</div>
        </div>

        <div className="flex items-center gap-2">
          <LocationPinSVG size={20} />
          <div>{location}</div>
        </div>
        {/*
        <div className="pt-2 text-sm" style={{ color: PALETTE.navy }}>
          <div className="font-semibold mb-1" style={{ color: PALETTE.navy }}>
            Description
          </div>
          <div className="text-[#475569]">
            {description && description.trim().length > 0
              ? description
              : "No description provided."}
          </div>
        </div>
          */}
        {requirements && requirements.length > 0 && (
          <div className="mb-3">
            <p
              className="text-sm font-semibold mb-1"
              style={{ color: PALETTE.navy }}
            >
              Skills needed:
            </p>
            <div className="flex flex-wrap gap-2">
              {requirements.map((req, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 rounded-full text-xs"
                  style={{
                    backgroundColor: PALETTE.mint,
                    color: PALETTE.navy,
                  }}
                >
                  {req}
                </span>
              ))}
            </div>
          </div>
        )}

        {/*
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <VolunteerSVG size={20} />
            <div>
              {volunteersSignedUp} / {maxVolunteers} volunteers
            </div>
          </div>
          <div className="text-sm font-semibold" style={{ color: PALETTE.teal }}>
            {capacityPct}% filled
          </div>
        </div>
        */}
        <div
          className="mt-2 h-2 w-full rounded-full"
          style={{ backgroundColor: "#eef7f0" }}
        >
          <div
            className="h-2 rounded-full"
            style={{
              width: `${capacityPct}%`,
              backgroundColor: capacityBarColor,
            }}
          />
        </div>
      </div>

      <div className="flex justify-around font-semibold mt-4">
        {/*
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
        */}
        <button
          className="pt-1 pb-1 pl-8 pr-8 rounded-3xl shadow text-white"
          style={{ backgroundColor: PALETTE.green }}
        >
          Signed up ☺️
        </button>
      </div>
    </div>
  );
}

function VolunteerProfile() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeEventTab, setActiveEventTab] = useState<
    "all" | "upcoming" | "past"
  >("all");
  const [loadingApi, setLoadingApi] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapApiEvent = (evt: any): Event => {
    const locationParts = [
      evt?.location?.address,
      evt?.location?.city,
      evt?.location?.state,
      evt?.location?.zip_code,
      evt?.location?.country,
    ]
      .filter(Boolean)
      .join(", ");

    const time =
      evt?.start_time && evt?.end_time
        ? `${evt.start_time} - ${evt.end_time}`
        : evt?.start_time || evt?.end_time || "Time TBD";

    return {
      id: evt?.event_id ?? evt?.id ?? Math.floor(Math.random() * 1_000_000),
      name: evt?.name ?? "Event",
      date: evt?.day ?? "",
      time,
      location: locationParts || "Location TBA",
      type: evt?.urgency ?? "General",
      description:
        evt?.description ?? evt?.event_description ?? evt?.details ?? "",
      organization: evt?.organization ?? "",
      volunteersSignedUp: evt?.assigned ?? 0,
      maxVolunteers: evt?.capacity ?? evt?.maxVolunteers ?? 0,
      requirements: Array.isArray(evt?.needed_skills) ? evt.needed_skills : [],
    };
  };

  // Fetch from backend when user is available
  useEffect(() => {
    if (authLoading || !user?.id) return;

    const controller = new AbortController();
    const loadProfile = async () => {
      try {
        setLoadingApi(true);
        setError(null);
        const res = await fetch(`${API_PREFIX}/vol/${user.id}`, {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        });

        if (!res.ok) {
          if (res.status === 401) {
            setError("Please log in to view your profile.");
            return;
          }
          if (res.status === 404) {
            setError("Volunteer profile not found.");
            return;
          }
          throw new Error(`Failed to load profile (${res.status})`);
        }

        const data: VolunteerApiResponse = await res.json();
        if (data?.volunteer) {
          console.log(
            "[volunteer-profile] raw volunteer from API",
            data.volunteer
          );
          const formattedAddress = formatAddress(data.volunteer);
          console.log(
            "[volunteer-profile] formatted address",
            formattedAddress
          );

          const profile = buildUserProfileFromApi(data.volunteer, user);
          console.log("[volunteer-profile] built user profile", profile);
          setUserProfile(profile);
        }

        const upcoming = Array.isArray(data?.upcoming_events)
          ? data.upcoming_events.map(mapApiEvent)
          : [];
        const past = Array.isArray(data?.past_events)
          ? data.past_events.map(mapApiEvent)
          : [];
        setEvents([...upcoming, ...past]);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("Failed to load profile", err);
        setError(err?.message || "Could not load profile.");
      } finally {
        setLoadingApi(false);
      }
    };

    loadProfile();
    return () => controller.abort();
  }, [authLoading, user?.id]);

  // Categorize events
  const upcomingEvents = events.filter((event) => {
    const eventDate = new Date(event.date + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate >= today;
  });

  const pastEvents = events.filter((event) => {
    const eventDate = new Date(event.date + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate < today;
  });

  useEffect(() => {
    setUserProfile((prev) =>
      prev ? { ...prev, totalHours: pastEvents.length * 3 } : prev
    );
  }, [pastEvents.length]);

  // Filter events based on active tab and search term
  const getFilteredEvents = () => {
    let eventsToFilter = events;

    if (activeEventTab === "upcoming") {
      eventsToFilter = upcomingEvents;
    } else if (activeEventTab === "past") {
      eventsToFilter = pastEvents;
    }

    return eventsToFilter.filter(
      (event) =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredEvents = getFilteredEvents();

  const [serverNotifications, setServerNotifications] = useState<any[]>([]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await getNotifications();

        // If backend returns { notifications: [...] }
        const list = Array.isArray(data) ? data : data.notifications ?? [];

        setServerNotifications(list);
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };

    loadNotifications();
  }, []);

  // We no longer add local (client-generated) notifications here. The
  // notification modal should display server-provided notifications only.

  // Get first name from full name
  const firstName = userProfile?.name.split(" ")[0] || "User";

  if (loadingApi || authLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: PALETTE.sand }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-16 w-16 border-b-4 mx-auto mb-4"
            style={{ borderColor: PALETTE.teal }}
          ></div>
          <p style={{ color: PALETTE.navy }} className="text-lg font-semibold">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ backgroundColor: PALETTE.sand }}
      >
        <div
          className="bg-white shadow-lg rounded-2xl p-8 max-w-md text-center border"
          style={{ borderColor: PALETTE.mint }}
        >
          <h2
            className="text-2xl font-bold mb-3"
            style={{ color: PALETTE.navy }}
          >
            Volunteer Profile
          </h2>
          <p className="mb-6" style={{ color: "#475569" }}>
            {error}
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="font-semibold py-2 px-6 rounded-full shadow-md"
              style={{ backgroundColor: PALETTE.teal, color: "white" }}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <nav className="flex justify-between items-center">
        <div className="hidden sm:flex gap-4 items-center"></div>
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
                <h2
                  className="text-2xl font-bold"
                  style={{ color: PALETTE.navy }}
                >
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
                  <div
                    className="font-semibold"
                    style={{ color: PALETTE.navy }}
                  >
                    Name
                  </div>
                  <div style={{ color: "#475569" }}>
                    {userProfile?.name ?? "-"}
                  </div>
                </div>
                <div>
                  <div
                    className="font-semibold"
                    style={{ color: PALETTE.navy }}
                  >
                    Email
                  </div>
                  <div style={{ color: "#475569" }}>
                    {userProfile?.email ?? "-"}
                  </div>
                </div>
                {/*
                <div>
                  <div className="font-semibold" style={{ color: PALETTE.navy }}>Phone</div>
                  <div style={{ color: "#475569" }}>{userProfile?.phone ?? "-"}</div>
                </div>
                */}
                <div>
                  <div
                    className="font-semibold"
                    style={{ color: PALETTE.navy }}
                  >
                    Address
                  </div>
                  <div style={{ color: "#475569" }}>
                    {userProfile?.address ?? "-"}
                  </div>
                </div>
                <div>
                  <div
                    className="font-semibold"
                    style={{ color: PALETTE.navy }}
                  >
                    Availability
                  </div>
                  <div style={{ color: "#475569" }}>
                    {userProfile?.bio ?? "-"}
                  </div>
                </div>
                <div>
                  <div
                    className="font-semibold"
                    style={{ color: PALETTE.navy }}
                  >
                    Skills
                  </div>
                  <div style={{ color: "#475569" }}>
                    {userProfile?.skills && userProfile.skills.length > 0
                      ? userProfile.skills.join(", ")
                      : "-"}
                  </div>
                </div>
                <div>
                  <div
                    className="font-semibold"
                    style={{ color: PALETTE.navy }}
                  >
                    Member Since
                  </div>
                  <div style={{ color: "#475569" }}>
                    {userProfile?.joinDate ?? "-"}
                  </div>
                </div>
                <div>
                  <div
                    className="font-semibold"
                    style={{ color: PALETTE.navy }}
                  >
                    Total Hours Volunteered
                  </div>
                  <div style={{ color: "#475569" }}>
                    {userProfile?.totalHours != null
                      ? `${userProfile.totalHours} hours`
                      : "-"}
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
                {/*
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
                */}
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
                <div style={{ color: PALETTE.navy }}>
                  Welcome back, {firstName}!
                </div>
                <div className="text-lg" style={{ color: "#64748B" }}>
                  {events.length === 0
                    ? "Ready to make a difference today?"
                    : `You have ${upcomingEvents.length} upcoming and ${pastEvents.length} past events`}
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  className="border p-3 rounded-xl transition-colors relative bg-white"
                  style={{ borderColor: PALETTE.mint }}
                  onClick={() => setIsNotificationModalOpen(true)}
                >
                  <NotificationBellSVG size={30} />
                  {serverNotifications.length > 0 && (
                    <span
                      className="absolute -top-1 -right-1 text-xs rounded-full h-5 w-5 flex items-center justify-center"
                      style={{ backgroundColor: "#ef4444", color: "#fff" }}
                    >
                      {serverNotifications.length}
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

        <div
          className="ml-5 mr-5"
          style={{ borderTop: `1px solid ${PALETTE.mint}` }}
        />

        <section>
          <div className="flex justify-around gap-8 p-4 flex-col items-center md:flex-row">
            <Card
              icon={<VolunteerSVG size={64} />}
              title={events.length.toString()}
              subtitle="Total events"
            />
            <Card
              icon={<ClockSVG size={64} />}
              title={(pastEvents.length * 3).toString()}
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
                  {events.length === 0
                    ? "Events you've signed up for"
                    : `${filteredEvents.length} ${activeEventTab} event${
                        filteredEvents.length !== 1 ? "s" : ""
                      } found`}
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
              <div
                className="flex rounded-full p-1"
                style={{ backgroundColor: PALETTE.sand }}
              >
                <button
                  onClick={() => setActiveEventTab("all")}
                  className={`px-6 py-2 rounded-full transition-all ${
                    activeEventTab === "all"
                      ? "bg-white shadow-sm"
                      : "hover:bg-white hover:bg-opacity-50"
                  }`}
                  style={{
                    color:
                      activeEventTab === "all" ? PALETTE.navy : PALETTE.teal,
                    fontWeight: activeEventTab === "all" ? "600" : "400",
                  }}
                >
                  All Events ({events.length})
                </button>
                <button
                  onClick={() => setActiveEventTab("upcoming")}
                  className={`px-6 py-2 rounded-full transition-all ${
                    activeEventTab === "upcoming"
                      ? "bg-white shadow-sm"
                      : "hover:bg-white hover:bg-opacity-50"
                  }`}
                  style={{
                    color:
                      activeEventTab === "upcoming"
                        ? PALETTE.navy
                        : PALETTE.teal,
                    fontWeight: activeEventTab === "upcoming" ? "600" : "400",
                  }}
                >
                  Upcoming ({upcomingEvents.length})
                </button>
                <button
                  onClick={() => setActiveEventTab("past")}
                  className={`px-6 py-2 rounded-full transition-all ${
                    activeEventTab === "past"
                      ? "bg-white shadow-sm"
                      : "hover:bg-white hover:bg-opacity-50"
                  }`}
                  style={{
                    color:
                      activeEventTab === "past" ? PALETTE.navy : PALETTE.teal,
                    fontWeight: activeEventTab === "past" ? "600" : "400",
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
                  {activeEventTab === "upcoming"
                    ? "📅"
                    : activeEventTab === "past"
                    ? "✅"
                    : "📋"}
                </div>
                <h3
                  className="text-xl font-semibold mb-2"
                  style={{ color: PALETTE.navy }}
                >
                  {events.length === 0
                    ? "No Events Signed Up Yet"
                    : activeEventTab === "upcoming"
                    ? "No Upcoming Events"
                    : activeEventTab === "past"
                    ? "No Past Events"
                    : "No Events Match Your Search"}
                </h3>
                <p className="mb-6" style={{ color: PALETTE.teal }}>
                  {events.length === 0
                    ? "Browse available events and sign up to see them here!"
                    : activeEventTab === "upcoming"
                    ? "You don't have any upcoming events. Check out available events!"
                    : activeEventTab === "past"
                    ? "You haven't completed any events yet."
                    : "Try adjusting your search terms."}
                </p>
                {events.length === 0 || activeEventTab === "upcoming" ? (
                  <button
                    onClick={() => navigate("/user-event-site")}
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
        notifications={serverNotifications.map((n) => ({
          title: n?.subject ?? n?.title ?? n?.name ?? "Notification",
          description:
            n?.body ?? n?.description ?? n?.message ?? JSON.stringify(n) ?? "",
        }))}
      />
    </>
  );
}

export default VolunteerProfile;
