import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient, { unwrap } from '../../services/apiClient';
import { LoadingState, ErrorState } from '../../components/ScreenStates';

export default function StatePage() {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true); setError(null);
    apiClient.get('/locations/states')
      .then((r) => setStates(unwrap(r).states ?? []))
      .catch((e) => setError(e.response?.data?.message || 'Failed to load states'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="selection">
      <h2>Select your State</h2>
      <ul>
        {states.map((s) => (
          <li key={s}>
            <button onClick={() => navigate('/onboarding/lga', { state: { state: s } })}>{s}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}