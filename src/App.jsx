import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/dashboard.jsx';
import VolunteerHistory from './components/volunteerHistory.jsx';

function App() {
    return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/volunteer-history" element={<VolunteerHistory />} />
      </Routes>
    </Router>
    ); // Fix: removed extra }
}

export default App;