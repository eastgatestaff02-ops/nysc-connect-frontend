import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LocationProvider } from "./contexts/LocationContext";
import AppRoutes from "./routes/AppRoutes";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <LocationProvider>
        <AppRoutes />
      </LocationProvider>
    </AuthProvider>
  </BrowserRouter>
);