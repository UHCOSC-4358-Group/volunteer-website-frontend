import { NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  const link = ({ isActive }: { isActive: boolean }) =>
    `px-2 py-1 rounded ${isActive ? "bg-white text-[#22577A]" : "hover:underline"}`;

  return (
    <div>
      <nav className="p-4 bg-[#22577A] text-white flex gap-4">
        <NavLink to="/volunteer-profile" className={link}>Profile</NavLink>
        <NavLink to="/volunteer-history" className={link}>History</NavLink>
        <NavLink to="/OrgDashboard" className={link}>Dashboard</NavLink>
        <NavLink to="/event-page" className={link}>Events</NavLink> {/* Here we can see all the events, and create one also */}
      </nav>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}