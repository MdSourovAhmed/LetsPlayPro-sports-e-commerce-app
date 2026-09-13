const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');
const publisher = require('../rabbitmq/publisher');
const {
  signAccessToken,
  issueRefreshToken,
  findValidRefreshToken,
  rotateRefreshToken,
  revokeAllRefreshTokens,
  revokeRefreshToken,
} = require('../utils/tokens');
const { REFRESH_TOKEN_COOKIE, setRefreshTokenCookie, clearRefreshTokenCookie } = require('../utils/cookies');
const { sendPasswordResetEmail } = require('../utils/passwordReset');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function publicUser(user) {
  return {
    id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    address: user.address,
    profileImage: user.profileImage,
  };
}

/**
 * Issues a fresh access token + refresh token for `user`, sets the refresh token as an
 * httpOnly cookie on `res`, and returns only the access token + public user fields for the
 * JSON body. This is the one place that decides "how a session gets started" — every
 * signup/login/google/admin-register path below calls this instead of duplicating the same
 * four lines, which matters here specifically because it's also the one place that could
 * accidentally leak a refresh token into a JSON response if someone copy-pasted instead.
 */
async function startSession(res, user, { ip, rememberMe = true } = {}) {
  const accessToken = signAccessToken(user);
  const refreshToken = await issueRefreshToken(user, { ip, rememberMe });
  setRefreshTokenCookie(res, refreshToken, rememberMe);
  return { accessToken, user: publicUser(user) };
}

