import React, { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  getPendingListings,
  moderateListing,
} from "../../services/listingService";
import { LoadingState, ErrorState, EmptyState } from "../../components/ScreenStates";

export default function AdminListingsPage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPendingListings("pending");
      setItems(data.results ?? data.accommodations ?? []);
    } catch (e) {
      setError(e.response?.data?.message || "Could not load listings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (isAdmin) load();
  }, [authLoading, isAdmin, load]);

  const approve = async (id) => {
    await moderateListing(id, "verified");
    load();
  };

  const reject = async (id) => {
    await moderateListing(id, "rejected");
    load();
  };

  if (authLoading) return <LoadingState />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (items.length === 0)
    return <EmptyState message="No pending listings." />;

  return (
    <div className="page">
      <h1>Pending Listings</h1>
      <ul className="submission-list">
        {items.map((l) => (
          <li key={l._id} className="submission-item">
            <div className="si-head">
              <div className="si-info">
                <div className="si-title">{l.title}</div>
                <div className="si-meta">
                  {l.lga}, {l.state} · ₦{Number(l.price).toLocaleString()}
                </div>
              </div>
              <span className="si-badge" style={{ color: "#b45309", background: "#fef3c7" }}>
                Pending
              </span>
            </div>

            <div className="vi-actions">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => approve(l._id)}
              >
                Approve
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => reject(l._id)}
              >
                Reject
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}