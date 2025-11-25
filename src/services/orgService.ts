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
