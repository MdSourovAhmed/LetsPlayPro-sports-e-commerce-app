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

async function sendMail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME || "Sports Store"}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to} — Message ID: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`Email failed to ${to}:`, err.message);
    throw err;
  }
}

module.exports = { sendMail };