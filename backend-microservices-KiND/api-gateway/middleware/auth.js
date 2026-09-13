const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Inject decoded identity for downstream services
    req.headers['x-user-id']   = decoded.id;
    req.headers['x-user-role'] = decoded.role;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Like verifyToken, but never blocks the request — used for routes that must
// work for guests (e.g. Stripe payment-intent creation during guest
// checkout) while still attaching x-user-id/x-user-role when the caller
// does happen to have a valid session, purely so downstream services can
// log/audit against a user where one exists.
function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next();

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.headers['x-user-id']   = decoded.id;
    req.headers['x-user-role'] = decoded.role;
  } catch (err) {
    // Invalid/expired token on an optional-auth route just means "treat as
    // guest" — this route never rejects the request over auth.
  }
  next();
}

module.exports = { verifyToken, optionalAuth };
