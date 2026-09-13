import { axiosInstance } from "./axiosInstance";

export const authApi = {
  signup: (payload) => axiosInstance.post("/signup", payload).then((r) => r.data),

  login: (payload) => axiosInstance.post("/login", payload).then((r) => r.data),

  // Exchanges a Google ID token (from Google Identity Services) for our own session tokens.
  // Backend verifies the token server-side via google-auth-library before trusting it.
  loginWithGoogle: (idToken) =>
    axiosInstance.post("/auth/google", { idToken }).then((r) => r.data),

  // No argument, no body — the refresh token is an httpOnly cookie the browser attaches
  // automatically (see axiosInstance.js's withCredentials: true). This call is how the app
  // finds out whether a valid session cookie exists at all; JS can never read the cookie
  // itself to check first.
  refreshToken: () =>
    axiosInstance.post("/auth/refresh-token").then((r) => r.data),

  forgotPassword: (email) =>
    axiosInstance.post("/auth/forgot-password", { email }).then((r) => r.data),

  resetPassword: (payload) =>
    axiosInstance.post("/auth/reset-password", payload).then((r) => r.data),

  getMe: () => axiosInstance.get("/auth/me").then((r) => r.data),

  logout: () => axiosInstance.post("/auth/logout").then((r) => r.data),

  changePassword: (payload) =>
    axiosInstance.post("/auth/change-password", payload).then((r) => r.data),

  // GET /user/profile returns the user object directly (no wrapper) — normalized to { user }
  // here so it matches getMe's shape and every consumer can read `.user` consistently.
  getProfile: () => axiosInstance.get("/user/profile").then((r) => ({ user: r.data })),

  updateProfile: (payload) =>
    axiosInstance.put("/user/profile", payload).then((r) => r.data),

  // ─── Address Book ──────────────────────────────────────────────────────────
  // Every address endpoint returns { addresses: [...] } — the full updated list —
  // which keeps optimistic UI updates simple (no need to merge a single changed item back in).
  getAddresses: () => axiosInstance.get("/user/addresses").then((r) => r.data.addresses),

  addAddress: (payload) =>
    axiosInstance.post("/user/addresses", payload).then((r) => r.data.addresses),

  updateAddress: (addressId, payload) =>
    axiosInstance.put(`/user/addresses/${addressId}`, payload).then((r) => r.data.addresses),

  deleteAddress: (addressId) =>
    axiosInstance.delete(`/user/addresses/${addressId}`).then((r) => r.data.addresses),

  setDefaultAddress: (addressId) =>
    axiosInstance.patch(`/user/addresses/${addressId}/default`).then((r) => r.data.addresses),
};
