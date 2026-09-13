const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Role hierarchy, lowest to highest. Mirrors the dashboard's authStore.js
// ROLES array exactly — keep these in sync if either side changes.
const ROLES = ['user', 'staff', 'admin', 'super_admin'];

function hasMinimumRole(role, minimumRole) {
  return ROLES.indexOf(role) >= ROLES.indexOf(minimumRole);
}

// Used internally within auth-service (full DB lookup)
async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });
    if (!user.isActive) return res.status(403).json({ message: 'Account deactivated' });

    req.user = user;
    next();
  } catch (err) {
    // jwt.verify throws TokenExpiredError specifically on expiry — flagging
    // this distinctly lets the dashboard's axios interceptor decide whether
    // to attempt a silent refresh vs. hard-redirect to login. Both currently
    // return 401, but the message differs so client-side logic can branch
    // on it if needed later.
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Used by the gateway — lightweight, no DB hit
function verifyToken(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Forward user identity to downstream services via header
    req.headers['x-user-id']   = decoded.id;
    req.headers['x-user-role'] = decoded.role;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Generic minimum-role gate. Usage: requireRole('admin') as middleware.
// Replaces the old hardcoded adminOnly, which only accepted the literal
// string 'admin' and would have incorrectly rejected super_admin.
function requireRole(minimumRole) {
  return (req, res, next) => {
    if (!req.user?.role || !hasMinimumRole(req.user.role, minimumRole)) {
      return res.status(403).json({ message: `Requires ${minimumRole} access or higher` });
    }
    next();
  };
}

// Kept for backward compatibility with existing route files — now correctly
// hierarchy-aware instead of an exact string match.
const adminOnly = requireRole('admin');

// For inner services: trust x-user-id header forwarded by the gateway
function authClientUser(req, res, next) {
  const userId = req.headers['x-user-id'];
  const role   = req.headers['x-user-role'];
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  req.user = { id: userId, role };
  next();
}

module.exports = { authMiddleware, verifyToken, adminOnly, requireRole, authClientUser, ROLES, hasMinimumRole };
