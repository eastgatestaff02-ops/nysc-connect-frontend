import axios from "axios";
import { mockRequest } from "./mockApi";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

const MOCK = import.meta.env.VITE_MOCK_API === "true";

/* ============================================================
   Mock adapter — installed only when VITE_MOCK_API=true.
   Delegates every request to mockRequest in mockApi.js.
   ============================================================ */
async function mockAdapter(config) {
  return mockRequest(config);
}

/* ============================================================
   Axios instance
   ============================================================ */
const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  ...(MOCK ? { adapter: mockAdapter } : {}),
});

/* ---------- Request interceptor: inject Bearer token ---------- */
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ============================================================
   Envelope unwrap — single place where { status, message, data }
   is stripped. Pages and contexts receive the inner payload.
   ============================================================ */
export function unwrap(response) {
  return response?.data?.data ?? response?.data;
}

/* ---------- Response interceptor: unwrap + handle 401/403 ---------- */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message || error.message || "Request failed";

    if (status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      // Do not redirect here — let route guards handle it
    }
    // 403 is left to the caller so pages can show an error state
    return Promise.reject(new Error(message));
  }
);

export default apiClient;