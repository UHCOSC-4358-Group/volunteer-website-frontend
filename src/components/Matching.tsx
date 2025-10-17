import { useMemo } from "react";

const PALETTE = {
  navy: "#22577A",
  teal: "#38A3A5",
  green: "#26A96C",
  mint: "#80ED99",
  sand: "#F0EADF",
};

type Match = {
  volunteer: string;
  event: string;
  role: string;           // short description shown under the name
  percent: number;        // 0–100
};

const MATCHES: Match[] = [
  { volunteer: "Alex Nguyen",   event: "Food Bank Packaging",     role: "Packaging & Sorting", percent: 92 },
  { volunteer: "Chris Johnson", event: "Park Cleanup",            role: "Park Cleanup",        percent: 88 },
  { volunteer: "Bianca Torres", event: "Senior Center Tech Help", role: "Tech Assistant",      percent: 85 },
  { volunteer: "Sam Lee",       event: "Park Cleanup",            role: "Recycling Station",   percent: 77 },
  { volunteer: "Priya Patel",   event: "Food Bank Packaging",     role: "Cold Storage",        percent: 81 },
];

function Chip({ percent }: { percent: number }) {
  // color by confidence
  const bg =
    percent >= 90 ? "#CFF6D8" : percent >= 80 ? "#FFF3C6" : "#E6EEF2";
  const txt =
    percent >= 90 ? "#1E7A45" : percent >= 80 ? "#8A6D00" : "#2A4A5B";
  return (
    <span
      className="px-3 py-1 rounded-full text-sm font-semibold"
      style={{ backgroundColor: bg, color: txt }}
    >
      Match {percent}%
    </span>
  );
}

function Row({ m }: { m: Match }) {
  return (
    <div
      className="rounded-2xl p-4 flex items-start justify-between gap-4 border"
      style={{ borderColor: PALETTE.mint, backgroundColor: "#fff" }}
    >
      <div>
        <div className="text-lg font-semibold" style={{ color: PALETTE.navy }}>
          {m.volunteer}
        </div>
        <div className="text-[15px]" style={{ color: "#475569" }}>
          {m.role}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Chip percent={m.percent} />
      </div>
    </div>
  );
}

export default function Matching() {
  // group matches by event for “every event” view
  const byEvent = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const m of MATCHES) {
      if (!map.has(m.event)) map.set(m.event, []);
      map.get(m.event)!.push(m);
    }
    return Array.from(map.entries()); // [ [event, matches[]], ... ]
  }, []);

  return (
    <main
      className="min-h-screen p-6"
      style={{ backgroundColor: PALETTE.sand }}
    >
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md border"
           style={{ borderColor: PALETTE.mint }}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b"
             style={{ borderColor: PALETTE.mint }}>
          <h1 className="text-2xl font-bold" style={{ color: PALETTE.navy }}>
            Match Queue (All Events)
          </h1>
          <button
            className="px-4 py-2 rounded-full font-semibold text-white"
            style={{ backgroundColor: PALETTE.teal }}
            onClick={() => window.history.back()}
          >
            Back
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6">
          {byEvent.map(([eventName, matches]) => (
            <section key={eventName} className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold" style={{ color: PALETTE.navy }}>
                  {eventName}
                </h2>
                <span className="text-sm" style={{ color: "#64748B" }}>
                  {matches.length} candidate{matches.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="space-y-3">
                {matches.map((m, i) => (
                  <Row key={eventName + i} m={m} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
