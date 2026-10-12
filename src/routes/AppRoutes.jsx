import { Routes, Route, Navigate, Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useUserLocation } from "../contexts/LocationContext";

import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import StatePage from "../pages/Location/StatePage";
import LgaPage from "../pages/Location/LgaPage";
import PpaPage from "../pages/Location/PpaPage";
import HomePage from "../pages/HomePage";
import AccommodationDetailPage from "../pages/AccommodationDetailPage";
import SavedPage from "../pages/SavedPage";
import LocalGuidePage from "../pages/LocalGuidePage";
import ReportPage from "../pages/ReportPage";
import AdminReportsPage from "../pages/Admin/AdminReportsPage";
import AdminListingsPage from "../pages/Admin/AdminListingsPage";
import LandlordSubmitPage from "../pages/LandlordSubmitPage";
import NotFoundPage from "../pages/NotFoundPage";
import VerificationPage from "../pages/landlord/VerificationPage";
import LandlordSubmissionsPage from "../pages/LandlordSubmissionsPage";
import AdminVerificationsPage from "../pages/Admin/AdminVerificationsPage";

function Protected({ requireLocation = false, requireAdmin = false }) {
  const { user, token, isLoading } = useAuth();
  const { location } = useUserLocation();

  const state = location?.state;
  const lga = location?.lga;
  const isAdmin = user?.role === "admin" || user?.role === "ADMIN";

  if (isLoading) return <div style={{ padding: 40 }}>Loading…</div>;
  if (!token) return <Navigate to="/login" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />;
  if (requireLocation && (!state || !lga))
    return <Navigate to="/onboarding/state" replace />;

  return <Outlet />;
}

function Shell() {
  return (
    <div>
      <nav
        style={{
          display: "flex",
          gap: 12,
          padding: 16,
          borderBottom: "1px solid #eee",
          background: "#fff",
        }}
      >
        <NavLink to="/">Home</NavLink>
        <NavLink to="/saved">Saved</NavLink>
        <NavLink to="/guide">Guide</NavLink>
        <NavLink to="/admin/reports">Admin</NavLink>
        <NavLink to="/login">Login</NavLink>
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

      {/* Onboarding — authenticated, location NOT required yet */}
      <Route path="/onboarding" element={<Protected />}>
        <Route path="state" element={<StatePage />} />
        <Route path="lga" element={<LgaPage />} />
        <Route path="ppa" element={<PpaPage />} />
      </Route>

      {/* Authed shell with location required */}
      <Route element={<Protected requireLocation />}>
        <Route element={<Shell />}>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/accommodations/:id"
            element={<AccommodationDetailPage />}
          />
          <Route path="/saved" element={<SavedPage />} />

          {/* Local Guide — list + per-category */}
          <Route path="/guide" element={<LocalGuidePage />} />
          <Route path="/guide/:category" element={<LocalGuidePage />} />

          <Route path="/report" element={<ReportPage />} />
        </Route>
      </Route>

      {/* Landlord / Agent — authenticated, location NOT required */}
      <Route element={<Protected />}>
        <Route element={<Shell />}>
          <Route path="/landlord/submit" element={<LandlordSubmitPage />} />
          <Route path="/landlord/verify" element={<VerificationPage />} />
          <Route
            path="/landlord/submissions"
            element={<LandlordSubmissionsPage />}
          />
        </Route>
      </Route>

      {/* Admin only — location NOT required */}
      <Route element={<Protected requireAdmin />}>
        <Route element={<Shell />}>
          <Route path="/admin/reports" element={<AdminReportsPage />} />
          <Route path="/admin/listings" element={<AdminListingsPage />} />
          <Route
            path="/admin/verifications"
            element={<AdminVerificationsPage />}
          />
        </Route>
      </Route>

      {/* 404 — inside the shell so nav stays visible */}
      <Route element={<Shell />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}