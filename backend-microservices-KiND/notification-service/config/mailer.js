const nodemailer = require('nodemailer');
const dotenv=require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendMail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    console.log(`[Mailer] sent to ${to} — ${info.messageId}`);
  } catch (err) {
    console.error('[Mailer] failed:', err.message);
  }
}

module.exports = { sendMail };
