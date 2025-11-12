import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EventCard from "./EventCard";

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

const PALETTE = {
  navy: "#22577A",
  teal: "#38A3A5",
  green: "#26A96C",
  mint: "#80ED99",
  sand: "#F0EADF",
};

function EventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");

  // Function to check if an event date has passed
  const isEventExpired = (eventDate: string, eventTime: string): boolean => {
    const now = new Date();
    const eventDateTime = new Date(`${eventDate}T${eventTime}`);
    return eventDateTime < now;
  };

  // Function to clean up expired events
  const cleanupExpiredEvents = (eventsList: Event[]): Event[] => {
    const activeEvents = eventsList.filter(event => !isEventExpired(event.date, event.time));
    
    // If any events were removed, update localStorage
    if (activeEvents.length !== eventsList.length) {
      const expiredCount = eventsList.length - activeEvents.length;
      console.log(`Removed ${expiredCount} expired event(s)`);
      
      // Also clean up from signed-up events
      const signedUpEvents = JSON.parse(localStorage.getItem('signedUpEvents') || '[]');
      const activeSignedUpEvents = signedUpEvents.filter(
        (event: Event) => !isEventExpired(event.date, event.time)
      );
      localStorage.setItem('signedUpEvents', JSON.stringify(activeSignedUpEvents));
    }
    
    return activeEvents;
  };

  // Load events from localStorage and clean up expired ones
  useEffect(() => {
    const savedEvents = localStorage.getItem('events');
    if (savedEvents) {
      const parsedEvents = JSON.parse(savedEvents);
      const activeEvents = cleanupExpiredEvents(parsedEvents);
      setEvents(activeEvents);
      localStorage.setItem('events', JSON.stringify(activeEvents));
    }
  }, []);

  // Periodic cleanup - check every minute for expired events
  useEffect(() => {
    const intervalId = setInterval(() => {
      setEvents(currentEvents => {
        const activeEvents = cleanupExpiredEvents(currentEvents);
        if (activeEvents.length !== currentEvents.length) {
          localStorage.setItem('events', JSON.stringify(activeEvents));
        }
        return activeEvents;
      });
    }, 60000); // Check every 60 seconds

    return () => clearInterval(intervalId);
  }, []);

  // Filter events based on search and type
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "" || event.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleSignUp = (eventId: number) => {
    const eventToSignUp = events.find(event => event.id === eventId);
    
    if (!eventToSignUp) {
      alert("Event not found!");
      return;
    }

    // Check if event has expired
    if (isEventExpired(eventToSignUp.date, eventToSignUp.time)) {
      alert("This event has already passed and is no longer available.");
      // Clean up the expired event
      const activeEvents = events.filter(e => e.id !== eventId);
      setEvents(activeEvents);
      localStorage.setItem('events', JSON.stringify(activeEvents));
      return;
    }

    // Check if event is already full
    if (eventToSignUp.volunteersSignedUp >= eventToSignUp.maxVolunteers) {
      alert("This event is already full!");
      return;
    }

    // Check if user already signed up for this event
    const signedUpEvents = JSON.parse(localStorage.getItem('signedUpEvents') || '[]');
    const alreadySignedUp = signedUpEvents.some((e: Event) => e.id === eventId);
    
    if (alreadySignedUp) {
      alert("You have already signed up for this event!");
      return;
    }

    // Update the main events list - increment volunteersSignedUp
    const updatedEvents = events.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          volunteersSignedUp: event.volunteersSignedUp + 1
        };
      }
      return event;
    });
    
    setEvents(updatedEvents);
    localStorage.setItem('events', JSON.stringify(updatedEvents));
    
    // Save to user's signed-up events
    const updatedSignedUpEvents = [
      ...signedUpEvents, 
      { 
        ...eventToSignUp, 
        volunteersSignedUp: eventToSignUp.volunteersSignedUp + 1
      }
    ];
    localStorage.setItem('signedUpEvents', JSON.stringify(updatedSignedUpEvents));
    
    alert(`Successfully signed up for ${eventToSignUp.name}!`);
  };

  const handleRemoveEvent = (eventId: number) => {
    // Remove event from main events list
    const updatedEvents = events.filter(event => event.id !== eventId);
    setEvents(updatedEvents);
    localStorage.setItem('events', JSON.stringify(updatedEvents));

    // Also remove from signed-up events
    const signedUpEvents = JSON.parse(localStorage.getItem('signedUpEvents') || '[]');
    const updatedSignedUpEvents = signedUpEvents.filter((event: Event) => event.id !== eventId);
    localStorage.setItem('signedUpEvents', JSON.stringify(updatedSignedUpEvents));

    alert("Event removed successfully!");
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

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="p-3 rounded border focus:outline-none focus:ring-2 bg-white"
              style={{ borderColor: PALETTE.mint, color: PALETTE.navy }}
            >
              <option value="">All Types</option>
              <option value="Environment">Environment</option>
              <option value="Community">Community</option>
              <option value="Education">Education</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Other">Other</option>
            </select>

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
        {filteredEvents.length === 0 ? (
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
                onSignUp={() => handleSignUp(event.id)}
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