function orderConfirmationTemplate(order) {
  const itemRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee">${item.productId}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.size || '—'}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">৳${(item.priceAtPurchase * item.quantity).toFixed(2)}</td>
      </tr>`
    )
    .join('');

  return {
    subject: `Order Confirmed — #${order._id}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#1a1a1a">Thanks for your order, ${order.deliveryInfo.firstName}!</h2>
        <p>Your order <strong>#${order._id}</strong> has been received and is being processed.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <thead>
            <tr style="background:#f5f5f5">
              <th style="padding:8px;text-align:left">Product</th>
              <th style="padding:8px;text-align:center">Size</th>
              <th style="padding:8px;text-align:center">Qty</th>
              <th style="padding:8px;text-align:right">Total</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>
        <p style="font-size:18px;font-weight:bold">Order Total: ৳${order.totalAmount.toFixed(2)}</p>
        <p>Payment method: <strong>${order.paymentMethod.toUpperCase()}</strong></p>
        <hr style="margin:24px 0"/>
        <p style="color:#555;font-size:13px">Delivering to: ${order.deliveryInfo.street}, ${order.deliveryInfo.city}, ${order.deliveryInfo.country}</p>
      </div>
    `,
  };
}

function orderStatusTemplate(order) {
  const statusMessages = {
    processing: 'Your order is now being processed.',
    shipped:    `Your order is on its way! 🚚`,
    delivered:  'Your order has been delivered. Enjoy!',
    cancelled:  'Your order has been cancelled.',
  };

  return {
    subject: `Order Update — #${order._id} is now "${order.status}"`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#1a1a1a">Order Status Update</h2>
        <p>Hi ${order.deliveryInfo.firstName},</p>
        <p>${statusMessages[order.status] || `Your order status has been updated to: <strong>${order.status}</strong>`}</p>
        <p>Order ID: <strong>#${order._id}</strong></p>
      </div>
    `,
  };
}

function orderCancelledTemplate(order) {
  return {
    subject: `Order Cancelled — #${order._id}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#1a1a1a">Your order has been cancelled</h2>
        <p>Hi ${order.deliveryInfo.firstName},</p>
        <p>Order <strong>#${order._id}</strong> has been successfully cancelled.</p>
        <p>If you paid online, a refund will be processed within 3–5 business days.</p>
      </div>
    `,
  };
}

function userWelcomeTemplate(user) {
  return {
    subject: 'Welcome to Sports Store!',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#1a1a1a">Welcome, ${user.name}!</h2>
        <p>Your account has been created successfully.</p>
        <p>Start exploring our latest collections and gear up for your next adventure.</p>
      </div>
    `,
  };
}

function passwordResetTemplate(event) {
  // DASHBOARD_RESET_PASSWORD_URL should point at the admin dashboard's
  // ResetPasswordPage route (e.g. https://admin.example.com/reset-password).
  // It reads the token from a ?token= query param — see
  // admin-dashboard/src/pages/auth/ResetPasswordPage.jsx.
  const baseUrl = process.env.DASHBOARD_RESET_PASSWORD_URL || 'http://localhost:5173/reset-password';
  const resetLink = `${baseUrl}?token=${event.resetToken}`;

  return {
    subject: 'Reset your password',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#1a1a1a">Reset your password</h2>
        <p>Hi ${event.name},</p>
        <p>We received a request to reset your password. Click the link below to choose a new one:</p>
        <p><a href="${resetLink}" style="color:#5B5FEF">Reset my password</a></p>
        <p style="color:#666;font-size:13px">This link expires in 30 minutes. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  };
}

module.exports = {
  orderConfirmationTemplate,
  orderStatusTemplate,
  orderCancelledTemplate,
  userWelcomeTemplate,
  passwordResetTemplate,
};
