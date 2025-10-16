// src/components/EventsPage.tsx
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

const navigate = useNavigate();

function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    // Load events from localStorage
    const savedEvents = localStorage.getItem('events');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
  }, []);

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#F0EADF" }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center" style={{ color: "#22577A" }}>
          Available Volunteer Events
        </h1>
        
        {events.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-lg mb-4">No events available yet.</p>
            <button 
              onClick={() => navigate('/event-page')}
              className="font-semibold py-2 px-6 rounded-full shadow-md"
              style={{ backgroundColor: "#38A3A5", color: "white" }}
            >
              Create First Event
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EventsPage;