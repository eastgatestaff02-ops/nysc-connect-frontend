import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient, { unwrap } from '../services/apiClient';
import { LoadingState, ErrorState } from '../components/ScreenStates';

export default function AccommodationDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiClient.get(`/accommodations/${id}`)
      .then((r) => setItem(unwrap(r).accommodation))
      .catch((e) => setError(e.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  const onSave = async () => {
    try {
      setSaving(true);
      await apiClient.post('/saved', { accommodation_id: id });
      setSaved(true);
    } catch (e) {
      alert(e.response?.data?.message || 'Could not save');
    } finally { setSaving(false); }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <article className="detail">
      <h1>{item.title}</h1>
      <p>{item.address}</p>
      <p>₦{item.price.toLocaleString()} · Caution ₦{item.caution_fee?.toLocaleString()}</p>
      <p className="muted">{item.ppa_proximity}</p>
      <p>{item.description}</p>
      <p>Contact: {item.contact_phone}</p>
      <p>WhatsApp: {item.contact_whatsapp}</p>
      <p>Source: {item.source}</p>
      <button onClick={onSave} disabled={saving || saved}>
        {saved ? 'Saved ✓' : saving ? 'Saving…' : 'Save to Favourites'}
      </button>
      <Link to="/report" state={{ targetType: 'accommodation', targetId: id }}>Report this listing</Link>
    </article>
  );
}