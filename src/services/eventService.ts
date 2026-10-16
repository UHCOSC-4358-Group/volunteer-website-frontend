import { API_BASE_URL } from "../config/api";

export interface PublicEvent {
  id: number;
  name: string;
  description: string;
  day: string | null;
  start_time: string | null;
  end_time: string | null;
  urgency: string;
  capacity: number;
  assigned: number;
  org_id: number;
  org_name?: string | null;
  image_url?: string | null;
  location: {
    address: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  } | null;
  needed_skills: string[];
}

export interface EventQuery {
  limit?: number;
  offset?: number;
  q?: string;
  urgent?: boolean;
  withinDays?: number;
}

export interface EventPage {
  results: PublicEvent[];
  // Matching events across all pages (null if the API doesn't report it)
  total: number | null;
}

// Public endpoint, no auth header needed
export async function fetchUpcomingEvents(
  { limit = 9, offset = 0, q, urgent, withinDays }: EventQuery = {},
  signal?: AbortSignal
): Promise<EventPage> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  if (q) params.set("q", q);
  if (urgent) params.set("urgent", "true");
  if (withinDays !== undefined) params.set("within_days", String(withinDays));

  const res = await fetch(`${API_BASE_URL}/events/?${params}`, {
    headers: { Accept: "application/json" },
    signal,
  });

  if (!res.ok) {
    throw new Error(`Failed to load events (${res.status})`);
  }

  const json = await res.json();
  return {
    results: Array.isArray(json?.results) ? json.results : [],
    total: typeof json?.total === "number" ? json.total : null,
  };
}
