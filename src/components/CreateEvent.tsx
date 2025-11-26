import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/user-context";
import SelectStateOptions from "./SelectStateOptions"; // Add this import
import {
  createOrgEvent,
  updateOrgEvent,
  getOrgDashboard,
  ApiLocation,
  LocationPayload,
} from "../services/orgService";

type Urgency = "Low" | "Medium" | "High" ;

interface EventFormData {
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  locationAddress: string;
  locationCity: string;
  locationState: string;
  locationZip: string;
  locationCountry: string;
  description: string;
  maxVolunteers: number;
  urgency: Urgency;
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
  const { user } = useAuth();
  
  // Check if we're editing an existing event
  const isEditing = location.state?.isEditing || false;
  const existingEvent = location.state?.event || null;

  const [formData, setFormData] = useState<EventFormData>({
    name: "",
    date: "",
    startTime: "",
    endTime: "",
    locationAddress: "",
    locationCity: "",
    locationState: "",
    locationZip: "",
    locationCountry: "United States",
    description: "",
    maxVolunteers: 10,
    urgency: "Low",
    requirements: [],
  });

  const [currentRequirement, setCurrentRequirement] = useState("");
  const [orgId, setOrgId] = useState<number | null>(null);
  const [orgName, setOrgName] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingOrg, setLoadingOrg] = useState(true);

  // Populate form if editing
  useEffect(() => {
    if (isEditing && existingEvent) {
      const loc: ApiLocation | undefined =
        existingEvent.locationObj || existingEvent.location;

      const toTimeInput = (value?: string) =>
        value ? value.toString().slice(0, 5) : "";

      const formattedUrgency =
        existingEvent.urgency &&
        (existingEvent.urgency.charAt(0).toUpperCase() +
          existingEvent.urgency.slice(1));

      setFormData({
        name: existingEvent.name || "",
        date: existingEvent.date || existingEvent.day || "",
        startTime: toTimeInput(existingEvent.startTime || existingEvent.start_time),
        endTime: toTimeInput(existingEvent.endTime || existingEvent.end_time),
        locationAddress: loc?.address || "",
        locationCity: loc?.city || "",
        locationState: loc?.state || "",
        locationZip: loc?.zip_code || "",
        locationCountry: loc?.country || "",
        description: existingEvent.description || "",
        maxVolunteers:
          existingEvent.maxVolunteers ||
          existingEvent.capacity ||
          0,
        urgency: (formattedUrgency as Urgency) || "Low",
        requirements:
          existingEvent.requiredSkills ||
          existingEvent.requirements ||
          [],
      });
    }
  }, [isEditing, existingEvent]);

  useEffect(() => {
    const loadOrg = async () => {
      if (!user?.id) {
        setLoadingOrg(false);
        return;
      }

      try {
        const data = await getOrgDashboard(user.id);
        setOrgId(data?.organization?.id ?? data?.admin?.org_id ?? null);
        setOrgName(data?.organization?.name ?? "");
      } catch (err) {
        console.error("Failed to load organization info", err);
        setErrorMessage("Unable to load your organization details.");
      } finally {
        setLoadingOrg(false);
      }
    };

    loadOrg();
  }, [user?.id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (errorMessage) setErrorMessage("");
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
    setErrorMessage("");

    if (
      !formData.name ||
      !formData.date ||
      !formData.startTime ||
      !formData.endTime ||
      !formData.description
    ) {
      alert("Please fill in all required fields!");
      return;
    }

    if (formData.maxVolunteers < 1) {
      setErrorMessage("Capacity must be at least 1.");
      return;
    }

    const start = new Date(`1970-01-01T${formData.startTime}`);
    const end = new Date(`1970-01-01T${formData.endTime}`);
    if (start >= end) {
      setErrorMessage("End time must be after start time.");
      return;
    }

    const locationFields = [
      formData.locationAddress,
      formData.locationCity,
      formData.locationState,
      formData.locationZip,
      formData.locationCountry,
    ];

    const hasLocation = locationFields.some((v) => v && v.trim() !== "");
    let locationPayload: LocationPayload | null = null;

    if (hasLocation) {
      const allProvided = locationFields.every((v) => v && v.trim() !== "");
      if (!allProvided) {
        setErrorMessage(
          "Please complete all location fields or leave them all blank."
        );
        return;
      }

      locationPayload = {
        address: formData.locationAddress,
        city: formData.locationCity,
        state: formData.locationState,
        zip_code: formData.locationZip,
        country: formData.locationCountry,
      };
    }

    const basePayload = {
      name: formData.name,
      description: formData.description,
      day: formData.date,
      start_time: formData.startTime,
      end_time: formData.endTime,
      urgency: formData.urgency,
      capacity: formData.maxVolunteers,
      needed_skills: formData.requirements,
      location: locationPayload,
    };

    setSubmitting(true);
    try {
      if (isEditing && existingEvent?.id) {
        await updateOrgEvent(existingEvent.id, basePayload);
        alert(`Event "${formData.name}" updated successfully!`);
      } else {
        if (!orgId) {
          setErrorMessage(
            "You must be assigned to an organization before creating events."
          );
          setSubmitting(false);
          return;
        }

        await createOrgEvent({
          ...basePayload,
          org_id: orgId,
        });

        alert(`Event "${formData.name}" created successfully!`);
      }

      navigate("/OrgDashboard");
    } catch (err) {
      console.error("Failed to save event", err);
      const message =
        err instanceof Error ? err.message : "Failed to save event.";
      setErrorMessage(message);
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
          {errorMessage && (
            <p className="text-center mb-4 text-red-600 font-semibold">
              {errorMessage}
            </p>
          )}

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
                Organization
              </label>
              <input
                type="text"
                name="organization"
                value={orgName || "Loading organization..."}
                readOnly
                className="w-full p-3 rounded border focus:outline-none focus:ring-2"
                style={{ borderColor: PALETTE.mint }}
                placeholder="Organization name"
              />
              {!orgId && !loadingOrg && (
                <p className="text-sm text-red-600 mt-1">
                  You need to be assigned to an organization to create events.
                </p>
              )}
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
                  Start Time *
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded border focus:outline-none focus:ring-2"
                  style={{ borderColor: PALETTE.mint }}
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-2" style={{ color: PALETTE.navy }}>
                  End Time *
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
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
                Location (optional)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  name="locationAddress"
                  value={formData.locationAddress}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded border focus:outline-none focus:ring-2"
                  style={{ borderColor: PALETTE.mint }}
                  placeholder="Street address"
                />
                <input
                  type="text"
                  name="locationCity"
                  value={formData.locationCity}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded border focus:outline-none focus:ring-2"
                  style={{ borderColor: PALETTE.mint }}
                  placeholder="City"
                />
                {/* CHANGED: Convert to select dropdown */}
                <select
                  name="locationState"
                  value={formData.locationState}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded border focus:outline-none focus:ring-2"
                  style={{ borderColor: PALETTE.mint }}
                >
                  <SelectStateOptions />
                </select>
                <input
                  type="text"
                  name="locationZip"
                  value={formData.locationZip}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded border focus:outline-none focus:ring-2"
                  style={{ borderColor: PALETTE.mint }}
                  placeholder="Zip / Postal code"
                />
                <input
                  type="text"
                  name="locationCountry"
                  value={formData.locationCountry}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded border focus:outline-none focus:ring-2 md:col-span-2"
                  style={{ borderColor: PALETTE.mint }}
                  placeholder="Country"
                />
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Provide full address details or leave all fields blank.
              </p>
            </div>

            {/* Type */}
            <div className="mb-4">
              <label className="block font-semibold mb-2" style={{ color: PALETTE.navy }}>
                Urgency *
              </label>
              <select
                name="urgency"
                value={formData.urgency}
                onChange={handleInputChange}
                className="w-full p-3 rounded border focus:outline-none focus:ring-2"
                style={{ borderColor: PALETTE.mint }}
                required
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
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
                disabled={submitting}
                className="px-8 py-3 rounded-full font-semibold text-white shadow-md transition-transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ backgroundColor: PALETTE.green }}
              >
                {submitting
                  ? "Saving..."
                  : isEditing
                  ? "Update Event"
                  : "Create Event"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateEvent;