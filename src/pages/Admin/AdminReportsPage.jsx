import React, { useCallback, useEffect, useState } from 'react';
import apiClient, { unwrap } from '../../services/apiClient';
import { LoadingState, EmptyState } from '../../components/ScreenStates';

const FILTERS = ['pending', 'reviewed', 'resolved', 'dismissed', 'all'];

export default function AdminReportsPage() {
  const [status, setStatus] = useState('pending');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await apiClient.get('/admin/reports', { params: { status, page: 1, limit: 20 } });
      setReports(unwrap(r).reports ?? []);
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to load');
    } finally { setLoading(false); }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const moderate = async (id, action) => {
    try {
      await apiClient.patch(`/admin/reports/${id}`, {
        status: action,
        admin_action: action,
        admin_notes: '',
        hide_target: action === 'resolved',
      });
      setReports((prev) => prev.filter((r) => r._id !== id));
    } catch (e) {
      alert(e.response?.data?.message || 'Moderation failed');
    }
  };

  return (
    <div>
      <div className="tabs">
        {FILTERS.map((f) => (
          <button key={f} className={f === status ? 'active' : ''} onClick={() => setStatus(f)}>{f}</button>
        ))}
      </div>
      {loading ? <LoadingState /> :
        reports.length === 0 ? <EmptyState message={`No ${status} reports.`} /> :
        <ul>{reports.map((r) => (
          <li key={r._id} className="report-row">
            <strong>{r.target_type} · {r.reason}</strong>
            <p>Reporter: {r.reporter_id?.name} ({r.reporter_id?.phone})</p>
            <p>Target: {r.target_id}</p>
            {r.details && <p className="muted">{r.details}</p>}
            <small>{new Date(r.created_at).toLocaleString()}</small>
            <div className="actions">
              <button onClick={() => moderate(r._id, 'resolved')}>Resolve</button>
              <button onClick={() => moderate(r._id, 'dismissed')}>Dismiss</button>
            </div>
          </li>
        ))}</ul>
      }
    </div>
  );
}