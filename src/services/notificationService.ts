export const getNotifications = async () => {
  const res = await fetch(`/api/notifications/`, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to load notifications");
  }

  return res.json();
};
