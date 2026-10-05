import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LocationProvider, useLocation } from './contexts/LocationContext';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StatePage from './pages/location/StatePage';
import LgaPage from './pages/location/LgaPage';
import PpaPage from './pages/location/PpaPage';
import HomePage from './pages/HomePage';
import AccommodationDetailPage from './pages/AccommodationDetailPage';
import SavedPage from './pages/SavedPage';
import LocalGuidePage from './pages/LocalGuidePage';
import ReportPage from './pages/ReportPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';

function Protected({ requireLocation = false, requireAdmin = false, children }) {
  const { token, isLoading, isAdmin } = useAuth();
  const { state, lga, isReady } = useLocation();

  if (isLoading || !isReady) return <div style={{padding:40}}>Loading…</div>;
  if (!token) return <Navigate to="/login" replace />;
  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />;
  if (requireLocation && (!state || !lga)) return <Navigate to="/onboarding/state" replace />;
  return children;
}

function AppShell() {
  return (
    <div style={{padding:20}}>
      <nav style={{display:'flex', gap:12, marginBottom:20}}>
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

            {/* Onboarding — needs auth, not location */}
            <Route path="/onboarding/state" element={<Protected><StatePage /></Protected>} />
            <Route path="/onboarding/lga" element={<Protected><LgaPage /></Protected>} />
            <Route path="/onboarding/ppa" element={<Protected><PpaPage /></Protected>} />

            {/* App shell */}
            <Route element={<AppShell />}>
              <Route path="/" element={<Protected requireLocation><HomePage /></Protected>} />
              <Route path="/accommodations/:id" element={<Protected requireLocation><AccommodationDetailPage /></Protected>} />
              <Route path="/saved" element={<Protected requireLocation><SavedPage /></Protected>} />
              <Route path="/guide" element={<Protected requireLocation><LocalGuidePage /></Protected>} />
              <Route path="/report" element={<Protected requireLocation><ReportPage /></Protected>} />
              <Route path="/admin/reports" element={<Protected requireLocation requireAdmin><AdminReportsPage /></Protected>} />
            </Route>

            <Route path="*" element={<div style={{padding:40}}>404 — no route for {window.location.pathname}</div>} />
          </Routes>
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}