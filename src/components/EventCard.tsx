import { useNavigate } from "react-router-dom";
import { useState } from "react"; // Add useState import

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

interface Props {
  event: Event;
  onSignUp: () => void;
  showEditButton?: boolean; // Optional prop to show/hide edit button
  showRemoveButton?: boolean; // Optional prop to show/hide remove button
  onRemove?: (eventId: number) => void; // Callback for removing event
}

function EventCard({ event, onSignUp, showEditButton = false, showRemoveButton = false, onRemove }: Props) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  
  const capacityPct = Math.min(
    100,
    Math.round((event.volunteersSignedUp / event.maxVolunteers) * 100)
  );

  const handleEdit = () => {
    // Navigate to CreateEvent page with event data for editing
    navigate('/create-event', { state: { event, isEditing: true } });
  };

  const handleRemove = () => {
    // Confirm before removing
    const confirmed = window.confirm(
      `Are you sure you want to remove "${event.name}"? This action cannot be undone.`
    );
    
    if (confirmed && onRemove) {
      onRemove(event.id);
    }
  };

  const handleViewDetails = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <div
        className="rounded-2xl shadow-md overflow-hidden transition-transform hover:scale-[1.02]"
        style={{
          backgroundColor: "#fff",
          border: `2px solid ${PALETTE.mint}`,
        }}
      >
        {/* HEADER */}
        <div
          className="p-4 flex flex-col gap-1 border-b"
          style={{ borderColor: PALETTE.mint }}
        >
          <h2
            className="text-xl font-bold"
            style={{ color: PALETTE.navy }}
          >
            {event.name}
          </h2>
          <p
            className="text-sm font-medium"
            style={{ color: PALETTE.teal }}
          >
            {event.organization}
          </p>
        </div>

        {/* DETAILS */}
        <div className="p-4 text-sm space-y-2" style={{ color: "#475569" }}>
          <p>
            <strong style={{ color: PALETTE.navy }}>📅 Date:</strong> {event.date}
          </p>
          <p>
            <strong style={{ color: PALETTE.navy }}>⏰ Time:</strong> {event.time}
          </p>
          <p>
            <strong style={{ color: PALETTE.navy }}>📍 Location:</strong>{" "}
            {event.location}
          </p>
          <p
            className="inline-block px-3 py-1 rounded-full text-white text-xs font-semibold mt-2"
            style={{
              backgroundColor: PALETTE.teal,
            }}
          >
            {event.type}
          </p>

          <p className="mt-3 leading-relaxed line-clamp-2">{event.description}</p>

          {/* REQUIREMENTS */}
          {event.requirements.length > 0 && (
            <div className="mt-3">
              <p
                className="font-semibold mb-1"
                style={{ color: PALETTE.navy }}
              >
                Requirements:
              </p>
              <ul className="list-disc list-inside space-y-0.5">
                {event.requirements.slice(0, 2).map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
                {event.requirements.length > 2 && (
                  <li className="text-teal-600 font-medium">
                    +{event.requirements.length - 2} more requirements...
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* VOLUNTEER CAPACITY BAR */}
          <div className="mt-4">
            <div
              className="flex justify-between text-xs font-semibold mb-1"
              style={{ color: PALETTE.navy }}
            >
              <span>
                {event.volunteersSignedUp}/{event.maxVolunteers} Volunteers
              </span>
              <span>{capacityPct}%</span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ backgroundColor: PALETTE.sand }}
            >
              <div
                className="h-full transition-all"
                style={{
                  width: `${capacityPct}%`,
                  backgroundColor:
                    capacityPct < 70
                      ? PALETTE.green
                      : capacityPct < 90
                      ? PALETTE.teal
                      : "#e67e22",
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* FOOTER BUTTONS */}
        <div
          className="p-4 border-t"
          style={{ borderColor: PALETTE.mint }}
        >
          <div className="flex justify-between items-center gap-2 flex-wrap">
            <div className="flex gap-2">
              <button
                onClick={onSignUp}
                className="px-5 py-2 rounded-full font-semibold text-white shadow-md transition-transform hover:scale-105"
                style={{ backgroundColor: PALETTE.green }}
              >
                Sign Up
              </button>

              <button
                onClick={handleViewDetails}
                className="px-5 py-2 rounded-full font-semibold border transition-transform hover:scale-105"
                style={{
                  color: PALETTE.teal,
                  borderColor: PALETTE.teal,
                  backgroundColor: "#fff",
                }}
              >
                View Details
              </button>
            </div>

            {/* ACTION BUTTONS - Only shows if user has permissions */}
            {(showEditButton || showRemoveButton) && (
              <div className="flex gap-2">
                {showEditButton && (
                  <button
                    onClick={handleEdit}
                    className="px-5 py-2 rounded-full font-semibold border transition-transform hover:scale-105"
                    style={{
                      color: PALETTE.navy,
                      borderColor: PALETTE.navy,
                      backgroundColor: "#fff",
                    }}
                    title="Edit Event"
                  >
                  Edit
                  </button>
                )}

                {showRemoveButton && (
                  <button
                    onClick={handleRemove}
                    className="px-5 py-2 rounded-full font-semibold border transition-transform hover:scale-105 hover:bg-red-50"
                    style={{
                      color: "#dc2626",
                      borderColor: "#dc2626",
                      backgroundColor: "#fff",
                    }}
                    title="Remove Event"
                  >
                  Remove
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn"
            style={{ border: `3px solid ${PALETTE.mint}` }}
          >
            {/* MODAL HEADER */}
            <div 
              className="p-6 border-b sticky top-0 bg-white rounded-t-2xl"
              style={{ borderColor: PALETTE.mint }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 
                    className="text-2xl font-bold mb-2"
                    style={{ color: PALETTE.navy }}
                  >
                    {event.name}
                  </h2>
                  <p 
                    className="text-lg font-semibold"
                    style={{ color: PALETTE.teal }}
                  >
                    {event.organization}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold transition-colors"
                  style={{ fontSize: '1.5rem' }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* MODAL CONTENT */}
            <div className="p-6 space-y-6">
              {/* EVENT DETAILS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: PALETTE.navy }}>📅 Date & Time</h3>
                    <p>{event.date} at {event.time}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: PALETTE.navy }}>📍 Location</h3>
                    <p>{event.location}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: PALETTE.navy }}>🎯 Event Type</h3>
                    <span 
                      className="inline-block px-3 py-1 rounded-full text-white text-sm font-semibold"
                      style={{ backgroundColor: PALETTE.teal }}
                    >
                      {event.type}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: PALETTE.navy }}>👥 Volunteer Capacity</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-semibold">
                        <span>{event.volunteersSignedUp}/{event.maxVolunteers} Volunteers</span>
                        <span>{capacityPct}% Full</span>
                      </div>
                      <div 
                        className="h-3 rounded-full overflow-hidden"
                        style={{ backgroundColor: PALETTE.sand }}
                      >
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${capacityPct}%`,
                            backgroundColor:
                              capacityPct < 70
                                ? PALETTE.green
                                : capacityPct < 90
                                ? PALETTE.teal
                                : "#e67e22",
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FULL DESCRIPTION */}
              <div>
                <h3 className="font-semibold mb-3 text-lg" style={{ color: PALETTE.navy }}>About This Event</h3>
                <p className="text-gray-700 leading-relaxed">{event.description}</p>
              </div>

              {/* FULL REQUIREMENTS */}
              {event.requirements.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 text-lg" style={{ color: PALETTE.navy }}>Requirements & Skills</h3>
                  <ul className="space-y-2">
                    {event.requirements.map((req, idx) => (
                      <li 
                        key={idx} 
                        className="flex items-start"
                      >
                        <span 
                          className="inline-block w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"
                          style={{ backgroundColor: PALETTE.green }}
                        ></span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}
            <div 
              className="p-6 border-t bg-gray-50 rounded-b-2xl"
              style={{ borderColor: PALETTE.mint }}
            >
              <div className="flex flex-wrap gap-3 justify-between items-center">
                <div className="flex gap-3">
                  <button
                    onClick={onSignUp}
                    className="px-6 py-3 rounded-full font-semibold text-white shadow-md transition-transform hover:scale-105"
                    style={{ backgroundColor: PALETTE.green }}
                  >
                    Sign Up for Event
                  </button>
                  
                  {showEditButton && (
                    <button
                      onClick={handleEdit}
                      className="px-6 py-3 rounded-full font-semibold border transition-transform hover:scale-105"
                      style={{
                        color: PALETTE.navy,
                        borderColor: PALETTE.navy,
                        backgroundColor: "#fff",
                      }}
                    >
                      Edit Event
                    </button>
                  )}
                </div>
                
                <button
                  onClick={closeModal}
                  className="px-6 py-3 rounded-full font-semibold border transition-transform hover:scale-105"
                  style={{
                    color: "#64748b",
                    borderColor: "#64748b",
                    backgroundColor: "#fff",
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add some custom animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  );
}

export default EventCard;