import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowRight,
  FiCalendar,
  FiSearch,
  FiUserPlus,
  FiHeart,
} from "react-icons/fi";
import { VolunteerSVG } from "../assets/Svg";
import PublicEventCard from "./PublicEventCard";
import { fetchUpcomingEvents, type PublicEvent } from "../services/eventService";

type Filter = "all" | "week" | "urgent";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "week", label: "This week" },
  { key: "urgent", label: "Urgent" },
];

const STEPS = [
  {
    icon: FiUserPlus,
    title: "Create a profile",
    text: "Tell us your skills, availability and where you'd like to help.",
  },
  {
    icon: FiCalendar,
    title: "Pick an event",
    text: "Browse local events or let us match you with ones that fit.",
  },
  {
    icon: FiHeart,
    title: "Show up and help",
    text: "Get reminders, check in, and track the hours you've given.",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
};

function matchesFilter(event: PublicEvent, filter: Filter) {
  if (filter === "urgent") {
    const u = event.urgency?.toLowerCase();
    return u === "high" || u === "critical";
  }
  if (filter === "week") {
    if (!event.day) return false;
    const [y, m, d] = event.day.split("-").map(Number);
    const eventDate = new Date(y, m - 1, d);
    const weekOut = new Date();
    weekOut.setHours(0, 0, 0, 0);
    weekOut.setDate(weekOut.getDate() + 7);
    return eventDate <= weekOut;
  }
  return true;
}

export default function HomePage() {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetchUpcomingEvents(24, controller.signal)
      .then(setEvents)
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [reloadKey]);

  const visibleEvents = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((e) => {
      if (!matchesFilter(e, filter)) return false;
      if (!q) return true;
      return [
        e.name,
        e.description,
        e.org_name,
        e.location?.city,
        ...e.needed_skills,
      ]
        .filter(Boolean)
        .some((s) => String(s).toLowerCase().includes(q));
    });
  }, [events, query, filter]);

  const totalSpots = events.reduce(
    (sum, e) => sum + Math.max(0, e.capacity - e.assigned),
    0
  );

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-green">
            <VolunteerSVG size={28} />
            <span className="text-lg font-semibold tracking-tight text-slate-900">
              Volunteer
            </span>
          </Link>
          <nav className="flex items-center gap-1 text-sm sm:gap-2">
            <a
              href="#events"
              className="hidden rounded-full px-3 py-2 text-slate-600 hover:text-slate-900 sm:block"
            >
              Events
            </a>
            <Link
              to="/about"
              className="hidden rounded-full px-3 py-2 text-slate-600 hover:text-slate-900 sm:block"
            >
              About
            </Link>
            <Link
              to="/signin"
              className="rounded-full px-3 py-2 text-slate-600 hover:text-slate-900"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="rounded-full bg-green px-4 py-2 font-medium text-white transition-opacity hover:opacity-90"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-mint/25 blur-3xl" />
        <motion.div
          {...fadeUp}
          className="relative mx-auto max-w-3xl px-4 pb-16 pt-20 text-center sm:px-6 sm:pt-28"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-green/20 bg-green/5 px-3 py-1 text-xs font-medium text-green">
            <span className="h-1.5 w-1.5 rounded-full bg-green" />
            {loading
              ? "Loading upcoming events"
              : `${events.length} upcoming volunteer events`}
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-6xl">
            Find a way to help{" "}
            <span className="text-green">this week.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-slate-500 sm:text-lg">
            Browse volunteer opportunities from local organizations. No account
            needed to look around.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="#events"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-green px-6 py-3 font-medium text-white transition-opacity hover:opacity-90"
            >
              Browse events <FiArrowRight />
            </a>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-3 font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              Join as a volunteer
            </Link>
          </div>
          {!loading && !error && totalSpots > 0 && (
            <p className="mt-6 text-sm text-slate-400">
              {totalSpots} open volunteer spots right now
            </p>
          )}
        </motion.div>
      </section>

      {/* Events */}
      <section id="events" className="scroll-mt-20 bg-slate-50/60 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div
            {...fadeUp}
            className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
          >
            <div>
              <p className="text-sm font-medium text-green">Upcoming</p>
              <h2 className="mt-1 text-3xl font-semibold tracking-tight">
                Volunteer events
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex gap-1 rounded-full border border-slate-200 bg-white p-1">
                {FILTERS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`flex-1 whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors ${
                      filter === f.key
                        ? "bg-green text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <label className="relative block">
                <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search events, skills, cities"
                  className="w-full rounded-full border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-green focus:ring-2 focus:ring-green/15 sm:w-64"
                />
              </label>
            </div>
          </motion.div>

          <div className="mt-10">
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-96 animate-pulse rounded-2xl border border-slate-200 bg-white"
                  >
                    <div className="h-40 rounded-t-2xl bg-slate-100" />
                    <div className="space-y-3 p-5">
                      <div className="h-3 w-1/3 rounded bg-slate-100" />
                      <div className="h-5 w-3/4 rounded bg-slate-100" />
                      <div className="h-3 w-full rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center">
                <p className="font-medium text-slate-900">
                  We couldn't load events right now.
                </p>
                <p className="mt-1 text-sm text-slate-500">{error}</p>
                <button
                  onClick={() => setReloadKey((k) => k + 1)}
                  className="mt-5 rounded-full border border-green px-5 py-2 text-sm font-medium text-green hover:bg-green hover:text-white"
                >
                  Try again
                </button>
              </div>
            ) : visibleEvents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
                <p className="font-medium text-slate-900">
                  {events.length === 0
                    ? "No upcoming events yet."
                    : "No events match your search."}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {events.length === 0
                    ? "Check back soon, organizations post new events every week."
                    : "Try a different keyword or filter."}
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visibleEvents.map((event, i) => (
                  <PublicEventCard key={event.id} event={event} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div {...fadeUp} className="max-w-xl">
            <p className="text-sm font-medium text-green">How it works</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight">
              From signing up to showing up
            </h2>
          </motion.div>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <motion.div
                key={title}
                {...fadeUp}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green/10 text-green">
                  <Icon size={20} />
                </div>
                <h3 className="mt-4 font-semibold">
                  <span className="mr-2 text-slate-300">0{i + 1}</span>
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Org CTA */}
      <section className="px-4 pb-16 sm:px-6 sm:pb-24">
        <motion.div
          {...fadeUp}
          className="mx-auto flex max-w-6xl flex-col items-start gap-6 rounded-3xl bg-slate-900 px-6 py-10 sm:px-12 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Run an organization?
            </h2>
            <p className="mt-2 max-w-md text-slate-400">
              Post events, get matched with qualified volunteers, and track
              participation in one place.
            </p>
          </div>
          <Link
            to="/signup"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-green px-6 py-3 font-medium text-white transition-opacity hover:opacity-90"
          >
            Register your organization <FiArrowRight />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2 text-green">
            <VolunteerSVG size={20} />
            <span className="text-slate-700">Volunteer</span>
          </div>
          <div className="flex gap-6">
            <Link to="/about" className="hover:text-slate-900">
              About
            </Link>
            <Link to="/contact" className="hover:text-slate-900">
              Contact
            </Link>
            <Link to="/signin" className="hover:text-slate-900">
              Sign in
            </Link>
          </div>
          <p>© {new Date().getFullYear()} Volunteer</p>
        </div>
      </footer>
    </div>
  );
}
