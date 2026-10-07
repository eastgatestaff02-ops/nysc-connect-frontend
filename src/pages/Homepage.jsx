import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient, { unwrap } from '../services/apiClient';
import { useLocation } from '../contexts/LocationContext';
import { LoadingState, ErrorState, EmptyState, OfflineBanner } from '../components/ScreenStates';

export default function HomePage() {
  const { state, lga } = useLocation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const r = await apiClient.get('/accommodations', {
        params: { state, lga, page: 1, limit: 10 },
      });
      setItems(unwrap(r).accommodations ?? []);
    } catch (e) {
      setError(e.response?.data?.message || 'Could not load listings');
    } finally {
      setLoading(false);
    }
  }, [state, lga]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      {!navigator.onLine && <OfflineBanner />}
      <h2>Listings in {lga}, {state}</h2>
      {items.length === 0 ? <EmptyState message="No listings in your area yet." /> : (
        <ul className="listing-grid">
          {items.map((a) => (
            <li key={a._id} className="listing-card">
              <Link to={`/accommodations/${a._id}`}>
                <h3>{a.title}</h3>
                <p>₦{a.price.toLocaleString()} · {a.lga}</p>
                <p className="muted">{a.ppa_proximity}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}