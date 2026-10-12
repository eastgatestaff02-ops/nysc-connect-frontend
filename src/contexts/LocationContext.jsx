import React, { createContext, useContext, useEffect, useState } from "react";
import apiClient from "../services/apiClient";

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /* ---------- Session rehydrate on mount ---------- */
  useEffect(() => {
    (async () => {
      try {
        const storedToken = localStorage.getItem("access_token");
        const storedUser = localStorage.getItem("user");
        const storedLocation = localStorage.getItem("user_location");

        if (storedToken) {
          setToken(storedToken);
          if (storedUser) setUser(JSON.parse(storedUser));
          if (storedLocation) setLocation(JSON.parse(storedLocation));

          const res = await apiClient.get("/auth/me");
          const fresh = res?.data?.data?.user ?? res?.data?.user ?? res?.user;
          if (fresh) {
            setUser(fresh);
            localStorage.setItem("user", JSON.stringify(fresh));
          }
        }
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        localStorage.removeItem("user_location");
        setToken(null);
        setUser(null);
        setLocation(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  /* ---------- Auth actions ---------- */
  const register = async (payload) => {
    const res = await apiClient.post("/auth/register", payload);
    const data = res?.data?.data ?? res?.data ?? res;
    localStorage.setItem("access_token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const login = async ({ email, password }) => {
    const res = await apiClient.post("/auth/login", { email, password });
    const data = res?.data?.data ?? res?.data ?? res;
    localStorage.setItem("access_token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_location");
    setToken(null);
    setUser(null);
    setLocation(null);
  };

  /* ---------- Location actions ---------- */
  const saveLocation = (loc) => {
    setLocation(loc);
    localStorage.setItem("user_location", JSON.stringify(loc));
  };

  const clearLocation = () => {
    setLocation(null);
    localStorage.removeItem("user_location");
  };

  const isAdmin = user?.role === "ADMIN" || user?.role === "admin";

  return (
    <LocationContext.Provider
      value={{
        user,
        token,
        location,
        isLoading,
        isAdmin,
        register,
        login,
        logout,
        saveLocation,
        clearLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useUserLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx)
    throw new Error("useUserLocation must be used within LocationProvider");
  return ctx;
}