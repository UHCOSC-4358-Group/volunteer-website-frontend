import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

function UserEventSite() {
  
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [signedUpEvents, setSignedUpEvents] = useState<number[]>([]);

  // Load events and user's signed-up events from localStorage
  useEffect(() => {
    loadEvents();
    loadSignedUpEvents();
  }, []);

  // Filter events based on search and filter criteria
  useEffect(() => {
    let filtered = [...events];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType) {
      filtered = filtered.filter(event => event.type === filterType);
    }

    // Sort by date (upcoming events first)
    filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setFilteredEvents(filtered);
  }, [events, searchTerm, filterType]);

  const loadEvents = () => {
    try {
      const storedEvents = localStorage.getItem('events');
      if (storedEvents) {
        const parsedEvents = JSON.parse(storedEvents);
        setEvents(parsedEvents);
        setFilteredEvents(parsedEvents);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSignedUpEvents = () => {
    try {
      const storedSignedUpEvents = localStorage.getItem('userSignedUpEvents');
      if (storedSignedUpEvents) {
        setSignedUpEvents(JSON.parse(storedSignedUpEvents));
      }
    } catch (error) {
      console.error('Error loading signed up events:', error);
    }
  };

  const handleSignUp = (eventId: number) => {
    // Check if user is already signed up for this event
    if (signedUpEvents.includes(eventId)) {
      alert('You are already signed up for this event!');
      setSelectedEvent(null);
      return;
    }

    const eventToSignUp = events.find(event => event.id === eventId);
    if (!eventToSignUp) {
      alert('Event not found!');
      return;
    }

    // Update events count
    const updatedEvents = events.map(event => {
      if (event.id === eventId && event.volunteersSignedUp < event.maxVolunteers) {
        return {
          ...event,
          volunteersSignedUp: event.volunteersSignedUp + 1
        };
      }
      return event;
    });

    // Update signed up events for the user
    const updatedSignedUpEvents = [...signedUpEvents, eventId];
    
    // Save to signedUpEvents localStorage (for profile page)
    const existingSignedUpEventsData = localStorage.getItem('signedUpEvents');
    let signedUpEventsData: Event[] = [];
    
    if (existingSignedUpEventsData) {
      signedUpEventsData = JSON.parse(existingSignedUpEventsData);
    }
    
    // Add the new event to signedUpEvents
    signedUpEventsData.push(eventToSignUp);
    
    // Update all states and localStorage
    setEvents(updatedEvents);
    setSignedUpEvents(updatedSignedUpEvents);
    
    localStorage.setItem('events', JSON.stringify(updatedEvents));
    localStorage.setItem('userSignedUpEvents', JSON.stringify(updatedSignedUpEvents));
    localStorage.setItem('signedUpEvents', JSON.stringify(signedUpEventsData));
    
    alert('Successfully signed up for the event!');
    setSelectedEvent(null);
  };

  const isUserSignedUp = (eventId: number) => {
    return signedUpEvents.includes(eventId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getAvailableSpots = (event: Event) => {
    return event.maxVolunteers - event.volunteersSignedUp;
  };

  const isEventFull = (event: Event) => {
    return event.volunteersSignedUp >= event.maxVolunteers;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: PALETTE.sand }}>
        <div className="text-xl font-semibold" style={{ color: PALETTE.navy }}>
          Loading events...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: PALETTE.sand }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: PALETTE.navy }}>
            Volunteer Events
          </h1>
          <p className="text-lg" style={{ color: PALETTE.teal }}>
            Find and sign up for volunteer opportunities in your community
          </p>
          <button
            onClick={() => navigate('/volunteer-profile')}
            className="mt-4 font-semibold py-2 px-6 rounded-full transition-transform hover:scale-105"
            style={{ 
              backgroundColor: PALETTE.navy, 
              color: "white"
            }}
          >
            View My Profile
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block font-semibold mb-2" style={{ color: PALETTE.navy }}>
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

            {/* Filter by Type */}
            <div>
              <label className="block font-semibold mb-2" style={{ color: PALETTE.navy }}>
                Filter by Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full p-3 rounded border focus:outline-none focus:ring-2"
                style={{ borderColor: PALETTE.mint }}
              >
                <option value="">All Types</option>
                <option value="Environment">Environment</option>
                <option value="Community">Community</option>
                <option value="Education">Education</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Events Count */}
        <div className="mb-4">
          <p className="text-lg font-semibold" style={{ color: PALETTE.navy }}>
            {filteredEvents.length} {filteredEvents.length === 1 ? 'Event' : 'Events'} Available
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
                {/* Event Type Badge */}
                <div 
                  className="px-4 py-2 text-white font-semibold text-sm"
                  style={{ backgroundColor: PALETTE.teal }}
                >
                  {event.type}
                </div>

                {/* Event Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2" style={{ color: PALETTE.navy }}>
                    {event.name}
                  </h3>
                  
                  <p className="text-sm font-semibold mb-3" style={{ color: PALETTE.teal }}>
                    {event.organization}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <span className="font-semibold mr-2" style={{ color: PALETTE.navy }}>📅</span>
                      <span>{formatDate(event.date)}</span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <span className="font-semibold mr-2" style={{ color: PALETTE.navy }}>🕐</span>
                      <span>{formatTime(event.time)}</span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <span className="font-semibold mr-2" style={{ color: PALETTE.navy }}>📍</span>
                      <span>{event.location}</span>
                    </div>
                  </div>

                  <p className="text-sm mb-4 line-clamp-3" style={{ color: PALETTE.navy }}>
                    {event.description}
                  </p>

                  {/* Spots Available & Sign Up Status */}
                  <div className="mb-4">
                    {isUserSignedUp(event.id) ? (
                      <div className="text-sm font-semibold mb-2" style={{ color: PALETTE.green }}>
                        ✓ You are signed up for this event
                      </div>
                    ) : isEventFull(event) ? (
                      <div className="text-sm font-semibold text-red-500 mb-2">
                        EVENT FULL
                      </div>
                    ) : (
                      <div className="text-sm font-semibold mb-2" style={{ color: PALETTE.green }}>
                        {getAvailableSpots(event)} spots available
                      </div>
                    )}
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${(event.volunteersSignedUp / event.maxVolunteers) * 100}%`,
                          backgroundColor: isEventFull(event) ? '#ef4444' : PALETTE.green
                        }}
                      />
                    </div>
                  </div>

                  <button
                    className="w-full font-semibold py-2 rounded-full transition-transform hover:scale-105"
                    style={{ 
                      backgroundColor: isUserSignedUp(event.id) ? PALETTE.green : PALETTE.teal, 
                      color: "white",
                      opacity: (isEventFull(event) && !isUserSignedUp(event.id)) ? 0.5 : 1
                    }}
                    disabled={isEventFull(event) && !isUserSignedUp(event.id)}
                  >
                    {isUserSignedUp(event.id) ? 'Already Signed Up' : 'View Details'}
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
              {/* Modal Header */}
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

              {/* Modal Content */}
              <div className="p-6">
                <h2 className="text-3xl font-bold mb-2" style={{ color: PALETTE.navy }}>
                  {selectedEvent.name}
                </h2>
                
                <p className="text-lg font-semibold mb-6" style={{ color: PALETTE.teal }}>
                  {selectedEvent.organization}
                </p>

                {/* Event Details */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-start">
                    <span className="font-semibold mr-3 text-xl" style={{ color: PALETTE.navy }}>📅</span>
                    <div>
                      <p className="font-semibold" style={{ color: PALETTE.navy }}>Date</p>
                      <p>{formatDate(selectedEvent.date)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <span className="font-semibold mr-3 text-xl" style={{ color: PALETTE.navy }}>🕐</span>
                    <div>
                      <p className="font-semibold" style={{ color: PALETTE.navy }}>Time</p>
                      <p>{formatTime(selectedEvent.time)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <span className="font-semibold mr-3 text-xl" style={{ color: PALETTE.navy }}>📍</span>
                    <div>
                      <p className="font-semibold" style={{ color: PALETTE.navy }}>Location</p>
                      <p>{selectedEvent.location}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-2" style={{ color: PALETTE.navy }}>
                    Description
                  </h3>
                  <p className="text-gray-700">{selectedEvent.description}</p>
                </div>

                {/* Requirements */}
                {selectedEvent.requirements.length > 0 && selectedEvent.requirements[0] !== "" && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-2" style={{ color: PALETTE.navy }}>
                      Requirements
                    </h3>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedEvent.requirements.filter(req => req.trim() !== "").map((req, index) => (
                        <li key={index} className="text-gray-700">{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Volunteers Info */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-lg" style={{ color: PALETTE.navy }}>
                      Volunteers
                    </h3>
                    {isUserSignedUp(selectedEvent.id) ? (
                      <span className="text-sm font-semibold" style={{ color: PALETTE.green }}>
                        ✓ You are signed up
                      </span>
                    ) : isEventFull(selectedEvent) ? (
                      <span className="text-sm font-semibold text-red-500">
                        EVENT FULL
                      </span>
                    ) : (
                      <span className="text-sm font-semibold" style={{ color: PALETTE.green }}>
                        {getAvailableSpots(selectedEvent)} spots available
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="h-4 rounded-full transition-all flex items-center justify-center text-xs text-white font-semibold"
                      style={{
                        width: `${(selectedEvent.volunteersSignedUp / selectedEvent.maxVolunteers) * 100}%`,
                        backgroundColor: isEventFull(selectedEvent) ? '#ef4444' : PALETTE.green,
                        minWidth: selectedEvent.volunteersSignedUp > 0 ? '50px' : '0'
                      }}
                    >
                      {selectedEvent.volunteersSignedUp}/{selectedEvent.maxVolunteers}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="flex-1 font-semibold py-3 rounded-full border transition-transform hover:scale-105"
                    style={{ 
                      borderColor: PALETTE.teal, 
                      color: PALETTE.teal,
                      backgroundColor: 'white'
                    }}
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleSignUp(selectedEvent.id)}
                    disabled={isEventFull(selectedEvent) || isUserSignedUp(selectedEvent.id)}
                    className="flex-1 font-semibold py-3 rounded-full transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      backgroundColor: isUserSignedUp(selectedEvent.id) ? PALETTE.green : PALETTE.teal, 
                      color: "white"
                    }}
                  >
                    {isUserSignedUp(selectedEvent.id) 
                      ? 'Already Signed Up' 
                      : isEventFull(selectedEvent) 
                        ? 'Event Full' 
                        : 'Sign Up'
                    }
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