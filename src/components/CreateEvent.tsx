// src/components/CreateEvent.tsx
import React, { useState } from "react";
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

function CreateEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<Event, 'id' | 'volunteersSignedUp'>>({
    name: "",
    date: "",
    time: "",
    location: "",
    type: "",
    description: "",
    organization: "",
    maxVolunteers: 10,
    requirements: [""]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRequirementChange = (index: number, value: string) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData(prev => ({
      ...prev,
      requirements: newRequirements
    }));
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, ""]
    }));
  };

  const removeRequirement = (index: number) => {
    if (formData.requirements.length > 1) {
      const newRequirements = formData.requirements.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        requirements: newRequirements
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create new event
      const newEvent: Event = {
        id: Date.now(), // Simple ID generation
        volunteersSignedUp: 0,
        ...formData
      };

      // Save to localStorage
      const existingEvents = JSON.parse(localStorage.getItem('events') || '[]');
      const updatedEvents = [...existingEvents, newEvent];
      localStorage.setItem('events', JSON.stringify(updatedEvents));

      // Redirect to Events Page after successful creation
      navigate('/event-page');
      
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: PALETTE.sand }}>
      <div className="max-w-2xl mx-auto p-8 rounded-2xl shadow-md bg-white">
        <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: PALETTE.navy }}>
          Create New Event
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Name */}
          <div>
            <label className="block font-semibold mb-2" style={{ color: PALETTE.navy }}>
              Event Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full p-3 rounded border focus:outline-none focus:ring-2"
              style={{ borderColor: PALETTE.mint }}
              disabled={loading}
            />
          </div>

          {/* Organization */}
          <div>
            <label className="block font-semibold mb-2" style={{ color: PALETTE.navy }}>
              Organization *
            </label>
            <input
              type="text"
              name="organization"
              value={formData.organization}
              onChange={handleInputChange}
              required
              className="w-full p-3 rounded border focus:outline-none focus:ring-2"
              style={{ borderColor: PALETTE.mint }}
              disabled={loading}
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-2" style={{ color: PALETTE.navy }}>
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="w-full p-3 rounded border focus:outline-none focus:ring-2"
                style={{ borderColor: PALETTE.mint }}
                disabled={loading}
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
                required
                className="w-full p-3 rounded border focus:outline-none focus:ring-2"
                style={{ borderColor: PALETTE.mint }}
                disabled={loading}
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block font-semibold mb-2" style={{ color: PALETTE.navy }}>
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              className="w-full p-3 rounded border focus:outline-none focus:ring-2"
              style={{ borderColor: PALETTE.mint }}
              disabled={loading}
            />
          </div>

          {/* Event Type */}
          <div>
            <label className="block font-semibold mb-2" style={{ color: PALETTE.navy }}>
              Event Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
              className="w-full p-3 rounded border focus:outline-none focus:ring-2"
              style={{ borderColor: PALETTE.mint }}
              disabled={loading}
            >
              <option value="">Select type</option>
              <option value="Environment">Environment</option>
              <option value="Community">Community</option>
              <option value="Education">Education</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Max Volunteers */}
          <div>
            <label className="block font-semibold mb-2" style={{ color: PALETTE.navy }}>
              Maximum Volunteers *
            </label>
            <input
              type="number"
              name="maxVolunteers"
              value={formData.maxVolunteers}
              onChange={handleInputChange}
              min="1"
              required
              className="w-full p-3 rounded border focus:outline-none focus:ring-2"
              style={{ borderColor: PALETTE.mint }}
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold mb-2" style={{ color: PALETTE.navy }}>
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full p-3 rounded border focus:outline-none focus:ring-2"
              style={{ borderColor: PALETTE.mint }}
              disabled={loading}
            />
          </div>

          {/* Requirements */}
          <div>
            <label className="block font-semibold mb-2" style={{ color: PALETTE.navy }}>
              Requirements
            </label>
            {formData.requirements.map((req, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={req}
                  onChange={(e) => handleRequirementChange(index, e.target.value)}
                  placeholder="Requirement"
                  className="flex-1 p-3 rounded border focus:outline-none focus:ring-2"
                  style={{ borderColor: PALETTE.mint }}
                  disabled={loading}
                />
                {formData.requirements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRequirement(index)}
                    className="px-3 rounded bg-red-500 text-white"
                    disabled={loading}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addRequirement}
              className="mt-2 font-semibold py-2 px-4 rounded-full"
              style={{ backgroundColor: PALETTE.teal, color: "white" }}
              disabled={loading}
            >
              Add Requirement
            </button>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/EventCard')}
              className="font-semibold py-3 px-8 rounded-full border shadow-md transition-transform hover:scale-105"
              style={{ borderColor: PALETTE.teal, color: PALETTE.teal, backgroundColor: 'white' }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="font-semibold py-3 px-8 rounded-full shadow-md transition-transform hover:scale-105 disabled:opacity-50"
              style={{ backgroundColor: PALETTE.teal, color: "white" }}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateEvent;