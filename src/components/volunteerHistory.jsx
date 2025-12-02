import { useMemo, useState, useEffect } from "react";
import { useAuth } from "../hooks/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "../config/api";

// === Brand palette (consistent with other org pages) ===
const PALETTE = {
  navy: "#22577A",
  teal: "#38A3A5",
  green: "#26A96C",
  mint: "#80ED99",
  sand: "#F0EADF",
  slate: "#1F2937",
  gray: "#6B7280",
  error: "#DC2626",
  warn: "#D97706",
};

// === Helpers ===
const classNames = (...c) => c.filter(Boolean).join(" ");

const STATUS = [
  { value: "Assigned", color: "bg-blue-100 text-blue-800" },
  { value: "Completed", color: "bg-green-100 text-green-800" },
  { value: "No-show", color: "bg-red-100 text-red-800" },
  { value: "Cancelled", color: "bg-gray-100 text-gray-800" },
];

const URGENCY = [
  { value: "Low", color: "bg-emerald-100 text-emerald-800" },
  { value: "Medium", color: "bg-yellow-100 text-yellow-800" },
  { value: "High", color: "bg-red-100 text-red-800" },
];

// === Volunteer directory (for join dates; replace with real data) ===
const VOLUNTEERS = {
  "Alex Nguyen": { joinedAt: "2025-06-10" },
  "Bianca Torres": { joinedAt: "2025-05-22" },
  "Chris Johnson": { joinedAt: "2025-07-01" },
};

// === Demo data (replace with API data) ===
const SAMPLE = [
  {
    id: "1",
    volunteerName: "Alex Nguyen",
    eventName: "Food Bank Packaging",
    description: "Prepare and pack food boxes for distribution.",
    location: "Houston Food Bank, TX",
    requiredSkills: ["Packaging", "Teamwork"],
    urgency: "High",
    eventDate: "2025-10-04",
    status: "Assigned",
    hours: 3.5,
  },
  {
    id: "2",
    volunteerName: "Bianca Torres",
    eventName: "Park Cleanup",
    description: "Buffalo Bayou trash pickup and light maintenance.",
    location: "Buffalo Bayou Park, TX",
    requiredSkills: ["Outdoor", "Lifting"],
    urgency: "Medium",
    eventDate: "2025-10-11",
    status: "Completed",
    hours: 4,
  },
  {
    id: "3",
    volunteerName: "Chris Johnson",
    eventName: "Senior Center Tech Help",
    description: "Assist seniors with phones and laptops.",
    location: "Heights Senior Center, TX",
    requiredSkills: ["Tech Support", "Patience"],
    urgency: "Low",
    eventDate: "2025-10-19",
    status: "No-show",
    hours: 0,
  },
];

// === Validation ===
const MAX = { name: 50, short: 100 };

function validateRecord(r) {
  const errors = {};
  // Volunteer name (not in spec, but needed for history rows)
  if (!r.volunteerName || !r.volunteerName.trim())
    errors.volunteerName = "Volunteer is required";
  else if (r.volunteerName.length > MAX.name)
    errors.volunteerName = `Max ${MAX.name} characters`;

  // Event Name (≤100, required)
  if (!r.eventName || !r.eventName.trim())
    errors.eventName = "Event name is required";
  else if (r.eventName.length > MAX.short)
    errors.eventName = `Max ${MAX.short} characters`;

  // Description (required)
  if (!r.description || !r.description.trim())
    errors.description = "Description is required";

  // Location (required)
  if (!r.location || !r.location.trim())
    errors.location = "Location is required";

  // Required Skills (multi-select, ≥1)
  if (!r.requiredSkills || r.requiredSkills.length === 0)
    errors.requiredSkills = "Select at least one skill";

  // Urgency (required + enum)
  if (!r.urgency) errors.urgency = "Select urgency";
  else if (!URGENCY.some((u) => u.value === r.urgency))
    errors.urgency = "Invalid urgency";

  // Event Date (required, valid date)
  if (!r.eventDate) errors.eventDate = "Event date is required";
  else if (isNaN(Date.parse(r.eventDate))) errors.eventDate = "Invalid date";

  // Status (required + enum)
  if (!r.status) errors.status = "Select status";
  else if (!STATUS.some((s) => s.value === r.status))
    errors.status = "Invalid status";

  // Hours (required number 0–24, allow decimals)
  if (r.hours === undefined || r.hours === null || r.hours === "")
    errors.hours = "Hours are required";
  else if (isNaN(Number(r.hours))) errors.hours = "Hours must be a number";
  else if (Number(r.hours) < 0) errors.hours = "Hours cannot be negative";
  else if (Number(r.hours) > 24) errors.hours = "Hours must be ≤ 24";

  return errors;
}

