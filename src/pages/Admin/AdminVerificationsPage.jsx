import React, { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  getPendingVerifications,
  moderateVerification,
} from "../../services/verificationService";
import { LoadingState, ErrorState, EmptyState } from "../../components/ScreenStates";

export default function AdminVerificationsPage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPendingVerifications("pending");
      setItems(data.results ?? []);
    } catch (e) {
      setError(e.response?.data?.message || "Could not load verifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (isAdmin) load();
  }, [authLoading, isAdmin, load]);

  const approve = async (userId) => {
    await moderateVerification(userId, { status: "verified" });
    load();
  };

  const reject = async (userId, reason) => {
    await moderateVerification(userId, {
      status: "rejected",
      rejection_reason: reason,
    });
    load();
  };

  if (authLoading) return <LoadingState />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (items.length === 0)
    return <EmptyState message="No pending verifications." />;

  return (
    <div className="page">
      <h1>Pending Verifications</h1>
      <ul className="verification-list">
        {items.map((v) => {
          const av = v.account_verification || {};
          return (
            <li key={v.id} className="verification-item">
              <div className="vi-head">
                <div>
                  <div className="vi-name">{v.name}</div>
                  <div className="vi-role">
                    {v.role} · {v.phone} · {v.lga}, {v.state}
                  </div>
                </div>
                <span className="vi-badge">Pending</span>
              </div>

              <div className="vi-docs">
                {av.id_document_url && (
                  <a
                    href={av.id_document_url}
                    target="_blank"
                    rel="noreferrer"
                    className="doc-link"
                  >
                    ID — {av.id_type}
                  </a>
                )}
                {av.authority_document_url && (
                  <a
                    href={av.authority_document_url}
                    target="_blank"
                    rel="noreferrer"
                    className="doc-link"
                  >
                    Authority — {av.authority_type}
                  </a>
                )}
              </div>

              <div className="vi-actions">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => approve(v.id)}
                >
                  Approve
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    const reason = window.prompt("Rejection reason (required):");
                    if (reason && reason.trim()) reject(v.id, reason.trim());
                  }}
                >
                  Reject
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}