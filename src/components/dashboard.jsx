import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom'; 

// ------------------------ Mock API (replace with real fetchers) ------------------------
const mockDelay = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchOrgSummary() {
  await mockDelay(300);
  return {
    orgName: "Helping Hands Houston",
    volunteers: 128,
    upcomingEvents: 7,
    pendingMatches: 12,
    attendanceRate: 0.86,
  };
}

async function fetchEvents(params = {}) {
  await mockDelay(350);
  const sample = [
    {
      id: "evt_1001",
      name: "Food Bank Packaging",
      description: "Prepare and pack food boxes for distribution.",
      location: "Houston Food Bank, TX",
      requiredSkills: ["Packaging", "Teamwork"],
      urgency: "High",
      date: "2025-10-05",
      assigned: 18,
    },
    {
      id: "evt_1002",
      name: "Park Cleanup",
      description: "Buffalo Bayou trash pickup and light landscaping.",
      location: "Buffalo Bayou Park, TX",
      requiredSkills: ["Outdoor", "Lifting"],
      urgency: "Medium",
      date: "2025-10-12",
      assigned: 9,
    },
    {
      id: "evt_1003",
      name: "Senior Center Tech Help",
      description: "Assist seniors with phones and laptops.",
      location: "Heights Senior Center, TX",
      requiredSkills: ["Tech Support", "Patience"],
      urgency: "Low",
      date: "2025-10-20",
      assigned: 5,
    },
  ];

  // Very light client-side filtering for demo purposes
  let filtered = [...sample];
  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q)
    );
  }
  if (params.urgency && params.urgency !== "All") {
    filtered = filtered.filter((e) => e.urgency === params.urgency);
  }
  if (params.skill && params.skill !== "All") {
    filtered = filtered.filter((e) => e.requiredSkills.includes(params.skill));
  }
  if (params.from) {
    filtered = filtered.filter((e) => new Date(e.date) >= new Date(params.from));
  }
  if (params.to) {
    filtered = filtered.filter((e) => new Date(e.date) <= new Date(params.to));
  }

  return filtered;
}

async function fetchVolunteers() {
  await mockDelay(300);
  return [
    {
      id: "vol_1",
      name: "Alex Nguyen",
      city: "Houston",
      skills: ["Packaging", "Driving"],
      availability: ["2025-10-05", "2025-10-12"],
    },
    {
      id: "vol_2",
      name: "Bianca Torres",
      city: "Katy",
      skills: ["Tech Support", "Spanish"],
      availability: ["2025-10-20"],
    },
    {
      id: "vol_3",
      name: "Chris Johnson",
      city: "Sugar Land",
      skills: ["Outdoor", "Lifting"],
      availability: ["2025-10-12"],
    },
  ];
}

async function fetchMatchesQueue() {
  await mockDelay(250);
  return [
    { id: "m_1", volunteer: "Alex Nguyen", event: "Food Bank Packaging", score: 0.92 },
    { id: "m_2", volunteer: "Chris Johnson", event: "Park Cleanup", score: 0.88 },
    { id: "m_3", volunteer: "Bianca Torres", event: "Senior Center Tech Help", score: 0.85 },
  ];
}

async function fetchNotifications() {
  await mockDelay(200);
  return [
    { id: "n1", type: "assignment", text: "Alex N. assigned to Food Bank Packaging", ts: "2025-09-22T14:21:00Z" },
    { id: "n2", type: "reminder", text: "Reminder: Park Cleanup in 5 days", ts: "2025-09-25T09:00:00Z" },
    { id: "n3", type: "update", text: "Senior Center Tech Help time updated", ts: "2025-09-23T10:15:00Z" },
  ];
}

