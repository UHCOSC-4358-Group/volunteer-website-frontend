import { API_BASE_URL } from "../config/api";

export const getNotifications = async (token: string) => {
  const res = await fetch(`${API_BASE_URL}/notifications/`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to load notifications");
  }

  return res.json();
};
