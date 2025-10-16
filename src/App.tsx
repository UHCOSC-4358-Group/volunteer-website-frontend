import VolunteerProfile from "./components/VolunteerProfile";
import SignIn from "./components/SignIn";
// @ts-ignore
import OrgDashboard from "./components/dashboard";
// @ts-ignore
import VolunteerHistory from "./components/volunteerHistory";
import Profile from "./components/Profile";
<<<<<<< HEAD

import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
=======
import CreateEvent from "./components/createEvent";
import { Routes, Route } from "react-router-dom";
>>>>>>> origin/main

function App() {
  return (
    <div>
    <Routes>
      <Route path="/" element={<SignIn />} />
<<<<<<< HEAD
      <Route path="/Profile" element={<Profile />} />
      <Route element={<Layout />}>
        <Route path="/volunteer-profile" element={<VolunteerProfile />} />
        <Route path="/volunteer-history" element={<VolunteerHistory />} />
        <Route path="/OrgDashboard" element={<OrgDashboard />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/volunteer-profile" replace />} />
=======
      <Route path= "/Profile" element= {<Profile />} />
      <Route path="/volunteer-profile" element={<VolunteerProfile />} />
      <Route path="/OrgDashboard" element={<OrgDashboard />} />
      <Route path="/create-event" element={<CreateEvent />} />
      <Route path="/volunteer-history" element={<VolunteerHistory />} />
>>>>>>> origin/main
    </Routes>
    </div>
  );
}

export default App;