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

// Public endpoint, no auth header needed
export async function fetchUpcomingEvents(
  limit = 24,
  signal?: AbortSignal
): Promise<PublicEvent[]> {
  const res = await fetch(`${API_BASE_URL}/events/?limit=${limit}`, {
    headers: { Accept: "application/json" },
    signal,
  });

  if (!res.ok) {
    throw new Error(`Failed to load events (${res.status})`);
  }

  const json = await res.json();
  return Array.isArray(json?.results) ? json.results : [];
}
