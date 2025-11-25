import { NavLink, Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/user-context";
import { VolunteerSVG } from "../assets/Svg";

export default function Layout() {
  const { user, logout } = useAuth();

  // Determine user roles (backend returns "admin" for organizers)
  const isAdmin = user?.role === "admin";
  const isVolunteer = user?.role === "volunteer";

  const link = ({ isActive }: { isActive: boolean }) =>
    `px-2 py-1 rounded ${
      isActive ? "bg-white text-[#22577A]" : "hover:underline"
    }`;
  return (
    <div>
      <header className="text-white bg-teal">
        <nav className="flex justify-between items-center">
          <div className="flex items-center gap-4 pl-3">
            <div>
              <VolunteerSVG size={64} />
            </div>
            <div className="text-4xl font-thin">Volunteer</div>
          </div>
          <nav className="p-4 bg-[#38A3A5] text-white flex gap-4">
            {isVolunteer && (
              <>
                <NavLink to="/volunteer-profile" className={link}>
                  Profile
                </NavLink>
                <NavLink to="/user-event-site" className={link}>
                  Events
                </NavLink>
              </>
            )}

            {isAdmin && (
              <>
                <NavLink to="/volunteer-profile" className={link}>
                  Profile
                </NavLink>
                <NavLink to="/volunteer-history" className={link}>
                  Volunteer History
                </NavLink>
                <NavLink to="/OrgDashboard" className={link}>
                  Dashboard
                </NavLink>
                <NavLink to="/event-page" className={link}>
                  Events
                </NavLink>
              </>
            )}

            <NavLink to="/about" className={link}>
              About
            </NavLink>
            <NavLink to="/contact" className={link}>
              Contact
            </NavLink>
          </nav>

          {/* Right-side links - Show for all users */}
          <div className="hidden sm:flex gap-4 items-center pr-6">
            {user ? (
              <>
                <NavLink
                  to={isAdmin ? "/OrgDashboard" : "/volunteer-profile"}
                  className="hover:opacity-80 transition-opacity"
                >
                  <img
                    className="w-12 h-12 rounded-full object-cover border-navy border-1"
                    src={user.image_url}
                  />
                </NavLink>
                <a
                  onClick={logout}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                >
                  Logout
                </a>
              </>
            ) : (
              <>
                <Link to="/" className="hover:opacity-80 transition-opacity">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="hover:opacity-80 transition-opacity"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
