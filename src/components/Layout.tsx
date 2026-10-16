import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { useAuth } from "../hooks/UserContext";
import { VolunteerSVG } from "../assets/Svg";

interface NavItem {
  to: string;
  label: string;
}

// Shared site chrome: sticky header + footer around every page
export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-sand text-slate-900">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}

function useNavItems(): NavItem[] {
  const { user } = useAuth();

  if (user?.role === "volunteer") {
    return [
      { to: "/volunteer-profile", label: "Profile" },
      { to: "/user-event-site", label: "Events" },
      { to: "/about", label: "About" },
      { to: "/contact", label: "Contact" },
    ];
  }
  if (user?.role === "admin") {
    return [
      { to: "/OrgDashboard", label: "Dashboard" },
      { to: "/event-page", label: "Events" },
      { to: "/volunteer-history", label: "History" },
      { to: "/admin-profile", label: "Profile" },
      { to: "/about", label: "About" },
      { to: "/contact", label: "Contact" },
    ];
  }
  return [
    { to: "/#events", label: "Events" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-3 py-2 transition-colors ${
    isActive
      ? "bg-green/10 font-medium text-green"
      : "text-slate-600 hover:text-slate-900"
  }`;

function SiteHeader() {
  const { user, logout } = useAuth();
  const items = useNavItems();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu after navigating
  useEffect(() => setMenuOpen(false), [location.pathname, location.hash]);

  const accountLinks = user ? (
    <>
      <Link
        to={user.role === "admin" ? "/admin-profile" : "/volunteer-profile"}
        className="flex items-center"
        title={user.name}
      >
        {user.image_url ? (
          <img
            src={user.image_url}
            alt=""
            className="h-9 w-9 rounded-full border border-slate-200 object-cover"
          />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green/10 text-sm font-semibold text-green">
            {(user.first_name?.[0] ?? user.email?.[0] ?? "?").toUpperCase()}
          </span>
        )}
      </Link>
      <button
        onClick={logout}
        className="whitespace-nowrap rounded-full px-3 py-2 text-slate-600 hover:text-slate-900"
      >
        Log out
      </button>
    </>
  ) : (
    <>
      <Link
        to="/signin"
        className="hidden whitespace-nowrap rounded-full px-3 py-2 text-slate-600 hover:text-slate-900 sm:block"
      >
        Sign in
      </Link>
      <Link
        to="/signup"
        className="whitespace-nowrap rounded-full bg-green px-4 py-2 font-medium text-white transition-opacity hover:opacity-90"
      >
        Get started
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-green">
          <VolunteerSVG size={28} />
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            Volunteer
          </span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm md:flex">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} end className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1 text-sm sm:gap-2">
          {accountLinks}
          <button
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-full p-2 text-slate-600 hover:text-slate-900 md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-slate-100 bg-white px-4 py-3 text-sm md:hidden">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} end className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
          {!user && (
            <NavLink to="/signin" end className={navLinkClass}>
              Sign in
            </NavLink>
          )}
        </nav>
      )}
    </header>
  );
}

function SiteFooter() {
  const { user } = useAuth();

  return (
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
          {!user && (
            <Link to="/signin" className="hover:text-slate-900">
              Sign in
            </Link>
          )}
        </div>
        <p>© {new Date().getFullYear()} Volunteer</p>
      </div>
    </footer>
  );
}
