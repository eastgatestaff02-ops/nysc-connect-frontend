import React, { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import apiClient, { unwrap } from "../services/apiClient";
import { useUserLocation } from "../contexts/LocationContext";
import { useAuth } from "../contexts/AuthContext";
import {
  LoadingState,
  ErrorState,
  EmptyState,
  OfflineBanner,
} from "../components/ScreenStates";

const FUNCTIONS = [
  {
    id: "accommodation",
    icon: "🏠",
    label: "Find Accommodation",
    desc: "Verified lodges near your PPA",
    to: "/accommodations",
  },
  {
    id: "guide",
    icon: "📍",
    label: "Local Guide",
    desc: "Transport, health, safety",
    to: "/guide",
  },
  {
    id: "saved",
    icon: "🔖",
    label: "Saved Items",
    desc: "Your bookmarked listings",
    to: "/saved",
  },
  {
    id: "report",
    icon: "🚩",
    label: "Report",
    desc: "Flag suspicious listings",
    to: "/report",
  },
];

const GUIDE_CATEGORIES = [
  { id: "transport", icon: "🚌", label: "Transportation", desc: "Keke routes and daily fares" },
  { id: "ppa",       icon: "🏢", label: "PPA Information", desc: "Where your PPA is and what to expect" },
  { id: "health",    icon: "🏥", label: "Healthcare", desc: "Hospitals and clinics near you" },
  { id: "security",  icon: "🛡️", label: "Security & Safety", desc: "Safe areas and emergency contacts" },
  { id: "food",      icon: "🍲", label: "Food & Everyday Services", desc: "Markets, vendors, laundry" },
  { id: "essential", icon: "🛒", label: "Essential Services", desc: "Pharmacies, banks, transport hubs" },
];

export default function HomePage() {
  const { location } = useUserLocation();
  const state = location?.state;
  const lga = location?.lga;
  const ppa = location?.ppa;

  const { user } = useAuth();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!state || !lga) return;
    setLoading(true);
    setError(null);
    try {
      const r = await apiClient.get("/accommodations", {
        params: { state, lga, page: 1, limit: 4 },
      });
      setListings(unwrap(r).accommodations ?? []);
    } catch (e) {
      setError(e.response?.data?.message || "Could not load listings");
    } finally {
      setLoading(false);
    }
  }, [state, lga]);

  useEffect(() => {
    load();
  }, [load]);

  if (!state || !lga) return <Navigate to="/onboarding/state" replace />;
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const firstName = user?.name?.split(" ")[0] || "Corps Member";

  return (
    <div>
      {!navigator.onLine && <OfflineBanner />}

      {/* Hero */}
      <header className="home-hero">
        <p className="home-greet">Welcome,</p>
        <h1 className="home-name">{firstName} 👋</h1>
        <p className="home-deploy">
          📍 {lga}, {state} State
          {ppa ? ` · PPA: ${ppa}` : ""}
        </p>
      </header>

      {/* Function cards */}
      <div className="home-functions">
        {FUNCTIONS.map((f) => (
          <Link key={f.id} to={f.to} className="home-function">
            <div className="home-function-icon">{f.icon}</div>
            <div className="home-function-label">{f.label}</div>
            <div className="home-function-desc">{f.desc}</div>
          </Link>
        ))}
      </div>

      {/* Landlord/Agent tools */}
      {user?.role === "landlord" || user?.role === "agent" ? (
        <div className="home-role-links">
          <div className="home-section-title">
            <h2>Landlord tools</h2>
          </div>

          <Link to="/landlord/verify" className="home-role-row">
            <span>
              {user.verification_status === "verified"
                ? "✅ Account verified"
                : "🔒 Verify your account"}
            </span>
            <span>›</span>
          </Link>

          <Link to="/landlord/submissions" className="home-role-row">
            <span>📋 My submissions</span>
            <span>›</span>
          </Link>

          <Link to="/landlord/submit" className="home-role-row">
            <span>➕ Submit a listing</span>
            <span>›</span>
          </Link>
        </div>
      ) : null}

      {/* Admin tools */}
      {user?.role === "admin" || user?.role === "ADMIN" ? (
        <div className="home-role-links">
          <div className="home-section-title">
            <h2>Admin tools</h2>
          </div>

          <Link to="/admin/reports" className="home-role-row">
            <span>🚩 Review reports</span>
            <span>›</span>
          </Link>

          <Link to="/admin/listings" className="home-role-row">
            <span>🏠 Review listings</span>
            <span>›</span>
          </Link>

          <Link to="/admin/verifications" className="home-role-row">
            <span>🛡️ Review verifications</span>
            <span>›</span>
          </Link>
        </div>
      ) : null}

      {/* Accommodation preview */}
      <div className="home-section-title">
        <h2>Accommodation near you</h2>
        <Link to="/accommodations">See all</Link>
      </div>

      {listings.length === 0 ? (
        <EmptyState message={`No listings in ${lga} yet.`} />
      ) : (
        <div className="home-listings">
          {listings.map((a) => (
            <Link key={a._id} to={`/accommodations/${a._id}`} className="home-listing">
              <div className="home-listing-title">{a.title}</div>
              <div className="home-listing-meta">
                <span>📍 {a.lga}</span>
                <span>🚶 {a.ppa_proximity || "—"}</span>
              </div>
              <div className="home-listing-bottom">
                <span className="home-listing-price">
                  ₦{a.price?.toLocaleString?.() ?? a.price}
                  <small>/year</small>
                </span>
                <span className="home-listing-source">
                  {a.source ? `Source: ${a.source}` : ""}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Guide preview */}
      <div className="home-section-title">
        <h2>Local information for {lga}</h2>
        <Link to="/guide">See all</Link>
      </div>

      <div className="home-guide-card">
        {GUIDE_CATEGORIES.map((c) => (
          <Link key={c.id} to={`/guide/${c.id}`} className="home-guide-row">
            <div className="home-guide-icon">{c.icon}</div>
            <div className="home-guide-info">
              <div className="home-guide-title">{c.label}</div>
              <div className="home-guide-desc">{c.desc}</div>
            </div>
            <span className="home-guide-chev">›</span>
          </Link>
        ))}
      </div>

      <div className="spacer" />
    </div>
  );
}