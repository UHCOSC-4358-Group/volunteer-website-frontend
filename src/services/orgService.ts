export const getOrgDashboard = async (adminId: number, token: string) => {
  const res = await fetch(`/api/org/admin/${adminId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to load dashboard");
  }

  return res.json();
};

// Delete an event owned by the current admin's organization
export const deleteOrgEvent = async (eventId: number, token: string) => {
  const res = await fetch(`/api/events/${eventId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to delete event");
  }

  return res.json();
};
