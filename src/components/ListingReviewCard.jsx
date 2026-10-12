import { useState } from "react";

export default function ListingReviewCard({
  listing,
  onApprove,
  onReject,
  onReturn,
}) {
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  return (
    <div className="review-card">
      <div className="review-head">
        <div className="review-info">
          <div className="review-title">{listing.title}</div>
          <div className="review-meta">
            {listing.lga}, {listing.state} · ₦
            {listing.price?.toLocaleString?.() ?? listing.price}
          </div>
          <div className="review-meta">
            Source: {listing.source} · Submitted{" "}
            {listing.submitted_at
              ? new Date(listing.submitted_at).toLocaleDateString()
              : "—"}
          </div>
        </div>
        <span className="badge badge-pending">Pending</span>
      </div>

      <p className="review-desc">{listing.description}</p>

      {showNotes && (
        <textarea
          className="review-notes"
          rows={2}
          placeholder="Reason (required for return or reject)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      )}

      <div className="review-actions">
        <button
          className="btn btn-outline btn-sm"
          onClick={() => onApprove(listing._id)}
        >
          Approve
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() =>
            showNotes ? onReturn(listing._id, notes) : setShowNotes(true)
          }
        >
          Return for edits
        </button>
        <button
          className="btn btn-danger btn-sm"
          onClick={() =>
            showNotes ? onReject(listing._id, notes) : setShowNotes(true)
          }
        >
          Reject
        </button>
      </div>
    </div>
  );
}