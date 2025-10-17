import VolunteerProfile from "./components/VolunteerProfile";
import SignIn from "./components/SignIn";
// @ts-ignore
import OrgDashboard from "./components/dashboard";
// @ts-ignore
import VolunteerHistory from "./components/volunteerHistory";
import Profile from "./components/Profile";
// @ts-ignore
import CreateEvent from "./components/CreateEvent";
import EventsPage from './components/EventPage';
// @ts-ignore
import Matching from "./components/Matching";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
// App functionality with routing
function App() {
  return (
    <div>
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="/Profile" element={<Profile />} />
      <Route element={<Layout />}>
        <Route path="/volunteer-profile" element={<VolunteerProfile />} />
        <Route path="/volunteer-history" element={<VolunteerHistory />} />
        <Route path="/OrgDashboard" element={<OrgDashboard />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/event-page" element={<EventsPage />} />
        <Route path="/matching" element={<Matching />} />
      </Route>
      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/volunteer-profile" replace />} />
    </Routes>
    </div>
  );
}
export default App;
