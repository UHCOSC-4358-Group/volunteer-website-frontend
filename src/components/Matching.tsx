import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../hooks/UserContext";
import { formatLocalDate } from "../utils/dateUtils";
import { API_BASE_URL } from "../config/api";

type VolunteerMatch = {
  volunteer_id: number;
  first_name: string;
  last_name: string;
  email: string;
  score: number;
};

type EventMatch = {
  event_id: number;
  name: string;
  day: string | null;
  start_time: string | null;
  end_time: string | null;
  matches: VolunteerMatch[];
};

type MatchResponse = {
  org_id?: number;
  count: number;
  results: EventMatch[];
};

function ScoreChip({ percent }: { percent: number }) {
  const p = Math.round(Math.max(0, Math.min(100, percent)));
  const bg = p >= 90 ? "#CFF6D8" : p >= 80 ? "#FFF3C6" : "#E6EEF2";
  const txt = p >= 90 ? "#1E7A45" : p >= 80 ? "#8A6D00" : "#2A4A5B";
  return (
    <span
      className="px-3 py-1 rounded-full text-sm font-semibold"
      style={{ backgroundColor: bg, color: txt }}
      title={`${p}%`}
    >
      {p}%
    </span>
  );
}

// scoreToPercent is no longer used; percentages are computed relative to event max

