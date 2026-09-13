function baseLayout(title, content) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; overflow: hidden; }
    .header { background: #1a1a2e; color: #fff; padding: 24px 32px; }
    .header h1 { margin: 0; font-size: 20px; }
    .body { padding: 32px; color: #333; }
    .status-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 13px; margin: 8px 0; }
    .status-processing { background: #dbeafe; color: #1e40af; }
    .status-shipped    { background: #d1fae5; color: #065f46; }
    .status-delivered  { background: #dcfce7; color: #166534; }
    .status-cancelled  { background: #fee2e2; color: #991b1b; }
    .status-pending    { background: #fef9c3; color: #713f12; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th { background: #f1f5f9; text-align: left; padding: 10px 12px; font-size: 13px; color: #555; }
    td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
    .total { font-weight: bold; font-size: 16px; margin-top: 12px; }
    .footer { background: #f8fafc; padding: 20px 32px; font-size: 12px; color: #999; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Sports Store — ${title}</h1></div>
    <div class="body">${content}</div>
    <div class="footer">This is an automated message. Please do not reply directly to this email.</div>
  </div>
</body>
</html>`;
}

function orderItemsTable(items) {
  const rows = items
    .map(
      (i) => `<tr>
        <td>${i.name}</td>
        <td>${i.quantity}</td>
        <td>$${(i.price * i.quantity).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  return `
    <table>
      <thead><tr><th>Product</th><th>Qty</th><th>Subtotal</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

exports.orderConfirmationTemplate = (payload) =>
  baseLayout(
    "Order Confirmed",
    `<p>Hi there,</p>
     <p>Thank you for your order! We've received it and it's being processed.</p>
     <p><strong>Order ID:</strong> ${payload.orderId}</p>
     <p><strong>Payment:</strong> ${payload.paymentMethod}</p>
     ${orderItemsTable(payload.items)}
     <p class="total">Total: $${payload.totalAmount.toFixed(2)}</p>
     <p>We'll email you again when your order ships.</p>`
  );

exports.orderStatusTemplate = (payload) => {
  const statusClass = `status-${payload.status}`;
  const messages = {
    processing: "Your order is now being prepared.",
    shipped: "Great news — your order is on its way!",
    delivered: "Your order has been delivered. Enjoy!",
    cancelled: "Your order has been cancelled. If this was unexpected, please contact support.",
  };

  return baseLayout(
    "Order Update",
    `<p>Hi there,</p>
     <p>There's an update on your order <strong>${payload.orderId}</strong>.</p>
     <p>New status: <span class="status-badge ${statusClass}">${payload.status.toUpperCase()}</span></p>
     <p>${messages[payload.status] || ""}</p>
     ${payload.reason ? `<p><em>Reason: ${payload.reason}</em></p>` : ""}`
  );
};

exports.lowStockAlertTemplate = (payload) =>
  baseLayout(
    "Low Stock Alert",
    `<p>Admin alert — the following product is running low on stock.</p>
     <table>
       <thead><tr><th>Product</th><th>Remaining Stock</th></tr></thead>
       <tbody>
         <tr><td>${payload.name}</td><td style="color:#c0392b;font-weight:bold">${payload.currentStock}</td></tr>
       </tbody>
     </table>
     <p>Please restock as soon as possible.</p>`
  );