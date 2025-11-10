import VolunteerProfile from "./components/VolunteerProfile";
import SignIn from "./components/auth/SignIn";
// @ts-ignore
import OrgDashboard from "./components/dashboard";
// @ts-ignore
import VolunteerHistory from "./components/volunteerHistory";
// @ts-ignore
import CreateEvent from "./components/CreateEvent";
import EventsPage from "./components/EventPage";
// @ts-ignore
import Matching from "./components/Matching";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
// @ts-ignore
import UserEventSite from "./components/userEventSite";
// @ts-ignore
import about, { AboutPage } from "./components/aboutPage";
// @ts-ignore
import contact, { ContactPage } from "./components/contactPage";
import AdminCreate from "./components/auth/AdminSignupForm";
import { Signup } from "./components/auth/Signup";
// App functionality with routing
function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/signup" element={<SignIn />} />
        <Route path="/signup/admin" element={<AdminCreate />} />
        <Route element={<Layout />}>
          <Route path="/volunteer-profile" element={<VolunteerProfile />} />
          <Route path="/volunteer-history" element={<VolunteerHistory />} />
          <Route path="/OrgDashboard" element={<OrgDashboard />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/event-page" element={<EventsPage />} />
          <Route path="/matching" element={<Matching />} />
          <Route path="/user-event-site" element={<UserEventSite />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>
        <Route
          path="*"
          element={<Navigate to="/volunteer-profile" replace />}
        />
      </Routes>
    </div>
  );
}
export default App;
