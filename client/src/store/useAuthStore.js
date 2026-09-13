import { create } from "zustand";

// No persist middleware here at all, deliberately — there's nothing left worth persisting to
// localStorage/sessionStorage. The access token lives in memory only (cleared on every
// reload, by design — never touches storage). The refresh token never touches this file, or
// any frontend code, at all: it's an httpOnly cookie the browser manages entirely on its
// own, invisible to JS. "Does a valid session survive a hard refresh" is answered by asking
// the server (see useAuthBoot.js), not by reading anything out of storage.
export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  // True until useAuthBoot.js has finished asking the server "is there a valid session
  // cookie?" via a silent refresh-token call. Every fresh page load has to actually make
  // that call and wait for it — there's no local data to check first anymore. Route guards
  // (ProtectedRoute/GuestRoute) read this and hold off making an auth-based redirect
  // decision until it flips to false — see those files and useAuthBoot.js for the full
  // explanation of the bug this closes.
  isBooting: true,
  setBooting: (isBooting) => set({ isBooting }),

  setAccessToken: (accessToken) =>
    set({ accessToken, isAuthenticated: Boolean(accessToken) }),

  setUser: (user) => set({ user }),

  loginSuccess: ({ user, accessToken }) =>
    set({ user, accessToken, isAuthenticated: true }),

  // Only clears local state — actually revoking the session (deleting the refresh token
  // server-side and clearing its cookie) is a separate API call the caller is responsible
  // for making first. See authApi.logout() and its call sites.
  logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
}));