function scoreToNumber(v: number | string) {
  // accept numbers or strings like "97" or "97%" and convert to numeric
  if (typeof v === "number") return v;
  const n = parseFloat(String(v).replace(/[^0-9.-]+/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function VolunteerRow({
  v,
  event,
  token,
  logout,
}: {
  v: VolunteerMatch & { _scoreNum?: number };
  event: EventMatch;
  token: string;
  logout: () => void;
}) {
  const num = v._scoreNum ?? scoreToNumber(v.score);
  const pct = Math.round(Math.max(1, Math.min(100, num * 10)));

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  async function sendInvite() {
    setSending(true);
    setSendError(null);
    try {
      const payload = {
        subject: `Invitation: ${event.name}`,
        body: `Hi ${v.first_name}, we'd like to invite you to join '${
          event.name
        }' on ${event.day ? formatLocalDate(event.day) : "TBD"}${
          event.start_time ? ` at ${event.start_time}` : ""
        }. Please visit your dashboard to accept.`,
        recipient_id: v.volunteer_id,
        recipient_type: "volunteer",
      };

      if (token === null) {
        logout();
        return;
      }

      const res = await fetch(`${API_BASE_URL}/notifications/`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        setSendError("Unauthorized. Please sign in.");
        return;
      }
      if (res.status === 403) {
        setSendError("Forbidden. You don't have permission.");
        return;
      }

      if (res.status === 201 || res.ok) {
        setSent(true);
      } else {
        const txt = await res.text().catch(() => "Failed to send notification");
        setSendError(txt || "Failed to send notification");
      }
    } catch (err: any) {
      setSendError(err?.message || "Unknown error");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="border-mint bg-white rounded-2xl p-4 flex items-center justify-between gap-4 border">
      <div>
        <div className="text-navy text-lg font-semibold">
          {v.first_name} {v.last_name}
        </div>
        <div className="text-sm text-[#475569]">{v.email}</div>
      </div>

      <div className="flex items-center gap-3">
        <div style={{ width: 220 }} className="flex items-center gap-3">
          <div className="flex-1 bg-[#F1F5F9] rounded-full h-3 overflow-hidden">
            <div
              style={{
                width: `${pct}%`,
                backgroundColor: "#06b6d4",
                height: 12,
              }}
            />
          </div>
          <ScoreChip percent={pct} />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={sendInvite}
            disabled={sending || sent}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              sent ? "bg-gray-200 text-gray-700" : "bg-indigo-600 text-white"
            }`}
            title={sent ? "Invitation sent" : "Invite volunteer"}
          >
            {sending ? "Sending…" : sent ? "Invited" : "Invite"}
          </button>
        </div>
      </div>

      {sendError && <div className="text-sm text-red-600">{sendError}</div>}
    </div>
  );
}

export default function Matching() {
  const { user, token, logout } = useAuth();
  const [topK, setTopK] = useState<number>(10);
  const [maxDistance, setMaxDistance] = useState<number>(25.0);
  const [distanceUnit, setDistanceUnit] = useState<"km" | "mile">("mile");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MatchResponse | null>(null);

  const canView = user?.role === "admin";

  if (token === null) {
    logout();
    return;
  }

  useEffect(() => {
    // fetch on mount
    fetchMatches(topK);
  }, []);

  async function fetchMatches(k: number) {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const params = new URLSearchParams();
      params.set("top_k", String(k));
      params.set("max_distance", String(maxDistance));
      params.set("distance_unit", String(distanceUnit));

      if (token === null) {
        logout();
        return;
      }

      const res = await fetch(
        `${API_BASE_URL}/org/events/match?${params.toString()}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 401) {
        setError("Unauthorized. Please sign in.");
        return;
      }

      if (res.status === 403) {
        setError("Forbidden. Must be an admin to view matches.");
        return;
      }

      if (res.status === 404) {
        setError("Admin record not found.");
        return;
      }

      if (!res.ok) {
        const txt = await res.text().catch(() => "Failed to load matches");
        throw new Error(txt || "Failed to load matches");
      }

      const json = (await res.json()) as MatchResponse;
      setData(json);
    } catch (err: any) {
      setError(err?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const events = useMemo(() => {
    if (!data?.results) return [];
    return data.results.map((ev) => {
      const mapped = ev.matches.map((m) => ({
        ...m,
        _scoreNum: scoreToNumber(m.score),
      }));
      mapped.sort((a, b) => b._scoreNum - a._scoreNum);
      return { ...ev, matches: mapped } as any;
    });
  }, [data]);

  return (
    <main className="bg-sand min-h-screen p-6">
      <div className="border-mint max-w-4xl mx-auto bg-white rounded-2xl shadow-md border">
        <div className="border-mint flex items-center justify-between p-5 border-b">
          <h1 className="text-navy text-2xl font-bold">Event Matches</h1>
          <div className="flex items-center gap-3">
            <label className="text-sm text-[#475569]">Top</label>
            <input
              type="number"
              min={1}
              max={100}
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value || 10))}
              className="w-20 px-3 py-2 rounded-md border"
            />
            <label className="text-sm text-[#475569]">Radius</label>
            <input
              type="number"
              min={0}
              step={0.1}
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value || 0))}
              className="w-24 px-3 py-2 rounded-md border"
            />
            <select
              value={distanceUnit}
              onChange={(e) => setDistanceUnit(e.target.value as "km" | "mile")}
              className="px-3 py-2 rounded-md border"
            >
              <option value="mile">mile</option>
              <option value="km">km</option>
            </select>
            <button
              className="bg-teal px-4 py-2 rounded-full font-semibold text-white"
              onClick={() => fetchMatches(topK)}
            >
              Refresh
            </button>
            <button
              className="bg-gray-100 px-4 py-2 rounded-full font-semibold"
              onClick={() => window.history.back()}
            >
              Back
            </button>
          </div>
        </div>

        <div className="p-5 space-y-6">
          {!canView && (
            <div className="text-[#b91c1c]">
              You must be an admin to view matches.
            </div>
          )}

          {loading && <div>Loading matches…</div>}

          {error && <div className="text-red-600">{error}</div>}

          {!loading && !error && data && (
            <div className="space-y-6">
              <div className="text-sm text-[#475569]">
                Organization: {data.org_id ?? "(none)"} — {data.count} upcoming
                event{data.count !== 1 ? "s" : ""}
              </div>

              {events.length === 0 && (
                <div className="text-sm text-[#64748B]">
                  No upcoming events found.
                </div>
              )}

              <div className="space-y-6">
                {events.map((ev) => (
                  <section key={ev.event_id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl text-navy font-semibold">
                          {ev.name}
                        </h2>
                        <div className="text-sm text-[#64748B]">
                          {ev.day ? formatLocalDate(ev.day) : "(day unset)"}
                          {ev.start_time ? ` • ${ev.start_time}` : ""}
                          {ev.end_time ? ` - ${ev.end_time}` : ""}
                        </div>
                      </div>
                      <div className="text-sm text-[#64748B]">
                        {ev.matches.length} match
                        {ev.matches.length !== 1 ? "es" : ""}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {ev.matches.map((v: any) => (
                        <VolunteerRow
                          key={v.volunteer_id}
                          v={v}
                          event={ev}
                          token={token}
                          logout={logout}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
