import { useEffect, useRef, useState } from "react";
import { useAuth } from "../hooks/UserContext";
import { API_BASE_URL } from "../config/api";

type Org = {
  id: string;
  idx: number;
  name: string;
  description: string;
  image_url?: string | null;
  location?: {
    address: string;
    city: string;
    state: string;
    country: string;
    zip_code: string;
  };
};

export default function AdminOrgSearch() {
  const { user, loading, token, logout } = useAuth();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Org[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState<Record<string, boolean>>({});
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    // Do not call the endpoint for empty queries (backend requires min_length=1)
    if (!query.trim()) {
      setResults([]);
      setError(null);
      setLoadingResults(false);
      return;
    }

    setLoadingResults(true);
    setError(null);

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    // Debounce 400ms
    debounceRef.current = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        params.set("q", query);
        // include pagination params expected by the endpoint
        params.set("limit", "25");
        params.set("offset", "0");

        if (token === null) {
          logout();
          return;
        }

        const res = await fetch(
          `${API_BASE_URL}/org/search?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(
            payload?.error?.message || `Search failed (${res.status})`
          );
        }

        const data = await res.json();
        // Endpoint returns { count, results }
        setResults(Array.isArray(data?.results) ? data.results : []);
      } catch (err: any) {
        setError(err?.message || "Unknown error");
        setResults([]);
      } finally {
        setLoadingResults(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleJoin = async (org: Org) => {
    const id = org.id ?? org.idx?.toString() ?? org.name;
    if (!id) return;

    console.log(id);

    setJoining((s) => ({ ...s, [id]: true }));
    try {
      if (token === null) {
        logout();
        return;
      }
      const res = await fetch(`${API_BASE_URL}/org/${id}/signup`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const content = await res.json();

      if (!res.ok) {
        throw Error(content.error.message);
      }
      setResults((prev) =>
        prev.filter((o) => (o.id ?? o.idx?.toString() ?? o.name) !== id)
      );
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setJoining((s) => ({ ...s, [id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand">
        Loading...
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand">
        You do not have access for this page.
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-start justify-center bg-sand py-10">
      <div className="w-full max-w-4xl px-4">
        <h1 className="text-2xl font-bold mb-4 text-navy">
          Search Organizations
        </h1>

        <div className="mb-4">
          <input
            type="search"
            aria-label="Search organizations"
            className="w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
            placeholder="Type org name or keywords..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

        {loadingResults && (
          <div className="text-sm text-gray-600 mb-4">Searching...</div>
        )}

        {!loadingResults && results.length === 0 && query.trim() !== "" && (
          <div className="text-gray-600">No organizations found.</div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {results.map((org) => {
            const id = org.id ?? org.idx?.toString() ?? org.name;
            const loc = org.location;
            return (
              <div
                key={id}
                className="bg-white rounded-xl shadow p-4 flex gap-4 items-start border"
              >
                <div className="w-32 h-24 flex-shrink-0 overflow-hidden rounded-lg border bg-gray-100">
                  <img
                    src={
                      org.image_url ||
                      "https://via.placeholder.com/320x240?text=No+Image"
                    }
                    alt={org.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h2 className="text-lg font-semibold text-navy">
                        {org.name}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {org.description || "No description provided."}
                      </p>
                    </div>
                    <div className="text-right">
                      <button
                        onClick={() => handleJoin(org)}
                        disabled={joining[id]}
                        className="px-3 py-1 rounded-lg bg-[#38A3A5] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60"
                      >
                        {joining[id] ? "Joining..." : "Join"}
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-gray-700">
                    {loc ? (
                      <>
                        <div>{loc.address}</div>
                        <div>
                          {`${loc.city}, ${loc.state}, ${loc.country}, ${loc.zip_code}`}
                        </div>
                        <div>{loc.country}</div>{" "}
                      </>
                    ) : (
                      <div>No address</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
