import React, { useState } from 'react';
import { useNavigate, useLocation as useRouterLocation, Navigate } from 'react-router-dom';
import apiClient from '../services/apiClient';

const REASONS = [
  { label: 'Outdated', value: 'outdated' },
  { label: 'Incorrect', value: 'incorrect' },
  { label: 'Misleading', value: 'misleading' },
  { label: 'Suspicious', value: 'suspicious' },
  { label: 'Scam', value: 'scam' },
];

export default function ReportPage() {
  const routerLoc = useRouterLocation();
  const targetType = routerLoc.state?.targetType;
  const targetId = routerLoc.state?.targetId;
  const [reason, setReason] = useState(REASONS[0].value);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  if (!targetType || !targetId) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await apiClient.post('/reports', { target_type: targetType, target_id: targetId, reason, details });
      alert('Report submitted. Thank you.');
      navigate(-1);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not submit report');
    } finally { setSubmitting(false); }
  };

  return (
    <form onSubmit={submit}>
      <h2>Report this {targetType}</h2>
      {REASONS.map((r) => (
        <label key={r.value} className="radio-row">
          <input type="radio" name="reason" value={r.value}
            checked={reason === r.value} onChange={() => setReason(r.value)} />
          {r.label}
        </label>
      ))}
      <textarea placeholder="Additional details (optional)"
        value={details} onChange={(e) => setDetails(e.target.value)} />
      <button disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Report'}</button>
    </form>
  );
}