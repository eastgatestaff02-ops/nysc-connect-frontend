import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient, { unwrap } from '../services/apiClient';
import { LoadingState, EmptyState } from '../components/ScreenStates';

export default function SavedPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/saved')
      .then((r) => {
        const raw = unwrap(r).saved_items;
        setItems(Array.isArray(raw) ? raw : raw ? [raw] : []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (!items.length) return <EmptyState message="No saved listings yet." />;

  return (
    <ul>
      {items.map((s) => (
        <li key={s._id}>
          <Link to={`/accommodations/${s.accommodation._id}`}>
            {s.accommodation.title} — ₦{s.accommodation.price.toLocaleString()}
          </Link>
        </li>
      ))}
    </ul>
  );
}