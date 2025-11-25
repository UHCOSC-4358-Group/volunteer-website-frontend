import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/user-context";

interface Admin {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  organization_id?: number | null;
  organization_name?: string;
  role?: string;
  created_at?: string;
}

interface OrganizationStats {
  total_volunteers: number;
  total_events: number;
  upcoming_events: number;
  completed_events: number;
  volunteer_hours: number;
}

interface AdminEvent {
  event_id: number;
  name: string;
  day: string;
  start_time: string;
  end_time: string;
  location: string;
  assigned: number;
  capacity: number;
  urgency: string;
}

interface AdminProfileResponse {
  admin: Admin;
  organization_stats: OrganizationStats;
  upcoming_events: AdminEvent[];
}

const FALLBACK_PROFILE: AdminProfileResponse = {
  admin: {
    id: -1,
    email: "admin@example.com",
    first_name: "Sample",
    last_name: "Admin",
    organization_id: null,
    organization_name: "Demo Organization",
    role: "Administrator",
    created_at: new Date().toISOString(),
  },
  organization_stats: {
    total_volunteers: 18,
    total_events: 12,
    upcoming_events: 3,
    completed_events: 9,
    volunteer_hours: 420,
  },
  upcoming_events: [
    {
      event_id: 1,
      name: "Community Clean-up",
      day: new Date().toISOString(),
      start_time: "09:00",
      end_time: "12:00",
      location: "Central Park",
      assigned: 8,
      capacity: 12,
      urgency: "MEDIUM",
    },
    {
      event_id: 2,
      name: "Food Pantry Shift",
      day: new Date().toISOString(),
      start_time: "14:00",
      end_time: "17:00",
      location: "Downtown Pantry",
      assigned: 5,
      capacity: 10,
      urgency: "LOW",
    },
  ],
};

