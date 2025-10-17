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
}

function EventCard({ event, onSignUp }: Props) {
  const capacityPct = Math.min(
    100,
    Math.round((event.volunteersSignedUp / event.maxVolunteers) * 100)
  );

  return (
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

        <p className="mt-3 leading-relaxed">{event.description}</p>

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
              {event.requirements.map((req, idx) => (
                <li key={idx}>{req}</li>
              ))}
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
        className="p-4 flex justify-between items-center border-t"
        style={{ borderColor: PALETTE.mint }}
      >
        <button
          onClick={onSignUp}
          className="px-5 py-2 rounded-full font-semibold text-white shadow-md transition-transform hover:scale-105"
          style={{ backgroundColor: PALETTE.green }}
        >
          Sign Up
        </button>

        <button
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
    </div>
  );
}

export default EventCard;
