import { Link } from "react-router-dom";

export default function VerificationGate({ status, reason }) {
  if (status === "pending") {
    return (
      <div className="verification-gate">
        <div className="vg-icon">⏳</div>
        <h3>Verification under review</h3>
        <p>
          We received your documents and are reviewing them. You will be able
          to submit listings once your account is verified.
        </p>
        <Link to="/landlord/verify" className="btn btn-secondary">
          View submission status
        </Link>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="verification-gate verification-gate-rejected">
        <div className="vg-icon">⚠️</div>
        <h3>Verification rejected</h3>
        <p>{reason || "Your documents were not accepted. Please review and resubmit."}</p>
        <Link to="/landlord/verify" className="btn btn-primary">
          Resubmit documents
        </Link>
      </div>
    );
  }

  return (
    <div className="verification-gate">
      <div className="vg-icon">🔒</div>
      <h3>Verify your account to submit listings</h3>
      <p>
        We require proof of ownership or a utility bill before a listing can be
        submitted. This protects Corps Members from fraud.
      </p>
      <Link to="/landlord/verify" className="btn btn-primary">
        Start verification
      </Link>
    </div>
  );
}