import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/user-context";
import { parseLocalDate } from "../utils/dateUtils";

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

interface ApiLocation {
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
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

const PALETTE = {
  navy: "#22577A",
  teal: "#38A3A5",
  green: "#26A96C",
  mint: "#80ED99",
  sand: "#F0EADF",
};

const API_PREFIX = "/api";

function UserEventSite() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [signedUpEvents, setSignedUpEvents] = useState<number[]>([]);

  const mapApiEvent = (evt: ApiEvent): Event => {
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
      id: evt.event_id ?? evt.id ?? Math.floor(Math.random() * 1_000_000),
      name: evt.name ?? "Event",
      date: evt.day ?? "",
      time,
      location: locationParts || "Location TBA",
      type: evt.urgency ?? "General",
      description: evt.description ?? "",
      organization: evt.organization ?? "",
      volunteersSignedUp: evt.assigned ?? 0,
      maxVolunteers: evt.capacity ?? 0,
      requirements: Array.isArray(evt.needed_skills) ? evt.needed_skills : [],
    };
  };

  // Load events and user's signed-up events from backend
  useEffect(() => {
    const controller = new AbortController();

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all events (public endpoint - no auth required). Try trailing slash first (works for some deployments), then without.
        let eventsRes = await fetch(`${API_PREFIX}/events/`, {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        if (eventsRes.status === 404) {
          eventsRes = await fetch(`${API_PREFIX}/events`, {
            method: "GET",
            credentials: "include",
            headers: { Accept: "application/json" },
            signal: controller.signal,
          });
        }

        if (!eventsRes.ok) {
          throw new Error(`Failed to load events (${eventsRes.status})`);
        }

        const eventsJson: any = await eventsRes.json();
        const rawEvents: ApiEvent[] = Array.isArray(eventsJson)
          ? eventsJson
          : Array.isArray(eventsJson?.results)
          ? eventsJson.results
          : [];
        const mappedEvents = rawEvents.map(mapApiEvent);
        setEvents(mappedEvents);

        // Only fetch volunteer profile if user is logged in
        if (user?.id) {
          const volRes = await fetch(`${API_PREFIX}/vol/${user.id}`, {
            method: "GET",
            credentials: "include",
            headers: { Accept: "application/json" },
            signal: controller.signal,
          });

          if (volRes.ok) {
            const volData = await volRes.json();
            const upcoming = Array.isArray(volData?.upcoming_events)
              ? volData.upcoming_events.map(mapApiEvent)
              : [];

            // Extract event IDs from upcoming events
            const upcomingIds = upcoming.map((e: Event) => e.id);
            setSignedUpEvents(upcomingIds);
          }
        }
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        console.error("Failed to load events", err);
        setError(err?.message || "Could not load events.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
    return () => controller.abort();
  }, [user?.id]);

  // Filter events based on search and filter criteria
  useEffect(() => {
    let filtered = [...events];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType) {
      filtered = filtered.filter((event) => event.type === filterType);
    }

    // Sort by date (upcoming events first) — use local-date parsing
    filtered.sort((a, b) => {
      const da = parseLocalDate(a.date);
      const db = parseLocalDate(b.date);
      const ta = da ? da.getTime() : 0;
      const tb = db ? db.getTime() : 0;
      return ta - tb;
    });

    setFilteredEvents(filtered);
  }, [events, searchTerm, filterType]);

  const handleSignUp = async (eventId: number) => {
    if (!user?.id) {
      alert("Please log in as a volunteer to sign up for events.");
      return;
    }

    if (signedUpEvents.includes(eventId)) {
      alert("You are already signed up for this event!");
      setSelectedEvent(null);
      return;
    }

    try {
      const res = await fetch(`${API_PREFIX}/events/${eventId}/signup`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Signup failed:", errorText);
        alert("Could not sign up for this event. Please try again.");
        return;
      }

      // Update signed up events list
      setSignedUpEvents((prev) => [...prev, eventId]);

      // Update volunteer count for the event
      setEvents((prevEvents) =>
        prevEvents.map((ev) =>
          ev.id === eventId && ev.volunteersSignedUp < ev.maxVolunteers
            ? { ...ev, volunteersSignedUp: ev.volunteersSignedUp + 1 }
            : ev
        )
      );

      alert("Successfully signed up for the event!");
      setSelectedEvent(null);
    } catch (err) {
      console.error("Error signing up:", err);
      alert("Something went wrong while signing up. Please try again.");
    }
  };

  const isUserSignedUp = (eventId: number) => signedUpEvents.includes(eventId);

  const formatDate = (dateString: string) => {
    if (!dateString) return "Date TBD";
    const d = parseLocalDate(dateString);
    if (!d) return "Date TBD";
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString || typeof timeString !== "string") return "";
    if (timeString.includes("-")) {
      const parts = timeString.split("-").map((p) => p.trim());
      const formattedParts = parts.map((part) => {
        const [hours, minutes] = part.split(":");
        const hourNum = parseInt(hours, 10);
        if (Number.isNaN(hourNum) || !minutes) return part;
        const ampm = hourNum >= 12 ? "PM" : "AM";
        const displayHour = hourNum % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
      });
      return formattedParts.join(" - ");
    }
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    if (Number.isNaN(hour) || !minutes) return timeString;
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getAvailableSpots = (event: Event) =>
    event.maxVolunteers - event.volunteersSignedUp;

  const isEventFull = (event: Event) =>
    event.volunteersSignedUp >= event.maxVolunteers;

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: PALETTE.sand }}
      >
        <div className="text-xl font-semibold" style={{ color: PALETTE.navy }}>
          Loading events...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: PALETTE.sand }}>
      <div className="max-w-6xl mx-auto">
        {error && (
          <div className="bg-red-100 text-red-700 border border-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-bold mb-2"
            style={{ color: PALETTE.navy }}
          >
            Volunteer Events
          </h1>
          <p className="text-lg" style={{ color: PALETTE.teal }}>
            Find and sign up for volunteer opportunities in your community
          </p>
          {user?.id && (
            <button
              onClick={() => navigate("/volunteer-profile")}
              className="mt-4 font-semibold py-2 px-6 rounded-full transition-transform hover:scale-105"
              style={{
                backgroundColor: PALETTE.navy,
                color: "white",
              }}
            >
              View My Profile
            </button>
          )}
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className="block font-semibold mb-2"
                style={{ color: PALETTE.navy }}
              >
                Search Events
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, organization, location..."
                className="w-full p-3 rounded border focus:outline-none focus:ring-2"
                style={{ borderColor: PALETTE.mint }}
              />
            </div>

            <div>
              <label
                className="block font-semibold mb-2"
                style={{ color: PALETTE.navy }}
              >
                Filter by Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full p-3 rounded border focus:outline-none focus:ring-2"
                style={{ borderColor: PALETTE.mint }}
              >
                <option value="">All Types</option>
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>
          </div>
        </div>

        {/* Events Count */}
        <div className="mb-4">
          <p className="text-lg font-semibold" style={{ color: PALETTE.navy }}>
            {filteredEvents.length}{" "}
            {filteredEvents.length === 1 ? "Event" : "Events"} Available
          </p>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-md text-center">
            <p className="text-xl" style={{ color: PALETTE.teal }}>
              No events found. Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedEvent(event)}
              >
                <div
                  className="px-4 py-2 text-white font-semibold text-sm"
                  style={{ backgroundColor: PALETTE.teal }}
                >
                  {event.type}
                </div>

                <div className="p-6">
                  <h3
                    className="text-xl font-bold mb-2"
                    style={{ color: PALETTE.navy }}
                  >
                    {event.name}
                  </h3>

                  <p
                    className="text-sm font-semibold mb-3"
                    style={{ color: PALETTE.teal }}
                  >
                    {event.organization}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <span
                        className="font-semibold mr-2"
                        style={{ color: PALETTE.navy }}
                      >
                        📅
                      </span>
                      <span>{formatDate(event.date)}</span>
                    </div>

                    <div className="flex items-center text-sm">
                      <span
                        className="font-semibold mr-2"
                        style={{ color: PALETTE.navy }}
                      >
                        🕐
                      </span>
                      <span>{formatTime(event.time)}</span>
                    </div>

                    <div className="flex items-center text-sm">
                      <span
                        className="font-semibold mr-2"
                        style={{ color: PALETTE.navy }}
                      >
                        📍
                      </span>
                      <span>{event.location}</span>
                    </div>
                  </div>

                  <p
                    className="text-sm mb-4 line-clamp-3"
                    style={{ color: PALETTE.navy }}
                  >
                    {event.description}
                  </p>

                  <div className="mb-4">
                    {isUserSignedUp(event.id) ? (
                      <div
                        className="text-sm font-semibold mb-2"
                        style={{ color: PALETTE.green }}
                      >
                        ✓ You are signed up for this event
                      </div>
                    ) : isEventFull(event) ? (
                      <div className="text-sm font-semibold text-red-500 mb-2">
                        EVENT FULL
                      </div>
                    ) : (
                      <div
                        className="text-sm font-semibold mb-2"
                        style={{ color: PALETTE.green }}
                      >
                        {getAvailableSpots(event)} spots available
                      </div>
                    )}
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${
                            (event.volunteersSignedUp / event.maxVolunteers) *
                            100
                          }%`,
                          backgroundColor: isEventFull(event)
                            ? "#ef4444"
                            : PALETTE.green,
                        }}
                      />
                    </div>
                  </div>

                  <button
                    className="w-full font-semibold py-2 rounded-full transition-transform hover:scale-105"
                    style={{
                      backgroundColor: isUserSignedUp(event.id)
                        ? PALETTE.green
                        : PALETTE.teal,
                      color: "white",
                      opacity:
                        isEventFull(event) && !isUserSignedUp(event.id)
                          ? 0.5
                          : 1,
                    }}
                    disabled={isEventFull(event) && !isUserSignedUp(event.id)}
                  >
                    {isUserSignedUp(event.id)
                      ? "Already Signed Up"
                      : "View Details"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Event Detail Modal */}
        {selectedEvent && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedEvent(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="px-6 py-4 text-white font-semibold"
                style={{ backgroundColor: PALETTE.teal }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm">{selectedEvent.type}</span>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="text-2xl hover:opacity-80"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6">
                <h2
                  className="text-3xl font-bold mb-2"
                  style={{ color: PALETTE.navy }}
                >
                  {selectedEvent.name}
                </h2>

                <p
                  className="text-lg font-semibold mb-6"
                  style={{ color: PALETTE.teal }}
                >
                  {selectedEvent.organization}
                </p>

                <div className="space-y-4 mb-6">
                  <div className="flex items-start">
                    <span
                      className="font-semibold mr-3 text-xl"
                      style={{ color: PALETTE.navy }}
                    >
                      📅
                    </span>
                    <div>
                      <p
                        className="font-semibold"
                        style={{ color: PALETTE.navy }}
                      >
                        Date
                      </p>
                      <p>{formatDate(selectedEvent.date)}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <span
                      className="font-semibold mr-3 text-xl"
                      style={{ color: PALETTE.navy }}
                    >
                      🕐
                    </span>
                    <div>
                      <p
                        className="font-semibold"
                        style={{ color: PALETTE.navy }}
                      >
                        Time
                      </p>
                      <p>{formatTime(selectedEvent.time)}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <span
                      className="font-semibold mr-3 text-xl"
                      style={{ color: PALETTE.navy }}
                    >
                      📍
                    </span>
                    <div>
                      <p
                        className="font-semibold"
                        style={{ color: PALETTE.navy }}
                      >
                        Location
                      </p>
                      <p>{selectedEvent.location}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3
                    className="font-semibold text-lg mb-2"
                    style={{ color: PALETTE.navy }}
                  >
                    Description
                  </h3>
                  <p className="text-gray-700">{selectedEvent.description}</p>
                </div>

                {selectedEvent.requirements.length > 0 &&
                  selectedEvent.requirements[0] !== "" && (
                    <div className="mb-6">
                      <h3
                        className="font-semibold text-lg mb-2"
                        style={{ color: PALETTE.navy }}
                      >
                        Required Skills
                      </h3>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedEvent.requirements
                          .filter((req) => req.trim() !== "")
                          .map((req, index) => (
                            <li key={index} className="text-gray-700">
                              {req}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3
                      className="font-semibold text-lg"
                      style={{ color: PALETTE.navy }}
                    >
                      Volunteers
                    </h3>
                    {isUserSignedUp(selectedEvent.id) ? (
                      <span
                        className="text-sm font-semibold"
                        style={{ color: PALETTE.green }}
                      >
                        ✓ You are signed up
                      </span>
                    ) : isEventFull(selectedEvent) ? (
                      <span className="text-sm font-semibold text-red-500">
                        EVENT FULL
                      </span>
                    ) : (
                      <span
                        className="text-sm font-semibold"
                        style={{ color: PALETTE.green }}
                      >
                        {getAvailableSpots(selectedEvent)} spots available
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="h-4 rounded-full transition-all flex items-center justify-center text-xs text-white font-semibold"
                      style={{
                        width: `${
                          (selectedEvent.volunteersSignedUp /
                            selectedEvent.maxVolunteers) *
                          100
                        }%`,
                        backgroundColor: isEventFull(selectedEvent)
                          ? "#ef4444"
                          : PALETTE.green,
                        minWidth:
                          selectedEvent.volunteersSignedUp > 0 ? "50px" : "0",
                      }}
                    >
                      {selectedEvent.volunteersSignedUp}/
                      {selectedEvent.maxVolunteers}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setSelectedEvent(null)}
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
                    onClick={() => handleSignUp(selectedEvent.id)}
                    disabled={
                      isEventFull(selectedEvent) ||
                      isUserSignedUp(selectedEvent.id)
                    }
                    className="flex-1 font-semibold py-3 rounded-full transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: isUserSignedUp(selectedEvent.id)
                        ? PALETTE.green
                        : PALETTE.teal,
                      color: "white",
                    }}
                  >
                    {isUserSignedUp(selectedEvent.id)
                      ? "Already Signed Up"
                      : isEventFull(selectedEvent)
                      ? "Event Full"
                      : "Sign Up"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserEventSite;
