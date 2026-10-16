import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiClock, FiMapPin } from "react-icons/fi";
import type { PublicEvent } from "../services/eventService";
import { parseLocalDate, formatTime } from "../utils/dateUtils";

interface Props {
  event: PublicEvent;
  index?: number;
}

function isUrgent(urgency: string) {
  const u = urgency?.toLowerCase();
  return u === "high" || u === "critical";
}

export default function PublicEventCard({ event, index = 0 }: Props) {
  const date = parseLocalDate(event.day);
  const month = date?.toLocaleDateString(undefined, { month: "short" });
  const dayNum = date?.getDate();
  const weekday = date?.toLocaleDateString(undefined, { weekday: "short" });

  const spotsLeft = Math.max(0, event.capacity - event.assigned);
  const filledPct =
    event.capacity > 0
      ? Math.min(100, Math.round((event.assigned / event.capacity) * 100))
      : 0;

  const time = [formatTime(event.start_time), formatTime(event.end_time)]
    .filter(Boolean)
    .join(" – ");
  const place = event.location
    ? [event.location.city, event.location.state].filter(Boolean).join(", ")
    : "Location TBA";

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: Math.min(index, 6) * 0.05 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-lg hover:shadow-green/10"
    >
      {/* Image / placeholder */}
      <div className="relative h-40 overflow-hidden bg-linear-to-br from-mint/40 to-green/20">
        {event.image_url && (
          <img
            src={event.image_url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {date && (
          <div className="absolute left-3 top-3 flex flex-col items-center rounded-xl bg-white/95 px-3 py-1.5 text-center shadow-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-green">
              {month}
            </span>
            <span className="text-xl font-bold leading-none text-slate-900">
              {dayNum}
            </span>
          </div>
        )}
        {isUrgent(event.urgency) && (
          <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
            Urgent need
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          {event.org_name && (
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-green">
              {event.org_name}
            </p>
          )}
          <h3 className="text-lg font-semibold leading-snug text-slate-900">
            {event.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">
            {event.description}
          </p>
        </div>

        <div className="space-y-1.5 text-sm text-slate-600">
          {(weekday || time) && (
            <p className="flex items-center gap-2">
              <FiClock className="shrink-0 text-slate-400" />
              {[weekday, time].filter(Boolean).join(" · ")}
            </p>
          )}
          <p className="flex items-center gap-2">
            <FiMapPin className="shrink-0 text-slate-400" />
            {place}
          </p>
        </div>

        {event.needed_skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {event.needed_skills.slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600"
              >
                {skill}
              </span>
            ))}
            {event.needed_skills.length > 3 && (
              <span className="px-1 py-0.5 text-xs text-slate-400">
                +{event.needed_skills.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Capacity + CTA */}
        <div className="mt-auto pt-2">
          <div className="mb-1.5 flex justify-between text-xs text-slate-500">
            <span>
              {event.assigned} of {event.capacity} spots filled
            </span>
            <span className="font-medium text-slate-700">
              {spotsLeft === 0 ? "Full" : `${spotsLeft} left`}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-green"
              style={{ width: `${filledPct}%` }}
            />
          </div>

          <Link
            to="/signin"
            className="mt-4 block rounded-full border border-green py-2 text-center text-sm font-semibold text-green transition-colors hover:bg-green hover:text-white"
          >
            Sign in to volunteer
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
