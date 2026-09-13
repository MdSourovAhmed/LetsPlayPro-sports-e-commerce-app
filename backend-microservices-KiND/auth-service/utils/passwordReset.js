const crypto = require('crypto');
const publisher = require('../rabbitmq/publisher');

const RESET_TOKEN_BYTES = 32;

function getResetExpiryMs() {
  const minutes = Number(process.env.RESET_TOKEN_EXPIRES_MINUTES) || 30;
  return minutes * 60 * 1000;
}

// Generates a raw reset token, stores only its hash + expiry on the user,
// and publishes an event so notification-service can email the raw token
// as part of a reset link. Mirrors the refresh-token hash-only-storage
// principle in utils/tokens.js.
async function sendPasswordResetEmail(user) {
  const rawToken = crypto.randomBytes(RESET_TOKEN_BYTES).toString('hex');
  const tokenHash = user.constructor.hashToken(rawToken);

  user.resetPasswordToken = tokenHash;
  user.resetPasswordExpiry = new Date(Date.now() + getResetExpiryMs());
  await user.save();

  publisher.passwordResetRequested(user, rawToken);
}

module.exports = { sendPasswordResetEmail };