// === Chips ===
const Chip = ({ children }) => (
  <span
    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-[rgba(34,87,122,0.08)] text-[color:var(--chip)] border border-[rgba(34,87,122,0.16)]"
    style={{ "--chip": PALETTE.navy }}
  >
    {children}
  </span>
);

// === Modal ===
function Modal({ open, onClose, children, title }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
          >
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: "#E5E7EB" }}
            >
              <h3
                className="text-lg font-semibold"
                style={{ color: PALETTE.navy }}
              >
                {title}
              </h3>
              <button
                onClick={onClose}
                className="rounded-md px-2 py-1 text-sm"
                style={{ color: PALETTE.gray }}
              >
                Close
              </button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// === Form ===
function HistoryForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({
    id: initial?.id ?? undefined,
    volunteerName: initial?.volunteerName ?? "",
    eventName: initial?.eventName ?? "",
    description: initial?.description ?? "",
    location: initial?.location ?? "",
    requiredSkills: initial?.requiredSkills ?? [],
    urgency: initial?.urgency ?? "",
    eventDate: initial?.eventDate ?? "",
    status: initial?.status ?? "",
    hours: initial?.hours ?? 0,
  }));
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function toggleSkill(skill) {
    setForm((f) => {
      const exists = f.requiredSkills.includes(skill);
      const next = exists
        ? f.requiredSkills.filter((s) => s !== skill)
        : [...f.requiredSkills, skill];
      return { ...f, requiredSkills: next };
    });
  }

  function submit(e) {
    e.preventDefault();
    const v = validateRecord(form);
    setErrors(v);
    if (Object.keys(v).length === 0) onSubmit(form);
  }

  const allSkills = [
    "Packaging",
    "Teamwork",
    "Outdoor",
    "Lifting",
    "Tech Support",
    "Spanish",
    "Patience",
    "Driving",
  ];

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="Volunteer Name"
          htmlFor="volunteerName"
          required
          error={errors.volunteerName}
        >
          <input
            id="volunteerName"
            name="volunteerName"
            value={form.volunteerName}
            onChange={handleChange}
            maxLength={MAX.name}
            className="input"
            placeholder="e.g., Alex Nguyen"
          />
        </Field>
        <Field
          label="Event Name"
          htmlFor="eventName"
          required
          error={errors.eventName}
        >
          <input
            id="eventName"
            name="eventName"
            value={form.eventName}
            onChange={handleChange}
            maxLength={MAX.short}
            className="input"
            placeholder="e.g., Park Cleanup"
          />
        </Field>
      </div>

      <Field
        label="Description"
        htmlFor="description"
        required
        error={errors.description}
      >
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          className="input min-h-[96px]"
          placeholder="What did the volunteer do?"
        />
      </Field>

      <Field
        label="Location"
        htmlFor="location"
        required
        error={errors.location}
      >
        <textarea
          id="location"
          name="location"
          value={form.location}
          onChange={handleChange}
          className="input"
          placeholder="Site / address"
        />
      </Field>

      <div>
        <Label required>Required Skills</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {allSkills.map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => toggleSkill(s)}
              className={classNames(
                "rounded-full border px-3 py-1 text-sm",
                form.requiredSkills.includes(s)
                  ? "bg-[rgba(56,163,165,0.12)] border-[rgba(56,163,165,0.4)]"
                  : "bg-white hover:bg-gray-50 border-gray-300"
              )}
            >
              {s}
            </button>
          ))}
        </div>
        {errors.requiredSkills && (
          <ErrorText>{errors.requiredSkills}</ErrorText>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field
          label="Urgency"
          htmlFor="urgency"
          required
          error={errors.urgency}
        >
          <select
            id="urgency"
            name="urgency"
            value={form.urgency}
            onChange={handleChange}
            className="input"
          >
            <option value="">Select…</option>
            {URGENCY.map((u) => (
              <option key={u.value} value={u.value}>
                {u.value}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Event Date"
          htmlFor="eventDate"
          required
          error={errors.eventDate}
        >
          <input
            id="eventDate"
            name="eventDate"
            type="date"
            value={form.eventDate}
            onChange={handleChange}
            className="input"
          />
        </Field>
        <Field label="Status" htmlFor="status" required error={errors.status}>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
            className="input"
          >
            <option value="">Select…</option>
            {STATUS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.value}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field
          label="Hours (this event)"
          htmlFor="hours"
          required
          error={errors.hours}
        >
          <input
            id="hours"
            name="hours"
            type="number"
            min="0"
            max="24"
            step="0.25"
            value={form.hours}
            onChange={handleChange}
            className="input"
            placeholder="e.g., 3.5"
          />
        </Field>
      </div>

      <div className="mt-4 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl text-white shadow"
          style={{ background: PALETTE.teal }}
        >
          Save
        </button>
      </div>
    </form>
  );
}

function Label({ children, required }) {
  return (
    <label className="text-sm font-medium" style={{ color: PALETTE.slate }}>
      {children}
      {required && <span className="ml-0.5 text-red-600">*</span>}
    </label>
  );
}

function Field({ label, htmlFor, required, error, children }) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <div className="mt-1">{children}</div>
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}

function ErrorText({ children }) {
  return (
    <p className="mt-1 text-sm" style={{ color: PALETTE.error }}>
      {children}
    </p>
  );
}

function Spinner({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="#E5E7EB"
        strokeWidth="4"
        fill="none"
        opacity="0.6"
      />
      <path
        d="M22 12a10 10 0 00-10-10"
        stroke={PALETTE.navy}
        strokeWidth="4"
        fill="none"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 12 12"
          to="360 12 12"
          dur="1s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}

// Tailwind-like input class (works even without Tailwind if your project has base styles)
const inputBase =
  "block w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-0";
const inputStyle = {
  borderColor: "#E5E7EB",
  boxShadow: "0 1px 0 rgba(0,0,0,0.03)",
};

// Inject a small style tag to emulate Tailwind utility for this isolated file if needed
const style = document?.createElement?.("style");
if (style) {
  style.innerHTML = `.input{${Object.entries(inputStyle)
    .map(
      ([k, v]) => `${k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}:${v}`
    )
    .join(";")}; ${inputBase}}`;
  document.head.appendChild(style);
}

// Date helpers — parse date-only strings as local dates to avoid timezone shifts
function parseLocalDate(d) {
  if (!d) return null;
  if (d instanceof Date) return d;
  const s = String(d);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, day] = s.split("-").map((n) => Number(n));
    return new Date(y, m - 1, day);
  }
  const dt = new Date(s);
  return isNaN(dt.getTime()) ? null : dt;
}

function formatLocalDate(d) {
  const dt = parseLocalDate(d);
  return dt ? dt.toLocaleDateString() : "—";
}

// === Main Component ===
export default function VolunteerHistoryPage() {
  const [rows, setRows] = useState(SAMPLE);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token, logout } = useAuth();

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        const hay = [
          `${r.first_name || ""} ${r.last_name || ""}`,
          r.email,
          r.event_name,
          r.event_description,
          r.location_address,
          r.location_city,
          (r.event_skills || []).join(" "),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesQ = hay.includes(query.toLowerCase());
        // legacy filters keep broad behavior (no status/urgency on this view)
        return matchesQ;
      }),
    [rows, query, statusFilter, urgencyFilter]
  );

  function onAdd() {
    setEditing(null);
    setOpen(true);
  }

  function onEdit(row) {
    setEditing(row);
    setOpen(true);
  }

  function onDelete(id) {
    setRows((rs) => rs.filter((r) => r.id !== id));
  }

  function handleSubmit(data) {
    if (editing) {
      setRows((rs) =>
        rs.map((r) => (r.id === editing.id ? { ...editing, ...data } : r))
      );
    } else {
      const newRow = { ...data, id: String(Date.now()) };
      setRows((rs) => [newRow, ...rs]);
    }
    setOpen(false);
  }

  function exportCSV(eventData) {
    // Deprecated. Per requirement: single report button handles CSV export now.
    return null;
  }

  // Fetch past volunteers (organization-scoped) and transform into table rows
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        if (token === null) {
          logout();
          return;
        }
        const res = await fetch(`${API_BASE_URL}/org/past-volunteers`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to load past volunteers (${res.status})`);
        }

        let data = await res.json();

        // Expecting array of { volunteer, past_events }
        if (!Array.isArray(data)) {
          // If single object, wrap
          if (data && typeof data === "object") {
            // try to detect wrapper
            if (data.volunteer) {
              data = [data];
            } else {
              data = [];
            }
          } else {
            data = [];
          }
        }

        const assignments = [];

        data.forEach((item) => {
          const vol = item.volunteer || {};
          const past = Array.isArray(item.past_events) ? item.past_events : [];

          // If events present, one row per event
          if (past.length > 0) {
            past.forEach((ev) => {
              assignments.push({
                volunteer_id: vol.id ?? null,
                first_name: vol.first_name ?? "",
                last_name: vol.last_name ?? "",
                email: vol.email ?? "",
                event_id: ev.event_id ?? ev.id ?? null,
                event_name: ev.name ?? ev.event_name ?? "",
                event_day: ev.day ?? ev.event_day ?? ev.event_date ?? "",
                start_time: ev.start_time ?? "",
                end_time: ev.end_time ?? "",
                hours: ev.hours ?? ev.duration ?? "",
                event_description: ev.description ?? ev.event_description ?? "",
                event_skills: Array.isArray(ev.needed_skills)
                  ? ev.needed_skills.map((s) =>
                      typeof s === "string" ? s : s.skill
                    )
                  : ev.event_skills || [],
                location_address: ev.location?.address ?? "",
                location_city: ev.location?.city ?? "",
                location_state: ev.location?.state ?? "",
                location_zip: ev.location?.zip_code ?? ev.location?.zip ?? "",
                location_country: ev.location?.country ?? "",
              });
            });
          } else {
            // No past events — row with volunteer only
            assignments.push({
              volunteer_id: vol.id ?? null,
              first_name: vol.first_name ?? "",
              last_name: vol.last_name ?? "",
              email: vol.email ?? "",
              event_id: null,
              event_name: "",
              event_day: "",
              start_time: "",
              end_time: "",
              hours: "",
              event_description: "",
              event_skills: [],
              location_address: "",
              location_city: "",
              location_state: "",
              location_zip: "",
              location_country: "",
            });
          }
        });

        if (mounted) {
          setRows(assignments.length ? assignments : SAMPLE);
        }
      } catch (err) {
        console.error(err);
        if (mounted) setError(err.message || "Failed to load");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  // Trigger the CSV download by calling backend report route
  async function handleGenerateReport() {
    try {
      const includeHeader = true;
      // call the org report route which uses the authenticated admin's org_id
      if (token === null) {
        logout();
        return;
      }
      const res = await fetch(
        `${API_BASE_URL}/org/report?include_header=${includeHeader}`,
        { method: "GET", headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        // got a CSV
        const blob = await res.blob();
        const disposition = res.headers.get("Content-Disposition") || "";
        const filenameMatch = /filename=([^;]+)/i.exec(disposition);
        const filename = filenameMatch
          ? filenameMatch[1].replace(/\"|\'/g, "")
          : `org_report_volunteer_history.csv`;

        const urlObj = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = urlObj;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(urlObj);
        return;
      }
      // if 403 or 401, break and show error
      if (res.status === 401 || res.status === 403) {
        throw Error("Error occured fetching CSV: " + res.error.message);
      }
    } catch (err) {
      console.error(err);
      alert(
        err?.message ||
          "Could not generate report. Ensure you are an org admin."
      );
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "#0F172A0D" }}>
      <header
        className="px-6 py-5 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60"
        style={{ borderColor: "#E5E7EB" }}
      >
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
          <div>
            <h1
              className="text-2xl font-semibold"
              style={{ color: PALETTE.navy }}
            >
              Volunteer History
            </h1>
            <p className="text-sm mt-1" style={{ color: PALETTE.gray }}>
              Tabular display of all participation records with event details
              and status.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerateReport}
              className="px-4 py-2 rounded-xl text-white shadow flex items-center gap-2"
              style={{ background: PALETTE.navy }}
              disabled={loading}
            >
              {loading ? <Spinner size={16} /> : null}
              Generate Report
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        {/* Hours Summary Card (inlined) */}
        {(() => {
          const agg = rows.reduce((acc, r) => {
            const name = `${r.first_name || ""} ${r.last_name || ""}`.trim();
            if (!name && !r.email) return acc;
            const key = name || r.email;
            if (!acc[key])
              acc[key] = {
                name: key,
                completedHours: 0,
                completedEvents: 0,
                lastEventDate: null,
              };
            const hours = Number(r.hours) || 0;
            if (hours > 0) {
              acc[key].completedHours += hours;
              acc[key].completedEvents += 1;
              const d = r.event_day ? parseLocalDate(r.event_day) : null;
              if (d && (!acc[key].lastEventDate || d > acc[key].lastEventDate))
                acc[key].lastEventDate = d;
            }
            return acc;
          }, {});

          const rowsAgg = Object.values(agg).sort(
            (a, b) => b.completedHours - a.completedHours
          );

          const totalHours = rowsAgg.reduce((s, v) => s + v.completedHours, 0);

          return (
            <section
              className="mb-6 rounded-2xl border bg-white shadow-sm"
              style={{ borderColor: "#E5E7EB" }}
            >
              <div
                className="p-4 border-b flex items-center justify-between"
                style={{ borderColor: "#E5E7EB" }}
              >
                <div>
                  <h2
                    className="text-base font-semibold"
                    style={{ color: PALETTE.navy }}
                  >
                    All Volunteers — Hours Since Joined
                  </h2>
                  <p className="text-sm mt-0.5" style={{ color: PALETTE.gray }}>
                    We sum <span className="font-semibold">recorded</span> hours
                    per volunteer.
                  </p>
                </div>
                <div className="text-right">
                  <div
                    className="text-2xl font-semibold"
                    style={{ color: PALETTE.navy }}
                  >
                    {totalHours.toFixed(2)} hrs
                  </div>
                  <div className="text-xs" style={{ color: PALETTE.gray }}>
                    {rowsAgg.length} volunteers
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr
                      className="text-left border-b"
                      style={{ borderColor: "#E5E7EB", color: PALETTE.gray }}
                    >
                      <th className="px-4 py-3">Volunteer</th>
                      <th className="px-4 py-3">Completed Hours</th>
                      <th className="px-4 py-3">Completed Events</th>
                      <th className="px-4 py-3">Last Activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rowsAgg.map((v) => (
                      <tr
                        key={v.name}
                        className="border-b last:border-b-0"
                        style={{ borderColor: "#F3F4F6" }}
                      >
                        <td
                          className="px-4 py-3 font-medium"
                          style={{ color: PALETTE.slate }}
                        >
                          {v.name}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {v.completedHours.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {v.completedEvents}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {v.lastEventDate
                            ? v.lastEventDate.toLocaleDateString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                    {rowsAgg.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-10 text-center text-gray-500"
                        >
                          No completed hours recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })()}
        <section className="rounded-2xl border bg-white shadow-sm">
          <div
            className="p-4 border-b flex flex-col md:flex-row gap-3 md:items-center md:justify-between"
            style={{ borderColor: "#E5E7EB" }}
          >
            <div className="flex items-center gap-3 w-full md:w-auto">
              <input
                placeholder="Search name, event, location, skill…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="input w-full md:w-96"
                disabled={loading}
              />
            </div>
            <div className="flex items-center gap-3">
              <select
                className="input"
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                disabled={loading}
              >
                <option value="">All Urgency</option>
                {URGENCY.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.value}
                  </option>
                ))}
              </select>
              <select
                className="input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                disabled={loading}
              >
                <option value="">All Status</option>
                {STATUS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.value}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr
                  className="text-left border-b"
                  style={{ borderColor: "#E5E7EB", color: PALETTE.gray }}
                >
                  <th className="px-4 py-3">Volunteer</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Event ID</th>
                  <th className="px-4 py-3">Event Name</th>
                  <th className="px-4 py-3">Event Day</th>
                  <th className="px-4 py-3">Start</th>
                  <th className="px-4 py-3">End</th>
                  <th className="px-4 py-3">Hours</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Skills</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">State</th>
                  <th className="px-4 py-3">ZIP</th>
                  <th className="px-4 py-3">Country</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={16}
                      className="px-4 py-12 text-center text-gray-500"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <Spinner size={20} />
                        <span>Loading volunteer history…</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, i) => (
                    <tr
                      key={i}
                      className="border-b last:border-b-0 hover:bg-gray-50 transition"
                      style={{ borderColor: "#F3F4F6" }}
                    >
                      <td
                        className="px-4 py-3 font-medium"
                        style={{ color: PALETTE.slate }}
                      >
                        {`${r.first_name} ${r.last_name}`.trim() || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {r.email || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {r.event_id ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {r.event_name || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {r.event_day ? formatLocalDate(r.event_day) : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {r.start_time || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {r.end_time || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {r.hours ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-[13px] text-gray-700 max-w-[320px]">
                        {r.event_description || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {(r.event_skills || []).map((s, idx) => (
                            <Chip key={idx}>{s}</Chip>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {r.location_address || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {r.location_city || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {r.location_state || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {r.location_zip || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {r.location_country || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onEdit(r)}
                            className="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50"
                            style={{
                              borderColor: "#D1D5DB",
                              color: PALETTE.navy,
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDelete(r.id)}
                            className="px-3 py-1.5 rounded-lg text-sm text-white"
                            style={{ background: PALETTE.error }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={16}
                      className="px-4 py-12 text-center text-gray-500"
                    >
                      No records match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit History Record" : "Add History Record"}
      >
        <HistoryForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
        />
      </Modal>
    </div>
  );
}
