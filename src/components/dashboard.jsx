import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/user-context";
import {
  getOrgDashboard,
  getOrgEvents,
  deleteOrgEvent,
} from "../services/orgService";

// ---- Brand palette ----
const PALETTE = {
  navy: "#22577A",
  teal: "#38A3A5",
  green: "#26A96C",
  mint: "#80ED99",
  sand: "#F0EADF",
};

const formatLocation = (location) => {
  if (!location) return "No location";
  if (typeof location === "string") return location;
  const parts = [
    location.address,
    location.city,
    location.state,
    location.zip_code,
    location.country,
  ]
    .filter(Boolean)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.join(", ") || "No location";
};

// Small Reusable UI Components (same as before)

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
      <div
        className={`text-sm mb-1 ${
          darkMode ? "text-gray-400" : "text-gray-500"
        }`}
      >
        {label}
      </div>
      <div
        className={`text-3xl font-semibold tracking-tight ${
          darkMode ? "text-white" : ""
        }`}
      >
        {value}
      </div>
      {sublabel && (
        <div
          className={`text-xs mt-1 ${
            darkMode ? "text-gray-500" : "text-gray-400"
          }`}
        >
          {sublabel}
        </div>
      )}
    </motion.div>
  );
}

function Badge({ children, tone = "gray", darkMode = false }) {
  const tones = {
    gray: {
      bg: darkMode ? "#4B5563" : PALETTE.sand,
      fg: darkMode ? "#E5E7EB" : PALETTE.navy,
    },
    green: {
      bg: darkMode ? "#065F46" : PALETTE.mint,
      fg: darkMode ? "#D1FAE5" : PALETTE.navy,
    },
    teal: {
      bg: darkMode ? "#115E59" : "#E3F4F4",
      fg: darkMode ? "#99F6E4" : PALETTE.teal,
    },
    red: {
      bg: darkMode ? "#7F1D1D" : "#FEE2E2",
      fg: darkMode ? "#FECACA" : "#991B1B",
    },
    yellow: {
      bg: darkMode ? "#713F12" : "#FEF9C3",
      fg: darkMode ? "#FDE68A" : "#854D0E",
    },
    blue: {
      bg: darkMode ? "#1E3A8A" : "#E0F2FE",
      fg: darkMode ? "#BFDBFE" : "#075985",
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

function Button({
  children,
  onClick,
  variant = "primary",
  type = "button",
  className = "",
  darkMode = false,
}) {
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
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`rounded-xl px-3.5 py-2.5 text-sm font-medium shadow-sm transition focus:outline-none ${variants[variant]} ${className}`}
      style={{
        backgroundColor: getBackgroundColor(),
        borderColor:
          variant === "secondary"
            ? darkMode
              ? "#6B7280"
              : PALETTE.teal
            : undefined,
        color:
          variant === "primary" || variant === "danger"
            ? "#FFFFFF"
            : darkMode
            ? "#F3F4F6"
            : PALETTE.navy,
      }}
    >
      {children}
    </button>
  );
}

function Input({ label, id, darkMode = false, ...props }) {
  return (
    <label className="flex flex-col gap-1 text-sm w-full" htmlFor={id}>
      <span className={darkMode ? "text-gray-300" : "text-gray-700"}>
        {label}
      </span>
      <input
        id={id}
        className={`rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
          darkMode
            ? "bg-gray-700 border-gray-600 text-white"
            : "bg-white border-gray-300"
        }`}
        {...props}
      />
    </label>
  );
}

function Select({ label, id, children, darkMode = false, ...props }) {
  return (
    <label className="flex flex-col gap-1 text-sm w-full" htmlFor={id}>
      <span className={darkMode ? "text-gray-300" : "text-gray-700"}>
        {label}
      </span>
      <select
        id={id}
        className={`rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
          darkMode
            ? "bg-gray-700 border-gray-600 text-white"
            : "bg-white border-gray-300"
        }`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

// --- Dark Mode Toggle ---
function DarkModeToggle({ darkMode, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`rounded-xl px-3.5 py-2.5 text-sm font-medium shadow-sm transition focus:outline-none ${
        darkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-800"
      }`}
    >
      {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
    </button>
  );
}

// ========================================================================
//                             MAIN COMPONENT
// ========================================================================

export default function OrgDashboard() {
  const { user, loading } = useAuth();
  const adminId = user?.id;

  const [joinMenuOpen, setJoinMenuOpen] = useState(false);

  const [darkMode, setDarkMode] = useState(false);

  // Data states
  const [summary, setSummary] = useState(null);
  const [events, setEvents] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // unused until backend adds them
  const [volunteers] = useState([]);
  const [matches] = useState([]);
  const [notifications] = useState([]);

  // Basic search filters
  const [search, setSearch] = useState("");
  const [urgency, setUrgency] = useState("All");
  const [skill, setSkill] = useState("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const navigate = useNavigate();

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // ============================
  //  LOAD REAL BACKEND DATA
  // ============================
  useEffect(() => {
    if (loading) return;
    if (!adminId) return;

    const loadDashboard = async () => {
      setLoadingSummary(true);
      setLoadingEvents(true);
      try {
        const [profile, orgEvents] = await Promise.all([
          getOrgDashboard(adminId),
          getOrgEvents(),
        ]);

        const mapEvent = (evt) => ({
          id: evt.id,
          name: evt.name,
          description: evt.description,
          location: formatLocation(evt.location),
          locationObj: evt.location,
          requiredSkills: Array.isArray(evt.needed_skills)
            ? evt.needed_skills.map((s) =>
                typeof s === "string" ? s : s.skill
              )
            : [],
          urgency: (evt.urgency || "Low").toLowerCase(),
          date: evt.day,
          startTime: evt.start_time,
          endTime: evt.end_time,
          capacity: evt.capacity,
          assigned: evt.assigned ?? 0,
          orgId: evt.org_id,
        });

        const eventsFromApi =
          (Array.isArray(orgEvents) && orgEvents.length > 0
            ? orgEvents
            : profile?.upcoming_events) || [];

        const mappedEvents = eventsFromApi.map(mapEvent);

        const summaryObj = {
          orgName: profile?.organization?.name ?? "My Organization",
          volunteers: 0, // backend doesn't provide yet
          upcomingEvents: mappedEvents.length,
          pendingMatches: 0, // backend doesn't provide yet
          attendanceRate: 1, // placeholder
        };

        setSummary(summaryObj);
        setEvents(mappedEvents);
      } catch (err) {
        console.error("Dashboard load error:", err);
        setErrorMessage("Failed to load dashboard data");
      } finally {
        setLoadingSummary(false);
        setLoadingEvents(false);
      }
    };

    loadDashboard();
  }, [adminId, loading]);

  // Derived memo for skill filters
  const skillsUniverse = useMemo(() => {
    const set = new Set();
    events.forEach((evt) => evt.requiredSkills.forEach((s) => set.add(s)));
    return ["All", ...Array.from(set)];
  }, [events]);

  // Filter events based on search criteria
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const matchesSearch =
        evt.name?.toLowerCase().includes(search.toLowerCase()) ||
        evt.description?.toLowerCase().includes(search.toLowerCase()) ||
        evt.location?.toLowerCase().includes(search.toLowerCase());

      const matchesUrgency =
        urgency === "All" ||
        (evt.urgency || "").toLowerCase() === urgency.toLowerCase();

      const matchesSkill =
        skill === "All" ||
        (Array.isArray(evt.requiredSkills) &&
          evt.requiredSkills.some(
            (s) => s.toLowerCase() === skill.toLowerCase()
          ));

      const matchesFrom = from ? new Date(evt.date) >= new Date(from) : true;
      const matchesTo = to ? new Date(evt.date) <= new Date(to) : true;

      return (
        matchesSearch &&
        matchesUrgency &&
        matchesSkill &&
        matchesFrom &&
        matchesTo
      );
    });
  }, [events, search, urgency, skill, from, to]);

  // ==============================================================
  //                            HANDLERS
  // ==============================================================

  const goCreateEvent = () => navigate("/create-event");
  const goEditEvent = (event) =>
    navigate("/create-event", { state: { isEditing: true, event } });
  const goOpenMatching = () => navigate("/matching");
  const goHistory = () => navigate("/volunteer-history");
  const goUserMode = () => navigate("/volunteer-profile");
  const goOrgJoin = () => navigate("/org/join");
  const goOrgRegister = () => navigate("/org/register");


  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    
    try {
      await deleteOrgEvent(eventId);
      setEvents((prev) => prev.filter((evt) => evt.id !== eventId));
    } catch (err) {
      console.error("Failed to delete event", err);
      setErrorMessage("Failed to delete event. Please try again.");
    }
  };

  // ==============================================================
  //                            RENDER
  // ==============================================================

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50"
      }`}
    >
      <header
        className={`sticky top-0 z-10 backdrop-blur border-b transition-colors duration-300 ${
          darkMode
            ? "bg-gray-800/80 border-gray-700"
            : "bg-white/80 border-gray-200"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1
              className={`text-xl sm:text-2xl font-semibold tracking-tight ${
                darkMode ? "text-white" : ""
              }`}
              style={{ color: darkMode ? "#FFFFFF" : PALETTE.navy }}
            >
              {summary?.orgName ?? "Organization Dashboard"}
            </h1>
            <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
              Admin overview & quick actions
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Org Join Button (only for users without an organization) */}
            {/* Org Join Dropdown (only if user has no organization) */}
            {!user?.org_id && (
              <div className="relative">
                <Button
                  variant="secondary"
                  darkMode={darkMode}
                  onClick={() => setJoinMenuOpen((prev) => !prev)}
                  className="flex items-center gap-1"
                >
                  Org Join ▾
                </Button>

                {joinMenuOpen && (
                  <div
                    className={`absolute right-0 mt-2 w-48 rounded-xl shadow-lg border z-20 ${
                      darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                    }`}
                  >
                    <button
                      onClick={goOrgJoin}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-t-xl ${
                        darkMode ? "hover:bg-gray-700 text-white" : "text-gray-800"
                      }`}
                    >
                      Join Existing Organization
                    </button>

                    <button
                      onClick={goOrgRegister}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-b-xl ${
                        darkMode ? "hover:bg-gray-700 text-white" : "text-gray-800"
                      }`}
                    >
                      Register New Organization
                    </button>
                  </div>
                )}
              </div>
            )}

            <DarkModeToggle darkMode={darkMode} onToggle={toggleDarkMode} />
            <Button onClick={goCreateEvent} darkMode={darkMode}>
              Create Event
            </Button>
            <Button
              variant="secondary"
              onClick={goOpenMatching}
              darkMode={darkMode}
            >
              Open Matching
            </Button>
            <Button variant="subtle" onClick={goHistory} darkMode={darkMode}>
              Volunteer History
            </Button>
            {/*
            <Button
              variant="secondary"
              onClick={goUserMode}
              darkMode={darkMode}
            >
              User View
            </Button>
            */}
          </div>
        </div>
      </header>

      {/* Error Message */}
      {errorMessage && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {errorMessage}
          </div>
        </div>
      )}

      {/* SUMMARY CARDS */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loadingSummary ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`rounded-2xl h-28 animate-pulse ${
                  darkMode ? "bg-gray-800" : "bg-gray-200"
                }`}
              />
            ))
          ) : (
            <>
              <StatCard
                label="Volunteers"
                value={summary?.volunteers ?? 0}
                darkMode={darkMode}
              />
              <StatCard
                label="Upcoming Events"
                value={summary?.upcomingEvents ?? 0}
                darkMode={darkMode}
              />
              <StatCard
                label="Pending Matches"
                value={summary?.pendingMatches ?? 0}
                darkMode={darkMode}
              />
              <StatCard
                label="Attendance Rate"
                value={`${Math.round((summary?.attendanceRate ?? 0) * 100)}%`}
                sublabel="Last 30 days"
                darkMode={darkMode}
              />
            </>
          )}
        </section>

        {/* EVENTS SECTION */}
        <section className="mt-8">
          <div
            className={`rounded-2xl border p-4 shadow-sm transition-colors duration-300 ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <h2
              className={`text-lg font-medium ${darkMode ? "text-white" : ""}`}
              style={{ color: darkMode ? "#FFFFFF" : PALETTE.navy }}
            >
              Events
            </h2>
            <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
              Filter and manage upcoming events.
            </p>

            {/* Filters */}
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

            {/* EVENTS TABLE */}
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr
                    className={`text-left border-b ${
                      darkMode
                        ? "text-gray-400 border-gray-700"
                        : "text-gray-600 border-gray-200"
                    }`}
                  >
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
                      <td
                        colSpan={7}
                        className={`py-10 text-center ${
                          darkMode ? "text-gray-500" : "text-gray-500"
                        }`}
                      >
                        Loading events...
                      </td>
                    </tr>
                  ) : filteredEvents.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className={`py-10 text-center ${
                          darkMode ? "text-gray-500" : "text-gray-500"
                        }`}
                      >
                        {events.length === 0 ? "No events available." : "No events match your filters."}
                      </td>
                    </tr>
                  ) : (
                    filteredEvents.map((e) => (
                      <tr
                        key={e.id}
                        className={`border-b last:border-0 ${
                          darkMode ? "border-gray-700" : "border-gray-200"
                        }`}
                      >
                        <td className="py-3 pr-4">
                          <div
                            className={`font-medium ${
                              darkMode ? "text-white" : ""
                            }`}
                          >
                            {e.name}
                          </div>
                          <div
                            className={`line-clamp-1 max-w-[420px] ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {e.description}
                          </div>
                        </td>
                        <td
                          className={`py-3 pr-4 ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {e.location}
                        </td>
                        <td className="py-3 pr-4 space-x-1">
                          {e.requiredSkills.map((s, idx) => (
                            <Badge key={`${s}-${idx}`} tone="blue" darkMode={darkMode}>
                              {s}
                            </Badge>
                          ))}
                        </td>
                        <td className="py-3 pr-4">
                          {e.urgency === "high" && (
                            <Badge tone="red" darkMode={darkMode}>
                              High
                            </Badge>
                          )}
                          {e.urgency === "medium" && (
                            <Badge tone="yellow" darkMode={darkMode}>
                              Medium
                            </Badge>
                          )}
                          {e.urgency === "low" && (
                            <Badge tone="green" darkMode={darkMode}>
                              Low
                            </Badge>
                          )}
                        </td>
                        <td
                          className={`py-3 pr-4 ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {new Date(e.date).toLocaleDateString()}
                        </td>
                        <td
                          className={`py-3 pr-4 ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {e.assigned}
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="secondary"
                              onClick={() => goEditEvent(e)}
                              darkMode={darkMode}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="subtle"
                              onClick={() =>
                                alert(`Open matching with event ${e.id}`)
                              }
                              darkMode={darkMode}
                            >
                              Match
                            </Button>
                            <Button
                              variant="danger"
                              onClick={() => handleDelete(e.id)}
                              darkMode={darkMode}
                            >
                              Delete
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

        {/* VOLUNTEERS + MATCHES (empty until backend ready) */}
        <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Volunteers */}
          <div
            className={`lg:col-span-2 rounded-2xl border p-4 shadow-sm ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h2
                className={`text-lg font-medium ${
                  darkMode ? "text-white" : ""
                }`}
                style={{ color: darkMode ? "#FFFFFF" : PALETTE.navy }}
              >
                Volunteers (Coming Soon)
              </h2>
              <span className={darkMode ? "text-gray-400" : "text-gray-500"}>
                Backend not implemented
              </span>
            </div>

            <div className="py-10 text-center text-gray-500">
              Feature coming soon
            </div>
          </div>

          {/* Match Queue */}
          <div
            className={`rounded-2xl border p-4 shadow-sm ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h2
                className={`text-lg font-medium ${
                  darkMode ? "text-white" : ""
                }`}
                style={{ color: darkMode ? "#FFFFFF" : PALETTE.navy }}
              >
                Match Queue (Coming Soon)
              </h2>
              <Button variant="secondary" darkMode={darkMode}>
                Open Matching
              </Button>
            </div>

            <div className="py-10 text-center text-gray-500">
              Feature coming soon
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="mt-8">
          <div
            className={`rounded-2xl border p-4 shadow-sm ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h2
                className={`text-lg font-medium ${
                  darkMode ? "text-white" : ""
                }`}
                style={{ color: darkMode ? "#FFFFFF" : PALETTE.navy }}
              >
                Notifications (Coming Soon)
              </h2>
              <Button variant="subtle" darkMode={darkMode}>
                Mark all as read
              </Button>
            </div>

            <div className="py-10 text-center text-gray-500">
              Feature coming soon
            </div>
          </div>
        </section>
      </main>

      <footer
        className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-center text-xs transition-colors duration-300 ${
          darkMode ? "text-gray-500" : "text-gray-400"
        }`}
      >
        Built with React + Tailwind — Organization Dashboard
      </footer>
    </div>
  );
}