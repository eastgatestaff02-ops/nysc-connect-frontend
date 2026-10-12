import React, { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import apiClient, { unwrap } from "../services/apiClient";
import { LoadingState, ErrorState, EmptyState } from "../components/ScreenStates";

const STATUS = {
  pending: { label: "Pending Review", color: "#b45309", bg: "#fef3c7" },
  approved: { label: "Approved", color: "#047857", bg: "#d1fae5" },
  returned: { label: "Returned for edits", color: "#1d4ed8", bg: "#eff6ff" },
  rejected: { label: "Rejected", color: "#b91c1c", bg: "#fee2e2" },
};

export default function LandlordSubmissionsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get("/accommodations/mine");
      const data = unwrap(res);
      setItems(data.submissions ?? []);
    } catch (e) {
      setError(e.response?.data?.message || "Could not load your submissions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (user) load();
  }, [authLoading, user, load]);

  if (authLoading) return <LoadingState />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "landlord" && user.role !== "agent")
    return <Navigate to="/" replace />;
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="page">
      <div className="page-head">
        <h1>Your Submissions</h1>
        <p className="page-sub">All listings you have submitted for review.</p>
      </div>

      {user.verification_status !== "verified" && (
        <div className="info-banner">
          <span>Your account is {user.verification_status || "unverified"}.</span>
          <Link to="/landlord/verify">Complete verification →</Link>
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState message="You have not submitted any listings yet." />
      ) : (
        <ul className="submission-list">
          {items.map((s) => {
            const meta = STATUS[s.moderation_status] || STATUS.pending;
            return (
              <li key={s._id} className="submission-item">
                <div className="si-head">
                  <div className="si-info">
                    <div className="si-title">{s.title}</div>
                    <div className="si-meta">
                      {s.lga}, {s.state} · ₦{Number(s.price).toLocaleString()}
                    </div>
                    <div className="si-date">
                      Submitted{" "}
                      {s.submitted_at
                        ? new Date(s.submitted_at).toLocaleDateString()
                        : "—"}
                    </div>
                  </div>
                  <span
                    className="si-badge"
                    style={{ color: meta.color, background: meta.bg }}
                  >
                    {meta.label}
                  </span>
                </div>

                {s.review_notes && (
                  <div className="si-notes">
                    <strong>Admin review:</strong> {s.review_notes}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}