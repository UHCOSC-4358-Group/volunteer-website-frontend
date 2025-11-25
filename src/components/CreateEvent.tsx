import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  createOrgEvent,
  updateOrgEvent,
} from "../services/orgService";
import { useAuth } from "../hooks/user-context";

interface Event {
  id: number;
  name: string;
  date?: string;
  day?: string;
  time?: string;
  start_time?: string;
  end_time?: string;
  location: string;
  type: string;
  description: string;
  organization: string;
  volunteersSignedUp: number;
  maxVolunteers: number;
  requirements: string[];
  capacity?: number;
  needed_skills?: string[];
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
  const { user } = useAuth();
  
  // Check if we're editing an existing event
  const isEditing = location.state?.isEditing || false;
  const existingEvent = location.state?.event || null;
  const [adminOrgId, setAdminOrgId] = useState<number | null>(null);

  const [formData, setFormData] = useState<Omit<Event, 'id' | 'volunteersSignedUp'>>({
    name: "",
    date: "",
    time: "",
    location: "",
    type: "",
    description: "",
    organization: "My Organization",
    maxVolunteers: 10,
    requirements: [],
  });

  const [currentRequirement, setCurrentRequirement] = useState("");
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Populate form if editing
  useEffect(() => {
    if (isEditing && existingEvent) {
      const parsedDate = existingEvent.day || existingEvent.date || "";
      const parsedTime =
        (existingEvent.start_time || existingEvent.time || "").slice(0, 5);
      setFormData({
        name: existingEvent.name,
        date: parsedDate,
        time: parsedTime,
        location: existingEvent.location,
        type: existingEvent.type,
        description: existingEvent.description,
        organization: existingEvent.organization,
        maxVolunteers: existingEvent.capacity || existingEvent.maxVolunteers,
        requirements: existingEvent.requirements || existingEvent.needed_skills || [],
      });
    }
  }, [isEditing, existingEvent]);

  // Fetch admin org id for create/update calls
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await fetch("/api/auth/admin", {
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });
        if (res.ok) {
          const admin = await res.json();
          setAdminOrgId(admin?.org_id ?? null);
          if (!admin?.org_id) {
            setSubmitStatus("You must be assigned to an organization before creating events.");
          }
        } else {
          setSubmitStatus("Unable to load admin profile. Please log in again.");
        }
      } catch (err) {
        setSubmitStatus("Unable to load admin profile. Please try again.");
      }
    };

    fetchAdmin();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitStatus(null);

    // Validation
    if (!formData.name || !formData.date || !formData.time || !formData.location || 
        !formData.type || !formData.organization || formData.maxVolunteers < 1) {
      alert("Please fill in all required fields!");
      return;
    }

    if (!adminOrgId) {
      setSubmitStatus("No organization found for this admin. Please assign an org before creating events.");
      return;
    }

    // Build payload matching backend EventCreate
    const [startHour, startMinute] = formData.time.split(":").map((n) => parseInt(n, 10));
    const startTime = `${String(startHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}:00`;
    const endHour = startHour === 23 ? 23 : startHour + 1;
    const endMinute = startHour === 23 ? Math.min(startMinute + 59, 59) : startMinute;
    const endTime = `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}:00`;

    const payload = {
      name: formData.name,
      description: formData.description,
      location: null, // Location capture not yet implemented in UI
      needed_skills: formData.requirements,
      urgency: "Low",
      capacity: formData.maxVolunteers,
      day: formData.date,
      start_time: startTime,
      end_time: endTime,
      org_id: adminOrgId,
    };

    try {
      setSubmitting(true);
      if (isEditing && existingEvent) {
        await updateOrgEvent(existingEvent.id, payload);
        setSubmitStatus(`Event "${formData.name}" updated successfully.`);
      } else {
        await createOrgEvent(payload);
        setSubmitStatus(`Event "${formData.name}" created successfully.`);
      }
      navigate("/OrgDashboard");
    } catch (err: any) {
      const message = err?.message || "Failed to save event.";
      setSubmitStatus(message);
    } finally {
      setSubmitting(false);
    }
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
            {submitStatus && (
              <div className="mb-4 rounded border border-blue-200 bg-blue-50 px-4 py-3 text-blue-800">
                {submitStatus}
              </div>
            )}
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
                onClick={() => navigate('/OrgDashboard')}
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
