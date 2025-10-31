import { NavLink, Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  VolunteerSVG,
} from "../assets/Svg";

const PALETTE = {
  navy: "#22577A",
  teal: "#38A3A5",
  green: "#26A96C",
  mint: "#80ED99",
  sand: "#F0EADF",
};

export default function Layout() {
  const link = ({ isActive }: { isActive: boolean }) =>
    `px-2 py-1 rounded ${isActive ? "bg-white text-[#22577A]" : "hover:underline"}`;

  return (
    <div>
      <header className="text-white" style={{ backgroundColor: PALETTE.teal }}>
        <nav className="flex justify-between items-center">
          <div className="flex items-center gap-4 pl-3">
            <div>
              <VolunteerSVG size={64} />
            </div>
            <div className="text-4xl font-thin">Volunteer</div>
          </div>
          <nav className="p-4 bg-[#38A3A5] text-white flex gap-4">
            <NavLink to="/volunteer-profile" className={link}>User View</NavLink>
            <NavLink to="/volunteer-history" className={link}>History</NavLink>
            <NavLink to="/OrgDashboard" className={link}>Dashboard</NavLink>
            <NavLink to="/event-page" className={link}>Events</NavLink> {/* Here we can see all the events, and create one also */}
          </nav>
          <div className="hidden sm:flex gap-4 items-center pr-6">
            <Link
              to="/"
              className="hover:opacity-80 transition-opacity"
            >
              Logout
            </Link>
            <Link
              to="/about"
              className="hover:opacity-80 transition-opacity"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="hover:opacity-80 transition-opacity"
            >
              Contact
            </Link>
          </div>
        </nav>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
