import React, { useState } from "react";
import { useNavigate, useLocation as useRouterLocation, Navigate } from "react-router-dom";
import { useUserLocation } from "../../contexts/LocationContext";

export default function PpaPage() {
  const routerLoc = useRouterLocation();
  const state = routerLoc.state?.state;
  const lga = routerLoc.state?.lga;

  const { location, saveLocation } = useUserLocation();
  const [ppa, setPpa] = useState(location?.ppa || "");
  const navigate = useNavigate();

  if (!state || !lga) return <Navigate to="/onboarding/state" replace />;

  const finish = (value) => {
    saveLocation({ state, lga, ppa: value || null });
    navigate("/", { replace: true });
  };

  return (
    <div className="selection">
      <h2>Where is your PPA? (optional)</h2>
      <input
        placeholder="e.g. State Secretariat, Ikeja"
        value={ppa}
        onChange={(e) => setPpa(e.target.value)}
      />
      <button disabled={!ppa.trim()} onClick={() => finish(ppa.trim())}>
        Confirm PPA
      </button>
      <button onClick={() => finish(null)}>Skip for now</button>
    </div>
  );
}