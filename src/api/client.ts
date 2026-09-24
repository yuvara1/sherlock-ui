import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: attach JWT + correlation ID ──────────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("elora_access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  config.headers["X-Correlation-ID"] = crypto.randomUUID();
  return config;
});

// ── Response interceptor: handle 401 globally ─────────────────────────────
apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const refreshToken = localStorage.getItem("elora_refresh_token");
        const { data } = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, { refreshToken });
        localStorage.setItem("elora_access_token", data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(original);
      } catch {
        localStorage.removeItem("elora_access_token");
        localStorage.removeItem("elora_refresh_token");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);
