// Inner-service auth: trusts x-user-id / x-user-role forwarded by the API Gateway.
// Never call the auth-service DB directly from here.

// Mirrors auth-service/middleware/auth.js ROLES exactly — keep in sync.
const ROLES = ['user', 'staff', 'admin', 'super_admin'];

function hasMinimumRole(role, minimumRole) {
  return ROLES.indexOf(role) >= ROLES.indexOf(minimumRole);
}

function authClientUser(req, res, next) {
  const userId = req.headers['x-user-id'];
  const role   = req.headers['x-user-role'];
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  req.user = { id: userId, role };
  next();
}

function requireRole(minimumRole) {
  return (req, res, next) => {
    console.log(req.user);
    if (!req.user?.role || !hasMinimumRole(req.user.role, minimumRole)) {
      return res.status(403).json({ message: `Requires ${minimumRole} access or higher` });
    }
    next();
  };
}

// Kept for backward compatibility — now hierarchy-aware (admin OR super_admin
// pass, not just an exact 'admin' string match).
const adminOnly = requireRole('admin');

module.exports = { authClientUser, adminOnly, requireRole, hasMinimumRole };
