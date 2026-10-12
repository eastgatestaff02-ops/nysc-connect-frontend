import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  uploadVerificationDocument,
  submitVerification,
} from "../../services/verificationService";
import { LoadingState } from "../../components/ScreenStates";

const ID_TYPES = [
  { value: "nin", label: "NIN" },
  { value: "pvc", label: "PVC" },
  { value: "drivers_license", label: "Driver's License" },
  { value: "passport", label: "Passport" },
];

const AUTHORITY_TYPES = [
  { value: "authorization_letter", label: "Authorization letter" },
  { value: "agency_registration", label: "Agency registration" },
];

export default function VerificationPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [idType, setIdType] = useState("nin");
  const [idFile, setIdFile] = useState(null);
  const [authorityType, setAuthorityType] = useState("authorization_letter");
  const [authorityFile, setAuthorityFile] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (authLoading) return <LoadingState />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "landlord" && user.role !== "agent")
    return <Navigate to="/" replace />;

  const status = user.account_verification?.status || "not_submitted";
  const reason = user.account_verification?.rejection_reason;

  if (status === "verified") {
    return (
      <div className="page">
        <div className="verification-card verified">
          <div className="vc-icon">✅</div>
          <h2>Account verified</h2>
          <p>You can now submit accommodation listings.</p>
        </div>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="page">
        <div className="verification-card pending">
          <div className="vc-icon">⏳</div>
          <h2>Verification under review</h2>
          <p>
            Submitted on{" "}
            {user.account_verification?.submitted_at
              ? new Date(user.account_verification.submitted_at).toLocaleDateString()
              : "—"}
            .
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const idUpload = await uploadVerificationDocument(idFile);
      const authorityUpload = await uploadVerificationDocument(authorityFile);

      await submitVerification({
        id_type: idType,
        id_document_url: idUpload.url,
        authority_type: authorityType,
        authority_document_url: authorityUpload.url,
        zero_upfront_fee_agreed: agreed,
      });

      window.location.reload();
    } catch (e) {
      setError(e.response?.data?.message || "Could not submit documents");
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = idFile && authorityFile && agreed && !submitting;

  return (
    <div className="page">
      <h1>Verify your account</h1>
      <p className="page-sub">
        We verify every landlord and agent before allowing listings.
      </p>

      {status === "rejected" && reason && (
        <div className="rejection-banner">
          <strong>Previous submission rejected:</strong> {reason}
        </div>
      )}

      <div className="field">
        <label>ID type</label>
        <select value={idType} onChange={(e) => setIdType(e.target.value)}>
          {ID_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>Upload ID document</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setIdFile(e.target.files?.[0] || null)}
        />
      </div>

      <div className="field">
        <label>Authority type</label>
        <select
          value={authorityType}
          onChange={(e) => setAuthorityType(e.target.value)}
        >
          {AUTHORITY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>Upload authority document</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setAuthorityFile(e.target.files?.[0] || null)}
        />
      </div>

      <div className="field">
        <label>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />{" "}
          I confirm there is no upfront fee charged to Corps Members
        </label>
      </div>

      {error && <div className="field-error">{error}</div>}

      <button
        className="btn btn-primary btn-block"
        disabled={!canSubmit}
        onClick={handleSubmit}
      >
        {submitting ? "Submitting…" : "Submit for verification"}
      </button>
    </div>
  );
}