// ------------------------ Small UI Helpers ------------------------
function StatCard({ label, value, sublabel, onClick, darkMode = false }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-5 shadow-sm border hover:shadow-md transition cursor-default ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white"
      }`}
      style={{ borderColor: darkMode ? "#374151" : PALETTE.sand }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      <div className={`text-sm mb-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{label}</div>
      <div className={`text-3xl font-semibold tracking-tight ${darkMode ? "text-white" : ""}`}>{value}</div>
      {sublabel && <div className={`text-xs mt-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>{sublabel}</div>}
    </motion.div>
  );
}

function Badge({ children, tone = "gray", darkMode = false }) {
  const tones = {
    gray: { 
      bg: darkMode ? "#4B5563" : PALETTE.sand, 
      fg: darkMode ? "#E5E7EB" : PALETTE.navy 
    },
    green: { 
      bg: darkMode ? "#065F46" : PALETTE.mint, 
      fg: darkMode ? "#D1FAE5" : PALETTE.navy 
    },
    teal: { 
      bg: darkMode ? "#115E59" : "#E3F4F4", 
      fg: darkMode ? "#99F6E4" : PALETTE.teal 
    },
    red: { 
      bg: darkMode ? "#7F1D1D" : "#FEE2E2", 
      fg: darkMode ? "#FECACA" : "#991B1B" 
    },
    yellow: { 
      bg: darkMode ? "#713F12" : "#FEF9C3", 
      fg: darkMode ? "#FDE68A" : "#854D0E" 
    },
    blue: { 
      bg: darkMode ? "#1E3A8A" : "#E0F2FE", 
      fg: darkMode ? "#BFDBFE" : "#075985" 
    },
  };
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: tones[tone].bg, color: tones[tone].fg }}
    >
      {children}
    </span>
  );
}

function Button({ children, onClick, variant = "primary", type = "button", className = "", darkMode = false }) {
  const variants = {
    primary: `text-white`,
    secondary: `border text-gray-900`,
    subtle: `text-gray-900`,
    danger: `text-white`,
  };
  
  const getBackgroundColor = () => {
    if (variant === "primary") return darkMode ? "#059669" : PALETTE.green;
    if (variant === "secondary") return darkMode ? "#374151" : "#ffffff";
    if (variant === "subtle") return darkMode ? "#4B5563" : PALETTE.sand;
    if (variant === "danger") return "#DC2626";
    return undefined;
  };

  const getTextColor = () => {
    if (variant === "primary") return "#FFFFFF";
    if (variant === "secondary") return darkMode ? "#F3F4F6" : PALETTE.navy;
    if (variant === "subtle") return darkMode ? "#F3F4F6" : PALETTE.navy;
    if (variant === "danger") return "#FFFFFF";
    return undefined;
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`rounded-xl px-3.5 py-2.5 text-sm font-medium shadow-sm transition focus:outline-none ${variants[variant]} ${className}`}
      style={{
        backgroundColor: getBackgroundColor(),
        borderColor: variant === "secondary" ? (darkMode ? "#6B7280" : PALETTE.teal) : undefined,
        color: getTextColor(),
      }}
    >
      {children}
    </button>
  );
}

function Input({ label, id, darkMode = false, ...props }) {
  return (
    <label className="flex flex-col gap-1 text-sm w-full" htmlFor={id}>
      <span className={darkMode ? "text-gray-300" : "text-gray-700"}>{label}</span>
      <input
        id={id}
        className={`rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
          darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
        }`}
        {...props}
      />
    </label>
  );
}

function Select({ label, id, children, darkMode = false, ...props }) {
  return (
    <label className="flex flex-col gap-1 text-sm w-full" htmlFor={id}>
      <span className={darkMode ? "text-gray-300" : "text-gray-700"}>{label}</span>
      <select
        id={id}
        className={`rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
          darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
        }`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

// Dark Mode Toggle Button Component
function DarkModeToggle({ darkMode, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`rounded-xl px-3.5 py-2.5 text-sm font-medium shadow-sm transition focus:outline-none ${
        darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-800"
      }`}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
    </button>
  );
}

// ------------------------ Main Component ------------------------
// ---- Brand palette (from image) ----
const PALETTE = {
  navy: "#22577A",
  teal: "#38A3A5",
  green: "#26A96C",
  mint: "#80ED99",
  sand: "#F0EADF",
};

export default function OrgDashboard() {
  // Dark mode state
  const [darkMode, setDarkMode] = useState(false);

  // Summary
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  // Events
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [search, setSearch] = useState("");
  const [urgency, setUrgency] = useState("All");
  const [skill, setSkill] = useState("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // Volunteers
  const [volunteers, setVolunteers] = useState([]);
  const [loadingVols, setLoadingVols] = useState(true);

  // Matches
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(true);

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingSummary(true);
      const s = await fetchOrgSummary();
      if (mounted) {
        setSummary(s);
        setLoadingSummary(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingEvents(true);
      const evts = await fetchEvents({ search, urgency, skill, from, to });
      if (mounted) {
        setEvents(evts);
        setLoadingEvents(false);
      }
    })();
    return () => (mounted = false);
  }, [search, urgency, skill, from, to]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingVols(true);
      const vs = await fetchVolunteers();
      if (mounted) {
        setVolunteers(vs);
        setLoadingVols(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingMatches(true);
      const ms = await fetchMatchesQueue();
      if (mounted) {
        setMatches(ms);
        setLoadingMatches(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingNotifs(true);
      const ns = await fetchNotifications();
      if (mounted) {
        setNotifications(ns);
        setLoadingNotifs(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  const skillsUniverse = useMemo(() => {
    const set = new Set();
    events.forEach((e) => e.requiredSkills.forEach((s) => set.add(s)));
    return ["All", ...Array.from(set)];
  }, [events]);

  // ------------------------ Actions (wire up to your router/backend) ------------------------
  const navigate = useNavigate();

  const goCreateEvent = () => {
    alert("Go to: /admin/events/new");
  };
  const goOpenMatching = () => {
    alert("Go to: /admin/matching");
  };
  const goHistory = () => {
    navigate('/volunteer-history');
  };
  const goUserMode = () => {
    navigate('/volunteer-profile');
  };

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${
      darkMode ? "bg-gray-900 text-white" : "bg-gray-50"
    }`}>
      {/* Header */}
      <header className={`sticky top-0 z-10 backdrop-blur border-b transition-colors duration-300 ${
        darkMode ? "bg-gray-800/80 border-gray-700" : "bg-white/80 border-gray-200"
      }`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className={`text-xl sm:text-2xl font-semibold tracking-tight ${
              darkMode ? "text-white" : ""
            }`} style={{ color: darkMode ? "#FFFFFF" : PALETTE.navy }}>
              {summary?.orgName || "Organization Dashboard"}
            </h1>
            <p className={darkMode ? "text-gray-400" : "text-gray-500"}>Admin overview & quick actions</p>
          </div>
          <div className="flex items-center gap-2">
            <DarkModeToggle darkMode={darkMode} onToggle={toggleDarkMode} />
            <Button onClick={goCreateEvent} darkMode={darkMode}>Create Event</Button>
            <Button variant="secondary" onClick={goOpenMatching} darkMode={darkMode}>Open Matching</Button>
            <Button variant="subtle" onClick={goHistory} darkMode={darkMode}>Volunteer History</Button>
            <Button variant= "secondary" onClick={goUserMode} darkMode={darkMode}>User View</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* KPI cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loadingSummary ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`rounded-2xl h-28 animate-pulse ${
                darkMode ? "bg-gray-800" : "bg-gray-200"
              }`} />
            ))
          ) : (
            <>
              <StatCard label="Volunteers" value={summary.volunteers} darkMode={darkMode} />
              <StatCard label="Upcoming Events" value={summary.upcomingEvents} darkMode={darkMode} />
              <StatCard label="Pending Matches" value={summary.pendingMatches} darkMode={darkMode} />
              <StatCard
                label="Attendance Rate"
                value={`${Math.round(summary.attendanceRate * 100)}%`}
                sublabel="Last 30 days"
                darkMode={darkMode}
              />
            </>
          )}
        </section>

        {/* Filters */}
        <section className="mt-8">
          <div className={`rounded-2xl border p-4 shadow-sm transition-colors duration-300 ${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}>
            <h2 className={`text-lg font-medium ${darkMode ? "text-white" : ""}`} style={{ color: darkMode ? "#FFFFFF" : PALETTE.navy }}>
              Events
            </h2>
            <p className={darkMode ? "text-gray-400" : "text-gray-500"}>Filter and manage upcoming events.</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="md:col-span-2">
                <Input
                  id="search"
                  label="Search"
                  placeholder="Search by name, description, or location"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  darkMode={darkMode}
                />
              </div>
              <Select 
                id="urgency" 
                label="Urgency" 
                value={urgency} 
                onChange={(e) => setUrgency(e.target.value)}
                darkMode={darkMode}
              >
                <option>All</option>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </Select>
              <Select 
                id="skill" 
                label="Required Skill" 
                value={skill} 
                onChange={(e) => setSkill(e.target.value)}
                darkMode={darkMode}
              >
                {skillsUniverse.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
              <div className="grid grid-cols-2 gap-2">
                <Input 
                  id="from" 
                  label="From" 
                  type="date" 
                  value={from} 
                  onChange={(e) => setFrom(e.target.value)}
                  darkMode={darkMode}
                />
                <Input 
                  id="to" 
                  label="To" 
                  type="date" 
                  value={to} 
                  onChange={(e) => setTo(e.target.value)}
                  darkMode={darkMode}
                />
              </div>
            </div>

            {/* Events table */}
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className={`text-left border-b ${
                    darkMode ? "text-gray-400 border-gray-700" : "text-gray-600 border-gray-200"
                  }`}>
                    <th className="py-2 pr-4">Event</th>
                    <th className="py-2 pr-4">Location</th>
                    <th className="py-2 pr-4">Skills</th>
                    <th className="py-2 pr-4">Urgency</th>
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Assigned</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingEvents ? (
                    <tr>
                      <td colSpan={7} className={`py-10 text-center ${
                        darkMode ? "text-gray-500" : "text-gray-500"
                      }`}>
                        Loading events...
                      </td>
                    </tr>
                  ) : events.length === 0 ? (
                    <tr>
                      <td colSpan={7} className={`py-10 text-center ${
                        darkMode ? "text-gray-500" : "text-gray-500"
                      }`}>
                        No events match your filters.
                      </td>
                    </tr>
                  ) : (
                    events.map((e) => (
                      <tr key={e.id} className={`border-b last:border-0 ${
                        darkMode ? "border-gray-700" : "border-gray-200"
                      }`}>
                        <td className="py-3 pr-4">
                          <div className={`font-medium ${darkMode ? "text-white" : ""}`}>{e.name}</div>
                          <div className={`line-clamp-1 max-w-[420px] ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}>{e.description}</div>
                        </td>
                        <td className={`py-3 pr-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{e.location}</td>
                        <td className="py-3 pr-4 space-x-1">
                          {e.requiredSkills.map((s) => (
                            <Badge key={s} tone="blue" darkMode={darkMode}>{s}</Badge>
                          ))}
                        </td>
                        <td className="py-3 pr-4">
                          {e.urgency === "High" && <Badge tone="red" darkMode={darkMode}>High</Badge>}
                          {e.urgency === "Medium" && <Badge tone="yellow" darkMode={darkMode}>Medium</Badge>}
                          {e.urgency === "Low" && <Badge tone="green" darkMode={darkMode}>Low</Badge>}
                        </td>
                        <td className={`py-3 pr-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                          {new Date(e.date).toLocaleDateString()}
                        </td>
                        <td className={`py-3 pr-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{e.assigned}</td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <Button variant="secondary" onClick={() => alert(`Edit ${e.id}`)} darkMode={darkMode}>
                              Edit
                            </Button>
                            <Button variant="subtle" onClick={() => alert(`Open matching with event ${e.id}`)} darkMode={darkMode}>
                              Match
                            </Button>
                            <Button variant="danger" onClick={() => alert(`Archive ${e.id}`)} darkMode={darkMode}>
                              Archive
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Two-column: Volunteers + Match Queue */}
        <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className={`lg:col-span-2 rounded-2xl border p-4 shadow-sm ${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h2 className={`text-lg font-medium ${darkMode ? "text-white" : ""}`} style={{ color: darkMode ? "#FFFFFF" : PALETTE.navy }}>
                Volunteers
              </h2>
              <span className={darkMode ? "text-gray-400" : "text-gray-500"}>Top skills & availability</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className={`text-left border-b ${
                    darkMode ? "text-gray-400 border-gray-700" : "text-gray-600 border-gray-200"
                  }`}>
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">City</th>
                    <th className="py-2 pr-4">Skills</th>
                    <th className="py-2 pr-4">Availability</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingVols ? (
                    <tr>
                      <td colSpan={4} className={`py-8 text-center ${
                        darkMode ? "text-gray-500" : "text-gray-500"
                      }`}>
                        Loading volunteers...
                      </td>
                    </tr>
                  ) : (
                    volunteers.map((v) => (
                      <tr key={v.id} className={`border-b last:border-0 ${
                        darkMode ? "border-gray-700" : "border-gray-200"
                      }`}>
                        <td className={`py-3 pr-4 font-medium ${darkMode ? "text-white" : ""}`}>{v.name}</td>
                        <td className={`py-3 pr-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{v.city}</td>
                        <td className="py-3 pr-4 space-x-1">
                          {v.skills.map((s) => (
                            <Badge key={s} tone="blue" darkMode={darkMode}>{s}</Badge>
                          ))}
                        </td>
                        <td className={`py-3 pr-4 space-x-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                          {v.availability.map((d) => (
                            <Badge key={d} tone="gray" darkMode={darkMode}>
                              {new Date(d).toLocaleDateString()}
                            </Badge>
                          ))}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className={`rounded-2xl border p-4 shadow-sm ${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h2 className={`text-lg font-medium ${darkMode ? "text-white" : ""}`} style={{ color: darkMode ? "#FFFFFF" : PALETTE.navy }}>
                Match Queue
              </h2>
              <Button variant="secondary" onClick={goOpenMatching} darkMode={darkMode}>
                Open Matching
              </Button>
            </div>
            <ul className="space-y-3">
              {loadingMatches ? (
                <li className={darkMode ? "text-gray-400" : "text-gray-500"}>Loading matches...</li>
              ) : (
                <AnimatePresence>
                  {matches.map((m) => (
                    <motion.li
                      key={m.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className={`rounded-xl border p-3 ${
                        darkMode ? "border-gray-700" : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={`font-medium ${darkMode ? "text-white" : ""}`}>{m.volunteer}</div>
                          <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{m.event}</div>
                        </div>
                        <Badge tone={m.score > 0.9 ? "green" : m.score > 0.85 ? "yellow" : "gray"} darkMode={darkMode}>
                          Match {Math.round(m.score * 100)}%
                        </Badge>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <Button onClick={() => alert(`Assign ${m.id}`)} darkMode={darkMode}>
                          Assign
                        </Button>
                        <Button variant="secondary" onClick={() => alert(`View details for ${m.id}`)} darkMode={darkMode}>
                          Details
                        </Button>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              )}
            </ul>
          </div>
        </section>

        {/* Notifications */}
        <section className="mt-8">
          <div className={`rounded-2xl border p-4 shadow-sm ${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h2 className={`text-lg font-medium ${darkMode ? "text-white" : ""}`} style={{ color: darkMode ? "#FFFFFF" : PALETTE.navy }}>
                Notifications
              </h2>
              <Button variant="subtle" onClick={() => alert("Mark all as read")} darkMode={darkMode}>
                Mark all as read
              </Button>
            </div>
            {loadingNotifs ? (
              <div className={darkMode ? "text-gray-500 py-6" : "text-gray-500 py-6"}>Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className={darkMode ? "text-gray-500 py-6" : "text-gray-500 py-6"}>You're all caught up.</div>
            ) : (
              <ul className={`divide-y ${
                darkMode ? "divide-gray-700" : "divide-gray-200"
              }`}>
                {notifications.map((n) => (
                  <li key={n.id} className="py-3 flex items-start gap-3">
                    <span aria-hidden className="mt-1 h-2.5 w-2.5 rounded-full bg-indigo-500" />
                    <div>
                      <div className={darkMode ? "text-gray-300" : "text-gray-800"}>{n.text}</div>
                      <div className={darkMode ? "text-gray-500" : "text-gray-500"}>
                        {new Date(n.ts).toLocaleString()}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>

      <footer className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-center text-xs transition-colors duration-300 ${
        darkMode ? "text-gray-500" : "text-gray-400"
      }`}>
        Built with React + Tailwind — Organization Dashboard
      </footer>
    </div>
  );
}
