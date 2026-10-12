import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ListingSubmissionForm from "../components/ListingSubmissionForm";

export default function LandlordSubmitPage() {
  const { user, loading } = useAuth();

  if (loading) return <div className="screen-state">Loading…</div>;
  if (!user) return <Navigate to="/onboarding" replace />;
  if (user.role !== "landlord" && user.role !== "agent") {
    return <Navigate to="/home" replace />;
  }

  return (
    <main className="page">
      <header className="page-head">
        <h1>Submit a Listing</h1>
        <p>All submissions are reviewed by an admin before publication.</p>
      </header>
      <ListingSubmissionForm />
    </main>
  );
}