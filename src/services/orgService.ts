export type ApiOrgEvent = {
  id: number;
  name: string;
  description: string;
  day: string;
  start_time: string;
  end_time: string;
  urgency: string;
  capacity: number;
  assigned: number;
  org_id: number;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;
  } | null;
  needed_skills?: string[];
};

export const getOrgDashboard = async (adminId: number) => {
  const res = await fetch(`/api/org/admin/${adminId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to load dashboard");
  }

  return res.json();
};

export const fetchAdminOrgEvents = async (): Promise<ApiOrgEvent[]> => {
  const res = await fetch("/api/org/events", {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to load organization events");
  }

  return res.json();
};

export const createOrgEvent = async (eventData: object) => {
  const formData = new FormData();
  formData.append("event_data", JSON.stringify(eventData));

  const res = await fetch("/api/events/create", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Failed to create event");
  }

  return res.json();
};

export const updateOrgEvent = async (eventId: number, updates: object) => {
  const formData = new FormData();
  formData.append("event_updates_data", JSON.stringify(updates));

  const res = await fetch(`/api/events/${eventId}`, {
    method: "PATCH",
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Failed to update event");
  }

  return res.json();
};

export const deleteOrgEvent = async (eventId: number) => {
  const res = await fetch(`/api/events/${eventId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Failed to delete event");
  }

  return res.json();
};