const AdminProfile: React.FC = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<AdminProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const buildLocationString = (event: any) => {
      if (typeof event?.location === "string") return event.location;

      const locationObj = event?.location ?? {};
      const parts = [
        locationObj.address,
        locationObj.address1,
        locationObj.address2,
        locationObj.city,
        locationObj.state,
      ]
        .filter(Boolean)
        .map((part: string) => part.trim())
        .filter(Boolean);

      return parts.join(", ") || "TBD";
    };

    const normalizeProfileResponse = (
      raw: any,
      source: string
    ): AdminProfileResponse => {
      console.debug(`[AdminProfile] Normalizing response from ${source}`);
      const admin = raw?.admin ?? raw?.user ?? raw ?? {};
      const organization = raw?.organization ?? raw?.org ?? raw?.organization_info;
      const upcoming = Array.isArray(raw?.upcoming_events)
        ? raw.upcoming_events
        : Array.isArray(raw?.events)
        ? raw.events
        : Array.isArray(raw?.upcoming)
        ? raw.upcoming
        : [];

      const normalizedEvents: AdminEvent[] = upcoming.map((event: any, idx: number) => ({
        event_id:
          event?.event_id ??
          event?.id ??
          event?.eventId ??
          Number(`${user?.id ?? 0}${idx}`),
        name: event?.name ?? event?.title ?? "Event",
        day: event?.day ?? event?.date ?? new Date().toISOString(),
        start_time: event?.start_time ?? event?.start ?? event?.startTime ?? "00:00",
        end_time: event?.end_time ?? event?.end ?? event?.endTime ?? "00:00",
        location: buildLocationString(event),
        assigned: event?.assigned ?? event?.volunteers_signed_up ?? 0,
        capacity: event?.capacity ?? event?.max_volunteers ?? 0,
        urgency: event?.urgency ?? event?.priority ?? "LOW",
      }));

      const organizationStats: OrganizationStats = {
        total_volunteers:
          organization?.total_volunteers ??
          organization?.volunteer_count ??
          organization?.volunteers?.length ??
          0,
        total_events:
          organization?.total_events ??
          organization?.events?.length ??
          normalizedEvents.length,
        upcoming_events: normalizedEvents.length,
        completed_events: organization?.completed_events ?? 0,
        volunteer_hours: organization?.volunteer_hours ?? 0,
      };

      return {
        admin: {
          id: admin?.id ?? user?.id ?? -1,
          email: admin?.email ?? user?.email ?? "unknown@example.com",
          first_name: admin?.first_name ?? admin?.firstName ?? "Admin",
          last_name: admin?.last_name ?? admin?.lastName ?? "",
          organization_id: admin?.org_id ?? admin?.organization_id ?? organization?.id,
          organization_name:
            organization?.name ?? admin?.organization_name ?? "No organization assigned",
          role: admin?.role ?? "Admin",
          created_at: admin?.created_at ?? admin?.createdAt ?? new Date().toISOString(),
        },
        organization_stats: organizationStats,
        upcoming_events: normalizedEvents,
      };
    };

    const fetchAdminProfile = async () => {
      if (!user?.id) {
        setError("Please log in to view admin profile.");
        setLoading(false);
        return;
      }

      const candidateEndpoints = [
        { url: `/api/org/admin/${user.id}`, label: "org admin by id" },
        { url: "/api/auth/admin", label: "current admin" },
        { url: "/api/admin/profile", label: "legacy /admin/profile" },
        { url: "/api/admin/me", label: "legacy /admin/me" },
        { url: "/api/user/profile", label: "unified user profile" },
      ];

      let lastError = "";

      for (const endpoint of candidateEndpoints) {
        try {
          console.info(`[AdminProfile] Trying ${endpoint.label} at ${endpoint.url}`);

          const response = await fetch(endpoint.url, {
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          });

          if (response.ok) {
            const raw = await response.json();
            const normalized = normalizeProfileResponse(raw, endpoint.label);
            setProfileData(normalized);
            {/*
            setStatusMessage(`Loaded admin profile from ${endpoint.url}`);
            */}
            setLoading(false);
            return;
          }

          if (response.status === 401) {
            throw new Error("Please log in again.");
          }

          if (response.status === 403) {
            throw new Error("You are not authorized to view this admin profile.");
          }

          if (response.status === 404) {
            console.warn(
              `[AdminProfile] ${endpoint.url} returned 404. Trying next fallback.`
            );
            lastError = `Endpoint ${endpoint.url} not found (404)`;
            continue;
          }

          lastError = `Endpoint ${endpoint.url} failed with status ${response.status}`;
          console.warn(`[AdminProfile] ${lastError}`);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error";
          lastError = message;
          console.error(`[AdminProfile] ${endpoint.label} error: ${message}`);
          if (message.includes("log in")) {
            setError(message);
            setLoading(false);
            return;
          }
          if (message.toLowerCase().includes("authorized")) {
            setError(message);
            setLoading(false);
            return;
          }
        }
      }

      console.info(
        "[AdminProfile] Falling back to placeholder admin data while backend endpoint is unavailable."
      );

      setProfileData({
        ...FALLBACK_PROFILE,
        admin: {
          ...FALLBACK_PROFILE.admin,
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
        },
      });
      setStatusMessage(
        lastError
          ? `${lastError}. Showing fallback admin data while backend is being built.`
          : "Showing fallback admin data while backend is being built."
      );
      setError(null);
      setLoading(false);
    };

    setLoading(true);
    setError(null);
    setStatusMessage(null);
    fetchAdminProfile();
  }, [user?.id, user?.email, user?.first_name, user?.last_name]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading admin profile...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        No admin profile data available.
      </div>
    );
  }

  const { admin, organization_stats, upcoming_events } = profileData;
  const memberSince = admin.created_at
    ? new Date(admin.created_at)
    : new Date();

  return (
    <div className="max-w-6xl mx-auto p-6">
      {statusMessage && (
        <div className="mb-4 rounded border border-blue-200 bg-blue-50 px-4 py-3 text-blue-800">
          {statusMessage}
        </div>
      )}
      {/* Admin Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {admin.first_name} {admin.last_name}
        </h1>
        <p className="text-gray-600 mb-1">
          <strong>Email:</strong> {admin.email}
        </p>
        <p className="text-gray-600 mb-1">
          <strong>Organization:</strong> {admin.organization_name}
        </p>
        <p className="text-gray-600 mb-1">
          <strong>Role:</strong> {admin.role}
        </p>
        <p className="text-gray-600">
          <strong>Member Since:</strong> {memberSince.toLocaleDateString()}
        </p>
      </div>

      {/* Organization Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Organization Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-2xl font-bold text-blue-700">{organization_stats.total_volunteers}</h3>
            <p className="text-gray-600">Total Volunteers</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-2xl font-bold text-green-700">{organization_stats.total_events}</h3>
            <p className="text-gray-600">Total Events</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-2xl font-bold text-yellow-700">{organization_stats.upcoming_events}</h3>
            <p className="text-gray-600">Upcoming Events</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-2xl font-bold text-purple-700">{organization_stats.volunteer_hours}</h3>
            <p className="text-gray-600">Volunteer Hours</p>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Upcoming Events</h2>
        {upcoming_events.length === 0 ? (
          <p className="text-gray-500 italic">No upcoming events scheduled.</p>
        ) : (
          <div className="space-y-4">
            {upcoming_events.map((event) => (
              <div key={event.event_id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">{event.name}</h3>
                    <p className="text-gray-600">
                      {new Date(event.day).toLocaleDateString()} • {event.start_time} - {event.end_time}
                    </p>
                    <p className="text-gray-600">{event.location}</p>
                    <p className="text-gray-600">
                      Volunteers: {event.assigned}/{event.capacity}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      event.urgency === 'HIGH'
                        ? 'bg-red-100 text-red-800'
                        : event.urgency === 'MEDIUM'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {event.urgency}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProfile;
