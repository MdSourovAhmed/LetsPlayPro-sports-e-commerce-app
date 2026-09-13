import { useEffect } from "react";
import { authApi } from "../api/authApi";
import { useAuthStore } from "../store/useAuthStore";

/**
 * On first mount, always attempts a silent refresh-token exchange — this is the only way to
 * find out whether a valid session cookie exists at all, since the cookie is httpOnly and
 * therefore invisible to JS by design. A 401 here just means "no valid session", which is a
 * completely normal outcome (a first-time visitor, or one who's genuinely logged out), not an
 * error to alarm about.
 *
 * Drives the store's `isBooting` flag rather than local component state — that's what makes
 * this fixable at all: route guards (ProtectedRoute/GuestRoute) read `isBooting` directly
 * from the store, so they never have to be told about it via props, and they naturally wait
 * for it regardless of where in the tree they render. Call this once, near the app root
 * (see App.jsx) — it doesn't need to be called again, and doesn't return anything for a
 * caller to (mistakenly, as in an earlier version of this file) discard.
 */
export function useAuthBoot() {
  useEffect(() => {
    const { setAccessToken, setUser, setBooting, logout } = useAuthStore.getState();
    let cancelled = false;

    authApi
      .refreshToken()
      .then((res) => {
        if (cancelled) return;
        setAccessToken(res.accessToken);
        // The refresh endpoint only returns a token, not the user profile — fetch it
        // separately so the header/account pages have a name to show immediately rather
        // than waiting for the first authenticated page's own data fetch.
        return authApi.getMe();
      })
      .then((res) => {
        if (cancelled || !res) return;
        setUser(res.user);
      })
      .catch(() => {
        // No valid session cookie — this is the normal state for a logged-out visitor, not
        // a failure worth surfacing to them.
        if (!cancelled) logout();
      })
      .finally(() => {
        if (!cancelled) setBooting(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);
}
