import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email.includes('@')) return setError('Enter a valid email');
    if (form.password.length < 8) return setError('Password must be at least 8 characters');
    try {
      setLoading(true);
      await login(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="auth-form">
      <h1>Log in</h1>
      <input type="email" placeholder="Email"
        value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
      <input type="password" placeholder="Password"
        value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
      {error && <p className="error-text">{error}</p>}
      <button disabled={loading}>{loading ? 'Logging in…' : 'Log in'}</button>
      <p>No account? <Link to="/register">Register</Link></p>
    </form>
  );
}