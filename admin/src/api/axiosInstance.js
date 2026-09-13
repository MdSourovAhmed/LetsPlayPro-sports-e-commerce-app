import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Required for the httpOnly refresh-token cookie to ever be sent to or received from the
  // gateway — without this, the browser silently drops Set-Cookie on cross-origin responses
  // and never attaches the cookie on outgoing requests. Every axios call in this app (direct
  // ones via axios.post below included) needs this, not just the default instance.
  withCredentials: true,
});

// ─── Request interceptor: attach access token ────────────────────────────────
// Only the access token passes through JS, and only ever in memory (Zustand state, never
// persisted to storage — see store/authStore.js). The refresh token never touches this file,
// or any other frontend code: it's an httpOnly cookie the browser manages entirely on its own.
axiosInstance.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ─── Response interceptor: refresh-on-401, normalize errors ──────────────────
let isRefreshing = false;
let pendingQueue = [];

function resolvePendingQueue(newToken) {
  pendingQueue.forEach(({ resolve }) => resolve(newToken));
  pendingQueue = [];
}

function rejectPendingQueue(error) {
  pendingQueue.forEach(({ reject }) => reject(error));
  pendingQueue = [];
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;

    // Network error / no response at all
    if (!response) {
      return Promise.reject({
        message: 'Network error — check your connection and try again.',
        isNetworkError: true,
        original: error,
      });
    }

    const status = response.status;

    // Already retried once — don't loop forever. Also skip the refresh-token endpoint's own
    // 401s — that's a real "no valid session" answer, not something to retry.
    if (status === 401 && !config._retry && !config.url?.includes('/auth/refresh-token')) {
      const { setAccessToken, logout } = useAuthStore.getState();

      if (isRefreshing) {
        // Queue this request until the in-flight refresh resolves
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((newToken) => {
          config._retry = true;
          config.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(config);
        });
      }

      isRefreshing = true;
      config._retry = true;

      try {
        // No body, no refreshToken argument — the cookie goes along automatically because
        // of withCredentials above. axios.post (not axiosInstance) here just to avoid this
        // exact interceptor recursing on its own request.
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        setAccessToken(data.accessToken);
        resolvePendingQueue(data.accessToken);
        config.headers.Authorization = `Bearer ${data.accessToken}`;
        return axiosInstance(config);
      } catch (refreshError) {
        rejectPendingQueue(refreshError);
        logout();
        return Promise.reject(normalizeError(refreshError));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizeError(error));
  }
);

function normalizeError(error) {
  const message =
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    'Something went wrong. Please try again.';

  return {
    message,
    status: error.response?.status,
    fieldErrors: error.response?.data?.errors, // for form-level validation errors
    original: error,
  };
}

export default axiosInstance;
