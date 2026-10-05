import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const { state, lga } = useLocation();
  const navigate = useNavigate();

  const onLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="app-shell">
      <header className="app-header">
        <strong>NYSC Connect</strong>
        <span className="loc">{lga}, {state}</span>
        <nav>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/saved">Saved</NavLink>
          <NavLink to="/guide">Guide</NavLink>
          {isAdmin && <NavLink to="/admin/reports">Admin</NavLink>}
        </nav>
        <button onClick={onLogout}>Log out ({user?.name})</button>
      </header>
      <main><Outlet /></main>
    </div>
  );
}