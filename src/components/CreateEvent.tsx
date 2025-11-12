// src/components/CreateEvent.tsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

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

function CreateEvent() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're editing an existing event
  const isEditing = location.state?.isEditing || false;
  const existingEvent = location.state?.event || null;

  const [formData, setFormData] = useState<Omit<Event, 'id' | 'volunteersSignedUp'>>({
    name: "",
    date: "",
    time: "",
    location: "",
    type: "",
    description: "",
    organization: "",
    maxVolunteers: 10,
    requirements: [],
  });

  const [currentRequirement, setCurrentRequirement] = useState("");

  // Populate form if editing
  useEffect(() => {
    if (isEditing && existingEvent) {
      setFormData({
        name: existingEvent.name,
        date: existingEvent.date,
        time: existingEvent.time,
        location: existingEvent.location,
        type: existingEvent.type,
        description: existingEvent.description,
        organization: existingEvent.organization,
        maxVolunteers: existingEvent.maxVolunteers,
        requirements: existingEvent.requirements,
      });
    }
  }, [isEditing, existingEvent]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "maxVolunteers" ? parseInt(value) || 0 : value,
    }));
  };

  const handleAddRequirement = () => {
    if (currentRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, currentRequirement.trim()],
      }));
      setCurrentRequirement("");
    }
  };

  const handleRemoveRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.date || !formData.time || !formData.location || 
        !formData.type || !formData.organization || formData.maxVolunteers < 1) {
      alert("Please fill in all required fields!");
      return;
    }

    // Get existing events from localStorage
    const savedEvents = localStorage.getItem('events');
    const events: Event[] = savedEvents ? JSON.parse(savedEvents) : [];

    if (isEditing && existingEvent) {
      // UPDATE existing event
      const updatedEvents = events.map(event => {
        if (event.id === existingEvent.id) {
          return {
            ...event,
            ...formData,
            // Preserve the volunteersSignedUp count
            volunteersSignedUp: existingEvent.volunteersSignedUp,
          };
        }
        return event;
      });

      localStorage.setItem('events', JSON.stringify(updatedEvents));

      // Also update in signedUpEvents if it exists there
      const signedUpEvents = JSON.parse(localStorage.getItem('signedUpEvents') || '[]');
      const updatedSignedUpEvents = signedUpEvents.map((event: Event) => {
        if (event.id === existingEvent.id) {
          return {
            ...event,
            ...formData,
            volunteersSignedUp: existingEvent.volunteersSignedUp,
          };
        }
        return event;
      });
      localStorage.setItem('signedUpEvents', JSON.stringify(updatedSignedUpEvents));

      alert(`Event "${formData.name}" updated successfully!`);
    } else {
      // CREATE new event
      const newEvent: Event = {
        ...formData,
        id: Date.now(), // Simple ID generation
        volunteersSignedUp: 0,
      };

      const updatedEvents = [...events, newEvent];
      localStorage.setItem('events', JSON.stringify(updatedEvents));

      alert(`Event "${formData.name}" created successfully!`);
    }

    // Navigate back to events page
    navigate('/events');
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: PALETTE.sand }}>
      <div className="max-w-3xl mx-auto">
        <div className="bg-white p-8 rounded-2xl shadow-md border-t-4" style={{ borderColor: PALETTE.teal }}>
          <h1 className="text-3xl font-bold mb-2 text-center" style={{ color: PALETTE.navy }}>
            {isEditing ? "Edit Event" : "Create New Event"}
          </h1>
          <p className="text-center mb-6" style={{ color: PALETTE.teal }}>
            {isEditing ? "Update your event information" : "Fill in the details to create a volunteer opportunity"}
          </p>

          <form onSubmit={handleSubmit}>
            {/* Event Name */}
            <div className="mb-4">
              <label className="block font-semibold mb-2" style={{ color: PALETTE.navy }}>
                Event Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-3 rounded border focus:outline-none focus:ring-2"
                style={{ borderColor: PALETTE.mint }}
                placeholder="e.g., Beach Cleanup Drive"
                required
              />
            </div>

            {/* Organization */}
            <div className="mb-4">
              <label className="block font-semibold mb-2" style={{ color: PALETTE.navy }}>
                Organization *
              </label>
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleInputChange}
                className="w-full p-3 rounded border focus:outline-none focus:ring-2"
                style={{ borderColor: PALETTE.mint }}
                placeholder="e.g., Green Earth Foundation"
                required
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block font-semibold mb-2" style={{ color: PALETTE.navy }}>
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded border focus:outline-none focus:ring-2"
                  style={{ borderColor: PALETTE.mint }}
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-2" style={{ color: PALETTE.navy }}>
                  Time *
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded border focus:outline-none focus:ring-2"
                  style={{ borderColor: PALETTE.mint }}
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div className="mb-4">
              <label className="block font-semibold mb-2" style={{ color: PALETTE.navy }}>
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full p-3 rounded border focus:outline-none focus:ring-2"
                style={{ borderColor: PALETTE.mint }}
                placeholder="e.g., Santa Monica Beach, CA"
                required
              />
            </div>

            {/* Type */}
            <div className="mb-4">
              <label className="block font-semibold mb-2" style={{ color: PALETTE.navy }}>
                Event Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full p-3 rounded border focus:outline-none focus:ring-2"
                style={{ borderColor: PALETTE.mint }}
                required
              >
                <option value="">Select a type</option>
                <option value="Environment">Environment</option>
                <option value="Community">Community</option>
                <option value="Education">Education</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Max Volunteers */}
            <div className="mb-4">
              <label className="block font-semibold mb-2" style={{ color: PALETTE.navy }}>
                Maximum Volunteers *
              </label>
              <input
                type="number"
                name="maxVolunteers"
                value={formData.maxVolunteers}
                onChange={handleInputChange}
                min="1"
                className="w-full p-3 rounded border focus:outline-none focus:ring-2"
                style={{ borderColor: PALETTE.mint }}
                required
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block font-semibold mb-2" style={{ color: PALETTE.navy }}>
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full p-3 rounded border focus:outline-none focus:ring-2"
                style={{ borderColor: PALETTE.mint }}
                placeholder="Describe the event and what volunteers will be doing..."
                required
              />
            </div>

            {/* Requirements */}
            <div className="mb-6">
              <label className="block font-semibold mb-2" style={{ color: PALETTE.navy }}>
                Requirements (Optional)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={currentRequirement}
                  onChange={(e) => setCurrentRequirement(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRequirement())}
                  className="flex-1 p-3 rounded border focus:outline-none focus:ring-2"
                  style={{ borderColor: PALETTE.mint }}
                  placeholder="e.g., Must be 18+ or Bring your own gloves"
                />
                <button
                  type="button"
                  onClick={handleAddRequirement}
                  className="px-6 py-3 rounded-full font-semibold text-white shadow-md transition-transform hover:scale-105"
                  style={{ backgroundColor: PALETTE.teal }}
                >
                  Add
                </button>
              </div>

              {formData.requirements.length > 0 && (
                <div className="mt-3 space-y-2">
                  {formData.requirements.map((req, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded border"
                      style={{ borderColor: PALETTE.mint, backgroundColor: PALETTE.sand }}
                    >
                      <span>{req}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRequirement(index)}
                        className="text-red-600 hover:text-red-800 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                type="button"
                onClick={() => navigate('/events')}
                className="px-8 py-3 rounded-full font-semibold border transition-transform hover:scale-105"
                style={{
                  color: PALETTE.navy,
                  borderColor: PALETTE.navy,
                  backgroundColor: "#fff",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 rounded-full font-semibold text-white shadow-md transition-transform hover:scale-105"
                style={{ backgroundColor: PALETTE.green }}
              >
                {isEditing ? "Update Event" : "Create Event"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateEvent;