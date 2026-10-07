import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useLocation as useUserLocation } from "../contexts/LocationContext";

import LoginPage from "../pages/LoginPage";                    // ✅ PascalCase
import RegisterPage from "../pages/RegisterPage";              // ✅ PascalCase
import StatePage from "../pages/Location/StatePage";           // ✅ Location (capital L)
import LgaPage from "../pages/Location/LgaPage";               // ✅
import PpaPage from "../pages/Location/PpaPage";               // ✅
import HomePage from "../pages/HomePage";                      // ✅
import AccommodationDetailPage from "../pages/AccommodationDetailPage"; // ✅
import SavedPage from "../pages/SavedPage";                    // ✅
import LocalGuidePage from "../pages/LocalGuidePage";          // ✅
import ReportPage from "../pages/ReportPage";                  // ✅
import AdminReportsPage from "../pages/admin/AdminReportsPage"; // ⚠️ lowercase "admin"

function Protected({ requireLocation = false, requireAdmin = false }) {
  const { token, isLoading, isAdmin } = useAuth();
  const { state, lga, isReady } = useUserLocation();

  if (isLoading) return <div style={{ padding: 40 }}>Loading…</div>;
  // if (!token)
//   return <Navigate to="/login" replace />;
  if (!token) return <Navigate to="/login" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />;
  if (requireLocation && (!state || !lga)) return <Navigate to="/onboarding/state" replace />;
  return <Outlet />;
}

function Shell() {
  return (
    <div>
      <nav style={{ display: "flex", gap: 12, padding: 16, borderBottom: "1px solid #eee", background: "#fff" }}>
        <a href="/">Home</a>
        <a href="/saved">Saved</a>
        <a href="/guide">Guide</a>
        <a href="/admin/reports">Admin</a>
        <a href="/login">Login</a>
      </nav>
      <main style={{ maxWidth: 960, margin: "0 auto", padding: 20 }}>
        <Outlet />
      </main>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Onboarding — needs auth, not location */}
      <Route element={<Protected />}>
        <Route path="/onboarding/state" element={<StatePage />} />
        <Route path="/onboarding/lga" element={<LgaPage />} />
        <Route path="/onboarding/ppa" element={<PpaPage />} />
      </Route>

      {/* Authed shell with location required */}
      <Route element={<Protected requireLocation />}>
        <Route element={<Shell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/accommodations/:id" element={<AccommodationDetailPage />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="/guide" element={<LocalGuidePage />} />
          <Route path="/report" element={<ReportPage />} />
        </Route>
      </Route>

      {/* Admin only */}
      <Route element={<Protected requireLocation requireAdmin />}>
        <Route element={<Shell />}>
          <Route path="/admin/reports" element={<AdminReportsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<div style={{ padding: 40 }}>404 — {window.location.pathname}</div>} />
    </Routes>
  );
}