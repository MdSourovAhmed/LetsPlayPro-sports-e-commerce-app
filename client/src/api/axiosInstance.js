import axios from "axios";
import { API_BASE_URL } from "../utils/constants";
import { useAuthStore } from "../store/useAuthStore";

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
  // Required for the httpOnly refresh-token cookie to ever be sent to or received from the
  // gateway — without this, the browser silently drops Set-Cookie on cross-origin responses
  // and never attaches the cookie on outgoing requests, even though nothing else here would
  // look broken (the cookie would just never show up in the request at all).
  withCredentials: true,
});

// ─── Request: attach bearer token ──────────────────────────────────────────
// Only the access token ever passes through JS — it lives in memory (Zustand state, never
// persisted to storage). The refresh token never touches this file, or any other frontend
// code, at all — it's an httpOnly cookie the browser manages on its own.
axiosInstance.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ─── Response: normalize errors + auto-refresh on 401 ──────────────────────
let refreshPromise = null;

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Don't try to refresh the refresh-token call itself, or auth calls that
    // are supposed to fail (login with wrong password, etc.)
    const isAuthRoute = originalRequest?.url?.includes("/login") ||
      originalRequest?.url?.includes("/signup") ||
      originalRequest?.url?.includes("/auth/refresh-token");

    if (status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;

      try {
        // Multiple simultaneous 401s should share a single refresh call. No body, no
        // refreshToken argument anywhere — the cookie goes along automatically because of
        // withCredentials above.
        if (!refreshPromise) {
          refreshPromise = axiosInstance
            .post("/auth/refresh-token")
            .then((res) => {
              const { accessToken } = res.data;
              useAuthStore.getState().setAccessToken(accessToken);
              return accessToken;
            })
            .finally(() => {
              refreshPromise = null;
            });
        }

        const newAccessToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // No valid session cookie (never logged in, or it expired/was revoked) — clear
        // whatever local auth state exists and let the error propagate normally.
        useAuthStore.getState().logout();
        return Promise.reject(normalizeError(refreshError));
      }
    }

    return Promise.reject(normalizeError(error));
  }
);

/**
 * Normalizes any axios error into a consistent shape the UI can rely on.
 * @param {import('axios').AxiosError} error
 */
function normalizeError(error) {
  if (error.response) {
    return {
      status: error.response.status,
      message: error.response.data?.message || "Something went wrong. Please try again.",
      details: error.response.data,
    };
  }
  if (error.request) {
    return {
      status: 0,
      message: "Can't reach the server. Check your connection and try again.",
      details: null,
    };
  }
  return { status: -1, message: error.message || "Unexpected error", details: null };
}
