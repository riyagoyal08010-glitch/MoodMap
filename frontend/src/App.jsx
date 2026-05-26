import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Onboarding from "./pages/Onboarding";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Journal from "./pages/Journal";
import Insights from "./pages/Insights";
import MoodBoard from "./pages/MoodBoard";
import Search from "./pages/Search";
import "./index.css";

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      // Try mm_user first
      const stored = localStorage.getItem("mm_user");
      if (stored) return JSON.parse(stored);
      // Fall back to first profile in mm_profiles
      const profiles = localStorage.getItem("mm_profiles");
      if (profiles) {
        const parsed = JSON.parse(profiles);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Also set mm_user_id so API calls work
          localStorage.setItem("mm_user_id", parsed[0].id);
          return parsed[0];
        }
      }
      return null;
    } catch { return null; }
  });

  const handleOnboardingComplete = (userData) => {
    localStorage.setItem("mm_user", JSON.stringify(userData));
    localStorage.setItem("mm_user_id", userData.id);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("mm_user");
    localStorage.removeItem("mm_user_id");
    setUser(null);
  };

  if (!user) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout user={user} onLogout={handleLogout} />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="journal"   element={<Journal />} />
          <Route path="insights"  element={<Insights />} />
          <Route path="moodboard" element={<MoodBoard />} />
          <Route path="search"    element={<Search />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}