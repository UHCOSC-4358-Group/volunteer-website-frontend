const API_URL = import.meta.env.VITE_APP_BACKEND_URL ?? "http://localhost:8080";

export const getNotifications = async () => {
  const res = await fetch(`${API_URL}/api/notifications`, {
    method: "GET",
    credentials: "include", // IMPORTANT: sends auth cookie
  });

  if (!res.ok) {
    throw new Error("Failed to load notifications");
  }

  
  return res.json();
};
