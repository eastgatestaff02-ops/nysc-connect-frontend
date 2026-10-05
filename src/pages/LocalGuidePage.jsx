import React, { useEffect, useState } from 'react';
import apiClient, { unwrap } from '../services/apiClient';
import { useLocation } from '../contexts/LocationContext';
import { LoadingState, EmptyState } from '../components/ScreenStates';

const CATEGORIES = ['transport', 'health', 'security'];

export default function LocalGuidePage() {
  const { state, lga } = useLocation();
  const [category, setCategory] = useState('transport');
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiClient.get('/local-info', { params: { state, lga, category } })
      .then((r) => setGuides(unwrap(r).guides ?? []))
      .finally(() => setLoading(false));
  }, [state, lga, category]);

  return (
    <div>
      <div className="tabs">
        {CATEGORIES.map((c) => (
          <button key={c} className={c === category ? 'active' : ''} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>
      {loading ? <LoadingState /> :
        guides.length === 0 ? <EmptyState message={`No ${category} tips for ${lga} yet.`} /> :
        <ul>{guides.map((g) => (
          <li key={g._id}>
            <h3>{g.title}</h3>
            <p>{g.content}</p>
          </li>
        ))}</ul>
      }
    </div>
  );
}