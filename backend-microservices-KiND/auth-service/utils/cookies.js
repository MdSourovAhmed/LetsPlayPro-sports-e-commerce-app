const REFRESH_TOKEN_COOKIE = 'refreshToken';

function getRefreshExpiryMs() {
  const days = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS) || 30;
  return days * 24 * 60 * 60 * 1000;
}

/**
 * Shared attributes for both setting and clearing the cookie — clearCookie() only actually
 * clears a cookie if these match what it was originally set with (path/domain/sameSite must
 * agree), so keeping one function as the source of truth for both avoids them drifting apart.
 */
function baseCookieOptions() {
  return {
    httpOnly: true, // never readable by JS — the entire point of this approach
    // Browsers refuse to send `secure` cookies over plain http://, which local dev is. Only
    // require it once this is actually served over https:// (NODE_ENV=production assumes
    // that's true — set this deliberately if that's ever not the case for your deployment).
    secure: process.env.NODE_ENV === 'production',
    // 'lax' covers the normal case here: frontend and gateway on different ports of the same
    // host (localhost:5173 -> localhost:3000) are "same-site" even though they're technically
    // cross-origin — SameSite only cares about the registrable domain, not the port. If you
    // ever split the frontend and API across different *domains* in production (not just
    // subdomains), this needs to become 'none' (which then requires `secure: true`, i.e. HTTPS
    // — browsers reject SameSite=None without it).
    sameSite: 'lax',
    // Narrow on purpose: only the endpoints that actually need to read this cookie
    // (refresh-token, logout) live under this path, so the browser doesn't attach it to
    // every single request to the gateway.
    path: '/api/auth',
  };
}

/**
 * @param {import('express').Response} res
 * @param {string} token - raw refresh token
 * @param {boolean} rememberMe - true: persists across browser restarts (sets maxAge).
 *   false: omits maxAge/expires entirely, which makes it a session cookie — the browser
 *   deletes it itself when the browser closes. No client-side "remember me" storage logic
 *   needed anywhere; the browser's own cookie lifecycle does this for free.
 */
function setRefreshTokenCookie(res, token, rememberMe = true) {
  const options = baseCookieOptions();
  if (rememberMe) {
    options.maxAge = getRefreshExpiryMs();
  }
  res.cookie(REFRESH_TOKEN_COOKIE, token, options);
}

function clearRefreshTokenCookie(res) {
  res.clearCookie(REFRESH_TOKEN_COOKIE, baseCookieOptions());
}

module.exports = { REFRESH_TOKEN_COOKIE, setRefreshTokenCookie, clearRefreshTokenCookie, getRefreshExpiryMs };
