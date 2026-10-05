import axios from "axios";
import { mockRequest } from "./mockApi";

const MOCK = import.meta.env.VITE_MOCK_API === "true";

// ─── Mock adapter ────────────────────────────────────────
// When MOCK is true, this replaces the real network layer.
// The rest of the app calls axios exactly as it did before.
const mockAdapter = async (config) => {
  try {
    const data = await mockRequest(config);
    return { data, status: 200, statusText: "OK", headers: {}, config };
  } catch (error) {
    throw error; // axios will route this to response interceptor
  }
};

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
  ...(MOCK ? { adapter: mockAdapter } : {}),
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

export const unwrap = (response) => response.data?.data ?? response.data;

export default apiClient;