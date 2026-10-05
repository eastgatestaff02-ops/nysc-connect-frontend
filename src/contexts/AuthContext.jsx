import React, { createContext, useContext, useEffect, useState } from "react";
import apiClient, { unwrap } from "../services/apiClient";

const AuthContext = createContext(null);

const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === "true";

const MOCK_USER = {
  _id: "mock-user-1",
  name: "Test User",
  email: "test@example.com",
  phone: "+2348012345678",
  role: "corps_member",     // change to "ADMIN" to test admin routes
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (MOCK_AUTH) {
      // Skip /auth/me entirely when mocking
      const storedToken = localStorage.getItem("access_token");
      const storedUser = localStorage.getItem("user");
      if (storedToken) {
        setToken(storedToken);
        setUser(storedUser ? JSON.parse(storedUser) : MOCK_USER);
      }
      setIsLoading(false);
      return;
    }

    // ── Real path ─────────────────────────────────────
    (async () => {
      try {
        const storedToken = localStorage.getItem("access_token");
        const storedUser = localStorage.getItem("user");
        if (storedToken) {
          setToken(storedToken);
          if (storedUser) setUser(JSON.parse(storedUser));
          const res = await apiClient.get("/auth/me");
          const { user: fresh } = unwrap(res);
          setUser(fresh);
          localStorage.setItem("user", JSON.stringify(fresh));
        }
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async ({ email, password }) => {
    if (MOCK_AUTH) {
      const t = "mock-token";
      localStorage.setItem("access_token", t);
      localStorage.setItem("user", JSON.stringify(MOCK_USER));
      setToken(t);
      setUser(MOCK_USER);
      return MOCK_USER;
    }

    // ── Real path ─────────────────────────────────────
    const res = await apiClient.post("/auth/login", { email, password });
    const { user: u, token: t } = unwrap(res);
    localStorage.setItem("access_token", t);
    localStorage.setItem("user", JSON.stringify(u));
    setToken(t);
    setUser(u);
    return u;
  };

  const register = async (payload) => {
    if (MOCK_AUTH) {
      const t = "mock-token";
      localStorage.setItem("access_token", t);
      localStorage.setItem("user", JSON.stringify(MOCK_USER));
      setToken(t);
      setUser(MOCK_USER);
      return MOCK_USER;
    }

    const res = await apiClient.post("/auth/register", payload);
    const { user: u, token: t } = unwrap(res);
    localStorage.setItem("access_token", t);
    localStorage.setItem("user", JSON.stringify(u));
    setToken(t);
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_location");
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === "ADMIN" || user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAdmin, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}