export interface ApiLocation {
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
}

export interface ApiOrgEvent {
  id: number;
  name: string;
  description: string;
  day: string;
  start_time: string;
  end_time: string;
  urgency: string;
  capacity: number;
  assigned?: number;
  org_id: number;
  needed_skills?: Array<{ skill: string } | string>;
  location?: ApiLocation | null;
}

export interface LocationPayload {
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

export interface CreateEventPayload {
  name: string;
  description: string;
  location?: LocationPayload | null;
  needed_skills: string[];
  urgency: "Low" | "Medium" | "High" | "Critical";
  capacity: number;
  day: string;
  start_time: string;
  end_time: string;
  org_id: number;
}

export interface UpdateEventPayload {
  name?: string;
  description?: string;
  location?: LocationPayload | null;
  needed_skills?: string[];
  urgency?: "Low" | "Medium" | "High" | "Critical";
  capacity?: number;
  day?: string;
  start_time?: string;
  end_time?: string;
}

export interface Notification {
  id: number;
  subject: string;
  body: string;
  created_at: string;
}

export const getNotifications = async (limit: number = 50, offset: number = 0) => {
  const res = await fetch(`/api/notifications?limit=${limit}&offset=${offset}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to load notifications");

  return res.json();
};



export const getOrgDashboard = async (adminId: number) => {
  const res = await fetch(`/api/org/admin/${adminId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to load dashboard");
  }

  return res.json();
};

// List upcoming events for the authenticated admin's org
export const getOrgEvents = async (): Promise<ApiOrgEvent[]> => {
  const res = await fetch("/api/org/events", {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to load organization events");
  }

  return res.json();
};

// Create a new event for the admin's org
export const createOrgEvent = async (
  payload: CreateEventPayload,
  image?: File
) => {
  const formData = new FormData();
  formData.append("event_data", JSON.stringify(payload));
  if (image) {
    formData.append("image", image);
  }

  const res = await fetch("/api/events/create", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || "Failed to create event");
  }

  return res.json();
};

// Update an existing org event
export const updateOrgEvent = async (
  eventId: number,
  payload: UpdateEventPayload,
  image?: File
) => {
  const formData = new FormData();
  formData.append("event_updates_data", JSON.stringify(payload));
  if (image) {
    formData.append("image", image);
  }

  const res = await fetch(`/api/events/${eventId}`, {
    method: "PATCH",
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || "Failed to update event");
  }

  return res.json();
};

// Delete an event owned by the current admin's organization
export const deleteOrgEvent = async (eventId: number) => {
  const res = await fetch(`/api/events/${eventId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || "Failed to delete event");
  }

  return res.json();
};
