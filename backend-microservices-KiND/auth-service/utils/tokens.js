const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const REFRESH_TOKEN_BYTES = 40;
const MAX_TOKENS_PER_USER = 5; // bound the array so old unused tokens don't accumulate forever

function getRefreshExpiryMs() {
  const days = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS) || 30;
  return days * 24 * 60 * 60 * 1000;
}

function signAccessToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
}

// Generates a new opaque refresh token, stores its hash on the user
// document, and returns the RAW token (only time it's ever visible — the
// DB only ever holds the hash, same principle as password hashing). The
// raw token itself is never returned to callers of this module anymore for
// them to hand back in a JSON body — see authController.js, which passes it
// straight to setRefreshTokenCookie() instead.
async function issueRefreshToken(user, { ip, rememberMe = true } = {}) {
  const rawToken = crypto.randomBytes(REFRESH_TOKEN_BYTES).toString('hex');
  const tokenHash = user.constructor.hashToken(rawToken);

  user.refreshTokens.push({
    tokenHash,
    expiresAt: new Date(Date.now() + getRefreshExpiryMs()),
    createdByIp: ip || '',
    rememberMe,
  });

  // Trim to the most recent N tokens — oldest dropped first. Bounds storage
  // growth for users who log in from many devices over time.
  if (user.refreshTokens.length > MAX_TOKENS_PER_USER) {
    user.refreshTokens = user.refreshTokens.slice(-MAX_TOKENS_PER_USER);
  }

  await user.save();
  return rawToken;
}

// Validates a raw refresh token against the user's stored hashes. Returns
// the matching token subdocument, or null if not found/expired/revoked.
function findValidRefreshToken(user, rawToken) {
  const tokenHash = user.constructor.hashToken(rawToken);
  const entry = user.refreshTokens.find((t) => t.tokenHash === tokenHash);

  if (!entry) return null;
  if (entry.revokedAt) return null;
  if (entry.expiresAt < new Date()) return null;

  return entry;
}

// Rotation: the token just used is marked revoked (and linked to its
// replacement for audit purposes), a brand new token is issued. This means
// a refresh token can only ever be used once — if a stolen token is reused
// after the legitimate client already rotated it, the reuse attempt fails
// because the old hash is now revoked, which is a real signal of compromise.
//
// The new token inherits oldEntry's `rememberMe` rather than accepting it as
// a fresh argument — a session-only ("don't remember me") login must stay
// session-only through every rotation for as long as that browser session
// lives, or unchecking that box on login would be meaningless in practice
// (the very first silent refresh would upgrade it to persistent).
async function rotateRefreshToken(user, oldEntry, { ip } = {}) {
  const rawToken = crypto.randomBytes(REFRESH_TOKEN_BYTES).toString('hex');
  const newHash = user.constructor.hashToken(rawToken);

  oldEntry.revokedAt = new Date();
  oldEntry.replacedByTokenHash = newHash;

  user.refreshTokens.push({
    tokenHash: newHash,
    expiresAt: new Date(Date.now() + getRefreshExpiryMs()),
    createdByIp: ip || '',
    rememberMe: oldEntry.rememberMe,
  });

  if (user.refreshTokens.length > MAX_TOKENS_PER_USER) {
    user.refreshTokens = user.refreshTokens.slice(-MAX_TOKENS_PER_USER);
  }

  await user.save();
  return rawToken;
}

function revokeAllRefreshTokens(user) {
  const now = new Date();
  user.refreshTokens.forEach((t) => {
    if (!t.revokedAt) t.revokedAt = now;
  });
}

function revokeRefreshToken(user, rawToken) {
  const entry = findValidRefreshToken(user, rawToken);
  if (entry) entry.revokedAt = new Date();
  return Boolean(entry);
}

module.exports = {
  signAccessToken,
  issueRefreshToken,
  findValidRefreshToken,
  rotateRefreshToken,
  revokeAllRefreshTokens,
  revokeRefreshToken,
};
