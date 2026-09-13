const { sendMail } = require('../config/mailer');
const {
  orderConfirmationTemplate,
  orderStatusTemplate,
  orderCancelledTemplate,
  userWelcomeTemplate,
  passwordResetTemplate,
} = require('./templates');

// NOTE: We deliberately do NOT email on raw "order.placed" — at that point
// the order is only "pending" and stock hasn't been confirmed yet by
// product-service. The real confirmation moment is "order.status_updated"
// with status "processing", which order-service publishes only after the
// stock saga resolves successfully.

async function handleOrderStatusUpdated(order) {
  console.log(`[Notification] order.status_updated — #${order._id} -> ${order.status}`);
  // Don't double-send if a separate cancelled event is coming
  if (order.status === 'cancelled') return;

  const { subject, html } = order.status === 'processing'
    ? orderConfirmationTemplate(order) // first confirmation, post-saga
    : orderStatusTemplate(order);      // subsequent updates (shipped, delivered)

  await sendMail({ to: order.deliveryInfo.email, subject, html });
}

async function handleOrderCancelled(order) {
  console.log(`[Notification] order.cancelled — #${order._id}`);
  const { subject, html } = order.rejectionReason
    ? orderStatusTemplate({ ...order, status: 'cancelled' }) // rejected by stock saga
    : orderCancelledTemplate(order);                          // user/admin cancelled
  await sendMail({ to: order.deliveryInfo.email, subject, html });
}

async function handleUserRegistered(user) {
  console.log(`[Notification] user.registered — ${user.email}`);
  const { subject, html } = userWelcomeTemplate(user);
  await sendMail({ to: user.email, subject, html });
}

async function handlePasswordResetRequested(event) {
  console.log(`[Notification] user.password_reset_requested — ${event.email}`);
  const { subject, html } = passwordResetTemplate(event);
  console.log(subject);
  console.log(html);
  await sendMail({ to: event.email, subject, html });
}

module.exports = {
  handleOrderStatusUpdated,
  handleOrderCancelled,
  handleUserRegistered,
  handlePasswordResetRequested,
};