// ─── POST /signup ────────────────────────────────────────────────────────────
async function signup(req, res) {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'email, password and name are required' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const user = await User.create({ email, password, name });
    const session = await startSession(res, user, { ip: req.ip });

    publisher.userRegistered(user);

    res.status(201).json(session);
  } catch (err) {
    console.error('[signup]', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ─── POST /auth/admin-register ───────────────────────────────────────────────
// Testing/dev convenience: lets someone bootstrap a staff or admin account without an
// existing admin having to create one first (or without touching Mongo directly). This is
// deliberately NOT a production feature — it's gated behind ADMIN_REGISTRATION_CODE, an env
// var that must be explicitly set for this endpoint to do anything at all. Leave it unset
// (the default) in any environment this shouldn't be reachable in, and this route always
// rejects with 403 regardless of what invite code is supplied. Never creates a super_admin —
// that role is reserved for manual seeding, since it can delete other admins.
async function adminRegister(req, res) {
  try {
    const registrationCode = process.env.ADMIN_REGISTRATION_CODE;
    if (!registrationCode) {
      return res.status(403).json({
        message: 'Admin registration is disabled. Set ADMIN_REGISTRATION_CODE to enable it for testing.',
      });
    }

    const { name, email, password, role, inviteCode } = req.body;

    if (!name || !email || !password || !role || !inviteCode) {
      return res.status(400).json({ message: 'name, email, password, role, and inviteCode are required' });
    }

    if (inviteCode !== registrationCode) {
      return res.status(403).json({ message: 'Invalid invite code' });
    }

    if (!['staff', 'admin'].includes(role)) {
      return res.status(400).json({ message: "role must be 'staff' or 'admin'" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const user = await User.create({ email, password, name, role });
    const session = await startSession(res, user, { ip: req.ip });

    publisher.userRegistered(user);

    res.status(201).json(session);
  } catch (err) {
    console.error('[adminRegister]', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ─── POST /auth/google ────────────────────────────────────────────────────────
// Body: { idToken } — the credential returned by Google Identity Services
// (@react-oauth/google's GoogleLogin onSuccess). We verify it against
// Google's public keys ourselves rather than trusting anything about it as
// sent — a client could put whatever it wants in an unverified JWT payload.
async function googleLogin(req, res) {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: 'idToken is required' });

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (err) {
      console.error('[googleLogin] token verification failed:', err.message);
      return res.status(401).json({ message: 'Invalid Google token' });
    }

    if (!payload?.email_verified) {
      return res.status(401).json({ message: 'Google account email is not verified' });
    }

    let user = await User.findOne({ $or: [{ googleId: payload.sub }, { email: payload.email }] });

    if (user) {
      // Existing email/password account signing in with Google for the
      // first time — link it rather than creating a duplicate user.
      if (!user.googleId) {
        user.googleId = payload.sub;
        await user.save();
      }
    } else {
      user = await User.create({
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        googleId: payload.sub,
        profileImage: payload.picture || '',
        // password intentionally omitted — see User.js schema for why
        // that's valid for accounts with a googleId set.
      });
      publisher.userRegistered(user);
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'This account has been deactivated' });
    }

    const session = await startSession(res, user, { ip: req.ip });
    res.json(session);
  } catch (err) {
    console.error('[googleLogin]', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ─── POST /login ─────────────────────────────────────────────────────────────
async function login(req, res) {
  try {
    const { email, password, rememberMe = true } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    if (!user.isActive) {
      return res.status(403).json({ message: 'This account has been deactivated' });
    }

    if (!user.password) {
      // Account was created via Google sign-in and never set a password.
      return res.status(401).json({
        message: 'This account uses Google sign-in. Please continue with Google instead.',
      });
    }

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const session = await startSession(res, user, { ip: req.ip, rememberMe: Boolean(rememberMe) });
    res.json(session);
  } catch (err) {
    console.error('[login]', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ─── POST /auth/refresh-token ────────────────────────────────────────────────
// Reads the refresh token from the httpOnly cookie (see utils/cookies.js) — never from the
// request body. The browser attaches this automatically on any request to a path under
// /api/auth as long as the request is made with credentials included (axios's
// `withCredentials: true` on the frontend); nothing in the request itself needs to reference
// the token at all, which is the whole point of not letting JS touch it.
async function refreshTokenHandler(req, res) {
  try {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token' });
    }

    // We don't know which user this token belongs to until we find the
    // matching hash, so we have to scan. In practice this is bounded by
    // MAX_TOKENS_PER_USER per document, and indexed by tokenHash below.
    const user = await User.findOne({ 'refreshTokens.tokenHash': User.hashToken(refreshToken) });
    if (!user) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const entry = findValidRefreshToken(user, refreshToken);
    if (!entry) {
      // Token exists but is revoked/expired. If it's revoked specifically
      // (not just expired), this is a signal of potential token theft —
      // someone replayed an old, already-rotated token. Defensive move:
      // revoke every other token for this user too, forcing a fresh login
      // on all devices.
      const replayedRevoked = user.refreshTokens.find(
        (t) => t.tokenHash === User.hashToken(refreshToken) && t.revokedAt
      );
      if (replayedRevoked) {
        revokeAllRefreshTokens(user);
        await user.save();
      }
      clearRefreshTokenCookie(res);
      return res.status(401).json({ message: 'Refresh token expired or revoked' });
    }

    if (!user.isActive) {
      clearRefreshTokenCookie(res);
      return res.status(403).json({ message: 'This account has been deactivated' });
    }

    const newRefreshToken = await rotateRefreshToken(user, entry, { ip: req.ip });
    const accessToken = signAccessToken(user);

    // Inherits entry.rememberMe via rotateRefreshToken — a session-only login stays
    // session-only through every rotation, see the comment on rotateRefreshToken itself.
    setRefreshTokenCookie(res, newRefreshToken, entry.rememberMe);

    res.json({ accessToken });
  } catch (err) {
    console.error('[refreshToken]', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ─── POST /auth/logout ────────────────────────────────────────────────────────
async function logout(req, res) {
  try {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
    if (refreshToken) {
      const user = await User.findOne({ 'refreshTokens.tokenHash': User.hashToken(refreshToken) });
      if (user) {
        revokeRefreshToken(user, refreshToken);
        await user.save();
      }
    }
    clearRefreshTokenCookie(res);
    res.json({ message: 'Logged out' });
  } catch (err) {
    console.error('[logout]', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ─── POST /auth/forgot-password ───────────────────────────────────────────────
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'email is required' });

    const user = await User.findOne({ email });

    // Always return 200 regardless of whether the email exists — prevents
    // attackers from using this endpoint to enumerate registered emails.
    if (user) {
      await sendPasswordResetEmail(user);
    }

    res.json({ message: 'If an account exists for that email, a reset link has been sent.' });
  } catch (err) {
    console.error('[forgotPassword]', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ─── POST /auth/reset-password ────────────────────────────────────────────────
async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'token and password are required' });
    }

    const tokenHash = User.hashToken(token);
    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired' });
    }

    user.password = password; // re-hashed by the pre-save hook
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    revokeAllRefreshTokens(user); // password reset invalidates all existing sessions
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('[resetPassword]', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ─── POST /auth/change-password ──────────────────────────────────────────────
// Authenticated route — for the admin settings page's "change password".
async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'currentPassword and newPassword are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await user.comparePassword(currentPassword);
    if (!match) return res.status(401).json({ message: 'Current password is incorrect' });

    user.password = newPassword;
    revokeAllRefreshTokens(user); // force re-login on all other devices
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('[changePassword]', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// ─── GET /auth/me ─────────────────────────────────────────────────────────────
async function getMe(req, res) {
  try {
    res.json({ user: publicUser(req.user) });
  } catch (err) {
    console.error('[getMe]', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  signup,
  login,
  googleLogin,
  adminRegister,
  refreshTokenHandler,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
};
