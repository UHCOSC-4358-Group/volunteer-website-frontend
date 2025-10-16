// import SignIn from "./pages-amare/SignIn";
import VolunteerProfile from "./components/VolunteerProfile";
import SignIn from "./components/SignIn";
// @ts-ignore
import OrgDashboard from "./components/dashboard";
// @ts-ignore
import VolunteerHistory from "./components/volunteerHistory";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="/volunteer-profile" element={<VolunteerProfile />} />
      <Route path="/OrgDashboard" element={<OrgDashboard />} />
      <Route path="/volunteer-history" element={<VolunteerHistory />} />
    </Routes>
  );
}

export default App;
