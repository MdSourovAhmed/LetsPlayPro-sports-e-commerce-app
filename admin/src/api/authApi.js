import axiosInstance from './axiosInstance';

// Backend integration contract:
// POST /auth/login            { email, password, rememberMe }  -> { user, accessToken }
//   rememberMe decides server-side whether the refresh-token cookie this sets is persistent
//   (survives closing the browser) or session-only — nothing for this app to manage itself.
// POST /auth/refresh-token    (no body)                        -> { accessToken }
//   Refresh token is an httpOnly cookie, sent automatically (axiosInstance has
//   withCredentials: true) — never touches this file or any other frontend code.
// POST /auth/forgot-password  { email }                        -> { message }
// POST /auth/reset-password   { token, password }              -> { message }
// POST /auth/change-password  { currentPassword, newPassword } -> { message }
// GET  /auth/me                                                -> { user }
// POST /auth/logout           (no body)                        -> { message }
//   Revokes the refresh token server-side and clears its cookie — always call this before
//   clearing local state on logout, or a leaked/still-valid cookie keeps working.
// GET  /user/profile                                            -> user object directly (no wrapper — different from most other endpoints here)
// PUT  /user/profile          { name, email, phone }            -> { message, user }

// POST /auth/admin-register   { name, email, password, role, inviteCode } -> { user, accessToken }
//   Dev/test-only — always 403s unless the backend has ADMIN_REGISTRATION_CODE set. See
//   auth-service/controllers/authController.js's adminRegister for the full explanation.

export const authApi = {
  login: (payload) => axiosInstance.post('/auth/login', payload),
  adminRegister: (payload) => axiosInstance.post('/auth/admin-register', payload),
  refreshToken: () => axiosInstance.post('/auth/refresh-token'),
  forgotPassword: (email) => axiosInstance.post('/auth/forgot-password', { email }),
  resetPassword: ({ token, password }) =>
    axiosInstance.post('/auth/reset-password', { token, password }),
  changePassword: ({ currentPassword, newPassword }) =>
    axiosInstance.post('/auth/change-password', { currentPassword, newPassword }),
  getMe: () => axiosInstance.get('/auth/me'),
  logout: () => axiosInstance.post('/auth/logout'),
  getProfile: () => axiosInstance.get('/user/profile'),
  updateProfile: (payload) => axiosInstance.put('/user/profile', payload),
};
