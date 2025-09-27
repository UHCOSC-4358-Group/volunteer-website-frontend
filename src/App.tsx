// import SignIn from "./pages-amare/SignIn";
import VolunteerProfile from "./pages-js30/VolunteerProfile";
import SignIn from "./pages-amare/SignIn";
// @ts-ignore
import OrgDashboard from "./components/dashboard";
// @ts-ignore
import VolunteerHistory from "./components/volunteerHistory";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<OrgDashboard />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/volunteer" element={<VolunteerProfile />} />
      <Route path="/volunteer/history" element={<VolunteerHistory />} />
    </Routes>
  );
}

export default App;
