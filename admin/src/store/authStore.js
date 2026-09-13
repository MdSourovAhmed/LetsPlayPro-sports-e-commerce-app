import { create } from 'zustand';

// Role hierarchy for role-based access control checks elsewhere in the app.
// Higher index = more privilege.
export const ROLES = ['staff', 'admin', 'super_admin'];

// No persist middleware here at all, deliberately — and no more dynamicStorage/localStorage/
// sessionStorage routing based on a "remember me" flag either. There's nothing left worth
// persisting client-side: the access token lives in memory only (cleared on every reload, by
// design), and the refresh token never touches this file, or any frontend code, at all — it's
// an httpOnly cookie the browser manages entirely on its own, invisible to JS.
//
// "Remember me" still exists as a checkbox on the login form, but it no longer controls where
// *this app* stores anything — it's just a boolean sent to the login endpoint, which decides
// server-side whether the cookie it sets is persistent (survives closing the browser) or
// session-only (deleted when the browser closes). See LoginPage.jsx and the backend's
// utils/cookies.js. "Does a valid session survive a hard refresh" is answered by asking the
// server on every boot (useAuthBoot.js), not by reading anything out of storage.
export const useAuthStore = create((set, get) => ({
  user: null, // { id, name, email, role, avatarUrl }
  accessToken: null,
  isAuthenticated: false,

  // True until useAuthBoot.js has finished asking the server "is there a valid session
  // cookie?" via a silent refresh-token call. Route guards (ProtectedRoute/PublicOnlyRoute)
  // read this and hold off making an auth-based redirect decision until it flips to false —
  // see those files and useAuthBoot.js for the full explanation of the race this closes.
  isBooting: true,
  setBooting: (isBooting) => set({ isBooting }),

  setSession: ({ user, accessToken }) => set({ user, accessToken, isAuthenticated: true }),

  setAccessToken: (accessToken) => set({ accessToken, isAuthenticated: Boolean(accessToken) }),

  updateUser: (partial) => set((state) => ({ user: { ...state.user, ...partial } })),

  // Only clears local state — actually revoking the session (deleting the refresh token
  // server-side and clearing its cookie) is a separate API call the caller is responsible
  // for making first. See Header.jsx's handleLogout for the full sequence.
  logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),

  hasRole: (minimumRole) => {
    const { user } = get();
    if (!user) return false;
    return ROLES.indexOf(user.role) >= ROLES.indexOf(minimumRole);
  },
}));
