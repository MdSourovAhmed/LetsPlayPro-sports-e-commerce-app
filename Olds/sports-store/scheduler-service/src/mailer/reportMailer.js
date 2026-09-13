const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function topProductsRows(products) {
  if (!products.length) return "<tr><td colspan='2'>No sales data</td></tr>";
  return products
    .map(
      (p, i) =>
        `<tr>
           <td>${i + 1}. ${p.name}</td>
           <td style="text-align:right;font-weight:bold">${p.totalSold} units</td>
         </tr>`
    )
    .join("");
}

function buildReportHtml(report) {
  const { summary, from, to, interval } = report;
  const title = `${interval.charAt(0).toUpperCase() + interval.slice(1)} Report`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: Arial, sans-serif; background:#f4f4f4; margin:0; padding:0; }
    .container { max-width:640px; margin:40px auto; background:#fff; border-radius:8px; overflow:hidden; }
    .header { background:#1a1a2e; color:#fff; padding:28px 32px; }
    .header h1 { margin:0; font-size:22px; }
    .header p  { margin:6px 0 0; font-size:13px; opacity:0.7; }
    .body { padding:32px; color:#333; }
    .kpi-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; margin-bottom:32px; }
    .kpi { background:#f8fafc; border-radius:8px; padding:16px; text-align:center; }
    .kpi .value { font-size:28px; font-weight:bold; color:#1a1a2e; }
    .kpi .label { font-size:12px; color:#888; margin-top:4px; }
    .kpi.green .value { color:#166534; }
    .kpi.red   .value { color:#991b1b; }
    .kpi.amber .value { color:#713f12; }
    h3 { font-size:15px; color:#1a1a2e; border-bottom:2px solid #f0f0f0; padding-bottom:8px; }
    table { width:100%; border-collapse:collapse; margin:8px 0 24px; }
    td { padding:10px 4px; border-bottom:1px solid #f0f0f0; font-size:14px; }
    .footer { background:#f8fafc; padding:20px 32px; font-size:12px; color:#999; text-align:center; }
  </style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>Sports Store — ${title}</h1>
    <p>${formatDate(from)} → ${formatDate(to)}</p>
  </div>
  <div class="body">
    <div class="kpi-grid">
      <div class="kpi green">
        <div class="value">${summary.totalOrders}</div>
        <div class="label">Total orders</div>
      </div>
      <div class="kpi green">
        <div class="value">$${summary.totalRevenue.toFixed(2)}</div>
        <div class="label">Revenue</div>
      </div>
      <div class="kpi red">
        <div class="value">${summary.cancelledOrders}</div>
        <div class="label">Cancelled</div>
      </div>
      <div class="kpi">
        <div class="value">${summary.newProducts}</div>
        <div class="label">New products</div>
      </div>
      <div class="kpi">
        <div class="value">${summary.stockUpdates}</div>
        <div class="label">Stock updates</div>
      </div>
      <div class="kpi amber">
        <div class="value">${summary.lowStockAlerts}</div>
        <div class="label">Low stock alerts</div>
      </div>
    </div>

    <h3>Top products by units sold</h3>
    <table>${topProductsRows(summary.topProducts)}</table>

    <p style="font-size:13px;color:#999">
      Report generated from ${report.rawEventCount} logged events.
    </p>
  </div>
  <div class="footer">Automated report from Sports Store. Adjust interval in Admin Panel.</div>
</div>
</body>
</html>`;
}

async function sendReportEmail(report, recipientEmail) {
  const intervalLabel = report.interval.charAt(0).toUpperCase() + report.interval.slice(1);
  await transporter.sendMail({
    from: `"Sports Store Reports" <${process.env.SMTP_USER}>`,
    to: recipientEmail,
    subject: `${intervalLabel} Report — ${formatDate(report.from)} to ${formatDate(report.to)}`,
    html: buildReportHtml(report),
  });
  console.log(`Report email sent to ${recipientEmail}`);
}

module.exports = { sendReportEmail };