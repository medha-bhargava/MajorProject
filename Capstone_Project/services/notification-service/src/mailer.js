const nodemailer = require('nodemailer');

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port: Number(process.env.SMTP_PORT || 1025),
    secure: false,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined
  });
}

async function sendOperationalEmail(subject, text) {
  if (process.env.DISABLE_EMAIL === 'true') return;
  const transporter = createTransport();
  await transporter.sendMail({
    from: process.env.MAIL_FROM || 'inventory-alerts@example.com',
    to: process.env.OPERATIONS_EMAIL || 'operations@example.com',
    subject,
    text
  });
}

module.exports = { sendOperationalEmail };

