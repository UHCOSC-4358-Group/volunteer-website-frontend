import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EventCard from "./EventCard";
import { useAuth } from "../hooks/user-context";
import {
  getOrgDashboard,
  getOrgEvents,
  deleteOrgEvent,
} from "../services/orgService";
import type { ApiLocation, ApiOrgEvent } from "../services/orgService";

interface Event {
  id: number;
  name: string;
  description: string;
  location: string;
  locationObj?: ApiLocation | null;
  requiredSkills: string[];
  urgency: string;
  date: string;
  startTime?: string;
  endTime?: string;
  capacity: number;
  assigned: number;
  orgId?: number;
  organization: string;
  time: string;
  type: string;
  volunteersSignedUp: number;
  maxVolunteers: number;
  requirements: string[];
}

const PALETTE = {
  navy: "#22577A",
  teal: "#38A3A5",
  green: "#26A96C",
  mint: "#80ED99",
  sand: "#F0EADF",
};

const formatLocation = (location?: ApiLocation | null) => {
  if (!location) return "No location";
  const parts = [
    location.address,
    location.city,
    location.state,
    location.zip_code,
    location.country,
  ]
    .filter(Boolean)
    .map((s) => s?.trim())
    .filter(Boolean);
  return parts.join(", ") || "No location";
};

const mapEvent = (evt: ApiOrgEvent, orgName: string): Event => {
  const requiredSkills = Array.isArray(evt.needed_skills)
    ? evt.needed_skills.map((s) => (typeof s === "string" ? s : s.skill))
    : [];

  const startTime = evt.start_time || (evt as any).startTime || "";
  const endTime = evt.end_time || (evt as any).endTime || "";
  const capacity = evt.capacity ?? 0;
  const assigned = evt.assigned ?? 0;

  return {
    id: evt.id,
    name: evt.name,
    description: evt.description,
    location: formatLocation(evt.location),
    locationObj: evt.location,
    requiredSkills,
    urgency: (evt.urgency || "Low").toLowerCase(),
    date: evt.day || (evt as any).date || "",
    startTime,
    endTime,
    capacity,
    assigned,
    orgId: evt.org_id,
    organization: orgName || "My Organization",
    time: startTime
      ? `${startTime}${endTime ? ` - ${endTime}` : ""}`
      : "TBD",
    type: "Organization Event",
    volunteersSignedUp: assigned,
    maxVolunteers: capacity,
    requirements: requiredSkills,
  };
};

function EventsPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user?.id) {
      setLoadingEvents(false);
      setError("You must be logged in as an admin to view events.");
      return;
    }

    const loadEvents = async () => {
      setLoadingEvents(true);
      setError(null);
      try {
        const [profile, orgEvents] = await Promise.all([
          getOrgDashboard(user.id),
          getOrgEvents(),
        ]);

        const orgName = profile?.organization?.name ?? "My Organization";

        const eventsFromApi =
          (Array.isArray(orgEvents) && orgEvents.length > 0
            ? orgEvents
            : profile?.upcoming_events) || [];

        const mapped = eventsFromApi.map((evt: ApiOrgEvent) =>
          mapEvent(evt, orgName)
        );

        setEvents(mapped);
      } catch (err) {
        console.error("Failed to load events", err);
        setError(
          err instanceof Error ? err.message : "Failed to load events."
        );
      } finally {
        setLoadingEvents(false);
      }
    };

    loadEvents();
  }, [loading, user?.id]);

  // Filter events based on search and type
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "" || event.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleSignUp = () => {
    alert("Sign-ups are managed via the volunteer view.");
  };

  const handleRemoveEvent = async (eventId: number) => {
    if (!window.confirm("Remove this event?")) return;
    try {
      await deleteOrgEvent(eventId);
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
    } catch (err) {
      console.error("Failed to delete event", err);
      alert(
        err instanceof Error ? err.message : "Failed to delete event. Try again."
      );
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: PALETTE.sand }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4" style={{ color: PALETTE.navy }}>
            Volunteer Opportunities
          </h1>
          <p className="text-lg mb-6" style={{ color: PALETTE.teal }}>
            Find and join events that match your interests and skills
          </p>
          
          {/* Search and Filter Section */}
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-8">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <input
                type="text"
                placeholder="Search events, organizations, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 pl-10 rounded-full border focus:outline-none focus:ring-2 bg-white"
                style={{ borderColor: PALETTE.mint }}
              />
              <svg 
                className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                width="20" 
                height="20" 
                fill={PALETTE.teal}
                viewBox="0 0 16 16"
              >
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
              </svg>
            </div>

            {/* Create Event Button */}
            <button
              onClick={() => navigate('/create-event')}
              className="font-semibold py-3 px-6 rounded-full shadow-md transition-transform hover:scale-105"
              style={{ backgroundColor: PALETTE.teal, color: "white" }}
            >
              Create New Event
            </button>
          </div>
        </div>

        {/* Events Grid */}
        {error && (
          <div className="text-center p-4 mb-4 text-red-600 bg-white rounded-xl border">
            {error}
          </div>
        )}
        {loadingEvents ? (
          <div className="text-center p-12 bg-white rounded-2xl shadow-md">
            Loading events...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-2xl shadow-md">
            <div className="text-6xl mb-4" style={{ color: PALETTE.mint }}>📋</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: PALETTE.navy }}>
              {events.length === 0 ? "No Events Created Yet" : "No Events Match Your Search"}
            </h3>
            <p className="mb-6" style={{ color: PALETTE.teal }}>
              {events.length === 0 
                ? "Be the first to create a volunteer event!" 
                : "Try adjusting your search terms or filters."
              }
            </p>
            {events.length === 0 && (
              <button
                onClick={() => navigate('/create-event')}
                className="font-semibold py-3 px-8 rounded-full shadow-md transition-transform hover:scale-105"
                style={{ backgroundColor: PALETTE.teal, color: "white" }}
              >
                Create Your First Event
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <EventCard 
                key={event.id} 
                event={event}
                onSignUp={handleSignUp}
                showEditButton={true} // Set based on user role (organizer/admin)
                showRemoveButton={true} // Set based on user role (organizer/admin)
                onRemove={handleRemoveEvent}
              />
            ))}
          </div>
        )}

        {/* Stats Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex gap-8 p-6 bg-white rounded-2xl shadow-md">
            <div>
              <div className="text-2xl font-bold" style={{ color: PALETTE.navy }}>
                {events.length}
              </div>
              <div style={{ color: PALETTE.teal }}>Active Events</div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: PALETTE.navy }}>
                {events.reduce((total, event) => total + event.volunteersSignedUp, 0)}
              </div>
              <div style={{ color: PALETTE.teal }}>Volunteers Signed Up</div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: PALETTE.navy }}>
                {events.reduce((total, event) => total + event.maxVolunteers, 0)}
              </div>
              <div style={{ color: PALETTE.teal }}>Total Spots Available</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventsPage;
