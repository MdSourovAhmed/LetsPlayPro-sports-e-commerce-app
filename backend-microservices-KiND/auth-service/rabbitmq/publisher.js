const { getChannel } = require('./connection');

function publish(routingKey, payload) {
  try {
    const ch = getChannel();
    ch.publish(
      'app.events',
      routingKey,
      Buffer.from(JSON.stringify(payload)),
      { persistent: true }
    );
    console.log(`[Auth/Publisher] ${routingKey}`, payload);
  } catch (err) {
    console.error('[Auth/Publisher] failed to publish:', err.message);
  }
}

module.exports = {
  userRegistered: (user) =>
    publish('user.registered', {
      userId: user._id,
      email:  user.email,
      name:   user.name,
    }),

  passwordResetRequested: (user, rawToken) =>
    publish('user.password_reset_requested', {
      userId: user._id,
      email:  user.email,
      name:   user.name,
      // The RAW token travels over RabbitMQ to notification-service so it
      // can build the reset link — only the HASH is ever persisted in
      // MongoDB. This is safe because the message bus is internal/trusted
      // infrastructure, not exposed externally like the database would be
      // if it leaked.
      resetToken: rawToken,
    }),
};
