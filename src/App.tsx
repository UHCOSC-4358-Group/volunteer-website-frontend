import { Routes, Route, Navigate } from "react-router-dom";
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
import Layout from "./components/Layout";
// @ts-ignore
import UserEventSite from "./components/userEventSite";
// @ts-ignore
import about, { AboutPage } from "./components/aboutPage";
// @ts-ignore
import contact, { ContactPage } from "./components/contactPage";
import { Signup } from "./components/auth/Signup";
import {
  AuthContext,
  AuthProvider,
  AuthContextType,
} from "./hooks/user-context";
import { UnauthorizedPage } from "./components/auth/UnauthorizedPage";
// App functionality with routing
function App() {
  const authState: AuthContextType = AuthProvider();

  return (
    <AuthContext.Provider value={authState}>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
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
    </AuthContext.Provider>
  );
}
export default App;
