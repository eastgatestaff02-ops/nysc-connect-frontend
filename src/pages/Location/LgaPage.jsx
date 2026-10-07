import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation as useRouterLocation, Navigate } from 'react-router-dom';
import apiClient, { unwrap } from '../../services/apiClient';
import { LoadingState, ErrorState } from '../../components/ScreenStates';

export default function LgaPage() {
  const { state: routerState } = useRouterLocation();
  const state = routerState?.state;
  const [lgas, setLgas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  if (!state) return <Navigate to="/onboarding/state" replace />;

  const load = () => {
    setLoading(true); setError(null);
    apiClient.get('/locations/lgas', { params: { state } })
      .then((r) => setLgas(unwrap(r).lgas ?? []))
      .catch((e) => setError(e.response?.data?.message || 'Failed to load LGAs'))
      .finally(() => setLoading(false));
  };
  useEffect(load, [state]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="selection">
      <h2>{state} — select your LGA</h2>
      <ul>
        {lgas.map((l) => (
          <li key={l}>
            <button onClick={() => navigate('/onboarding/ppa', { state: { state, lga: l } })}>{l}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}