import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LocationProvider, useLocation as useUserLocation } from './contexts/LocationContext';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StatePage from './pages/Location/StatePage';
import LgaPage from './pages/Location/LgaPage';
import PpaPage from './pages/Location/PpaPage';
import HomePage from './pages/HomePage';
import AccommodationDetailPage from './pages/AccommodationDetailPage';
import SavedPage from './pages/SavedPage';
import LocalGuidePage from './pages/LocalGuidePage';
import ReportPage from './pages/ReportPage';
import AdminReportsPage from './pages/Admin/AdminReportsPage';
import LandlordSubmitPage from './pages/LandlordSubmitPage';
import AdminListingsPage from './pages/Admin/AdminListingsPage';

function Protected({ requireLocation = false, requireAdmin = false }) {
  const { token, isLoading, isAdmin } = useAuth();
  const { state, lga } = useUserLocation();

  if (isLoading) return <div style={{ padding: 40 }}>Loading…</div>;
  if (!token) return <Navigate to="/login" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />;
  if (requireLocation && (!state || !lga))
    return <Navigate to="/onboarding/state" replace />;

  return <Outlet />;
}

function AppShell() {
  return (
    <div style={{ padding: 20 }}>
      <nav style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <a href="/">Home</a>
        <a href="/saved">Saved</a>
        <a href="/guide">Guide</a>
        <a href="/admin/reports">Admin</a>
        <a href="/login">Login</a>
        <a href="/onboarding/state">Onboarding</a>
      </nav>
      <Outlet />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LocationProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Onboarding — auth required, location NOT required */}
            <Route element={<Protected />}>
              <Route element={<AppShell />}>
                <Route path="/onboarding/state" element={<StatePage />} />
                <Route path="/onboarding/lga" element={<LgaPage />} />
                <Route path="/onboarding/ppa" element={<PpaPage />} />
              </Route>
            </Route>

            {/* Main app — auth + location required */}
            <Route element={<Protected requireLocation />}>
              <Route element={<AppShell />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/accommodations/:id" element={<AccommodationDetailPage />} />
                <Route path="/saved" element={<SavedPage />} />
                <Route path="/guide" element={<LocalGuidePage />} />
                <Route path="/report" element={<ReportPage />} />
              </Route>
            </Route>

            {/* Landlord / Agent — auth required, location NOT required */}
            <Route element={<Protected />}>
              <Route element={<AppShell />}>
                <Route path="/landlord/submit" element={<LandlordSubmitPage />} />
              </Route>
            </Route>

            {/* Admin — auth + location + admin role required */}
            <Route element={<Protected requireLocation requireAdmin />}>
              <Route element={<AppShell />}>
                <Route path="/admin/reports" element={<AdminReportsPage />} />
                <Route path="/admin/listings" element={<AdminListingsPage />} />
              </Route>
            </Route>

            <Route
              path="*"
              element={
                <div style={{ padding: 40 }}>
                  404 — no route for {window.location.pathname}
                </div>
              }
            />
          </Routes>
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}