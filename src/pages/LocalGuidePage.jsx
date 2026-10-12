import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import apiClient, { unwrap } from "../services/apiClient";
import { useUserLocation } from "../contexts/LocationContext";
import { LoadingState, ErrorState, EmptyState } from "../components/ScreenStates";

/* ============================================================
   The six Local Guide categories required by the PRD.
   IDs match the backend contract: GET /local-info?category=<id>
   ============================================================ */
const GUIDE_CATEGORIES = [
  { id: "transport", icon: "🚌", label: "Transportation",           desc: "Keke routes and daily fares" },
  { id: "ppa",       icon: "🏢", label: "PPA Information",          desc: "Where your PPA is and what to expect" },
  { id: "health",    icon: "🏥", label: "Healthcare",               desc: "Hospitals and clinics near you" },
  { id: "security",  icon: "🛡️", label: "Security & Safety",        desc: "Safe areas and emergency contacts" },
  { id: "food",      icon: "🍲", label: "Food & Everyday Services",  desc: "Markets, vendors, laundry" },
  { id: "essential", icon: "🛒", label: "Essential Services",       desc: "Pharmacies, banks, transport hubs" },
];

const DEFAULT_CATEGORY = "transport";

export default function LocalGuidePage() {
  const { location } = useUserLocation();
  const { category: categoryParam } = useParams();
  const navigate = useNavigate();

  const state = location?.state;
  const lga = location?.lga;

  const [category, setCategory] = useState(categoryParam || DEFAULT_CATEGORY);
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ---------- Redirect to onboarding if location is missing ---------- */
  if (!state || !lga) return <Navigate to="/onboarding/state" replace />;

  /* ---------- Keep local state in sync when the URL changes ---------- */
  useEffect(() => {
    if (categoryParam && categoryParam !== category) {
      setCategory(categoryParam);
    }
  }, [categoryParam]);

  /* ---------- Keep the URL in sync when the user clicks a tab ---------- */
  useEffect(() => {
    if (category && category !== categoryParam) {
      navigate(`/guide/${category}`, { replace: true });
    }
  }, [category]);

  /* ---------- Fetch guides for the active category ---------- */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    apiClient
      .get("/local-info", { params: { state, lga, category } })
      .then((r) => {
        if (cancelled) return;
        setGuides(unwrap(r).guides ?? []);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e.response?.data?.message || "Could not load local info");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [state, lga, category]);

  const activeCategory = GUIDE_CATEGORIES.find((c) => c.id === category);

  return (
    <div className="page local-guide-page">
      <div className="page-head">
        <h1>Local Guide</h1>
        <p className="page-sub">
          Everything you need to settle into {lga}, {state}.
        </p>
      </div>

      {/* ---------- Category tabs ---------- */}
      <div className="tabs">
        {GUIDE_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`tab ${c.id === category ? "active" : ""}`}
            onClick={() => setCategory(c.id)}
          >
            <span className="tab-icon">{c.icon}</span>
            <span className="tab-label">{c.label}</span>
          </button>
        ))}
      </div>

      {/* ---------- Category description ---------- */}
      {activeCategory && (
        <p className="category-desc">{activeCategory.desc}</p>
      )}

      {/* ---------- Content ---------- */}
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState
          message={error}
          onRetry={() => {
            setError(null);
            setLoading(true);
            apiClient
              .get("/local-info", { params: { state, lga, category } })
              .then((r) => setGuides(unwrap(r).guides ?? []))
              .catch((e) =>
                setError(e.response?.data?.message || "Could not load local info")
              )
              .finally(() => setLoading(false));
          }}
        />
      ) : guides.length === 0 ? (
        <EmptyState
          message={`No ${activeCategory?.label || category} tips for ${lga} yet.`}
        />
      ) : (
        <ul className="guide-list">
          {guides.map((g) => (
            <li
              key={g._id || g.id}
              className="guide-item"
              onClick={() => navigate(`/guide/${category}/${g._id || g.id}`)}
            >
              <div className="guide-item-head">
                <h3>{g.title}</h3>
                <span className="chev">›</span>
              </div>
              <p>{g.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}