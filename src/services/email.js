import nodemailer from 'nodemailer';
import config from '../config/environment.js';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!config.smtp.user || !config.smtp.pass) {
    console.log('[EMAIL] SMTP not configured — emails will be logged to console');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
  });

  return transporter;
}

export async function sendEmail({ to, subject, text, html }) {
  const transport = getTransporter();
  const from = `"Skin Stories" <${config.smtp.from}>`;

  if (!transport) {
    console.log(`[EMAIL] (no SMTP) To: ${to} | Subject: ${subject}`);
    return null;
  }

  const info = await transport.sendMail({ from, to, subject, text, html });
  console.log(`[EMAIL] Sent to ${to}: ${info.messageId}`);
  return info;
}

export async function sendPaymentConfirmation({ to, displayNumber }) {
  return sendEmail({
    to,
    subject: `Заявка #${displayNumber} — оплата получена`,
    text: `Здравствуйте!\n\nВаша заявка #${displayNumber} оплачена и отправлена специалисту.\nОбычно ответ приходит в течение 24 часов.\n\nНомер заявки: #${displayNumber}\nСохраните его на случай обращения.\n\nС заботой о вашей коже,\nКоманда Skin Stories`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #2D2420;">
        <h2 style="color: #8B3A4A; font-size: 24px;">Заявка #${displayNumber} принята</h2>
        <p>Здравствуйте!</p>
        <p>Ваша заявка <strong>#${displayNumber}</strong> оплачена и отправлена специалисту.</p>
        <p>Обычно ответ приходит в течение <strong>24 часов</strong>.</p>
        <div style="background: #FAF8F5; border-radius: 12px; padding: 16px 20px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #5C4A3D;">Номер вашей заявки: <strong>#${displayNumber}</strong><br>Сохраните его на случай обращения.</p>
        </div>
        <p style="color: #5C4A3D; font-size: 14px;">С заботой о вашей коже,<br>Команда Skin Stories</p>
      </div>
    `
  });
}

export async function sendRecommendationEmail(email, application, recommendation) {
  const appNum = application.displayNumber || application.id;

  let linksHtml = '';
  if (recommendation.links && Array.isArray(recommendation.links) && recommendation.links.length > 0) {
    linksHtml = `
      <h3 style="color: #8B3A4A; margin-top: 24px;">Полезные ссылки:</h3>
      <ul>
        ${recommendation.links.map(l => `<li><a href="${l.url}" style="color: #8B3A4A;">${l.title}</a></li>`).join('')}
      </ul>
    `;
  }

  return sendEmail({
    to: email,
    subject: `Рекомендации по заявке #${appNum} — Skin Stories`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #FAF8F5;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #2D2420; font-weight: 400; font-size: 28px;">Skin Stories</h1>
        </div>
        <div style="background: #FFFFFF; border-radius: 16px; padding: 32px; box-shadow: 0 2px 12px rgba(45, 36, 32, 0.06);">
          <h2 style="color: #8B3A4A; font-size: 22px; margin-bottom: 16px;">Ваши рекомендации готовы!</h2>
          <p style="color: #5C4A3D; font-size: 14px; margin-bottom: 24px;">Заявка #${appNum}</p>
          <div style="color: #2D2420; font-size: 16px; line-height: 1.7; white-space: pre-wrap;">${recommendation.text}</div>
          ${linksHtml}
        </div>
        <p style="text-align: center; color: #5C4A3D; font-size: 14px; margin-top: 32px;">Спасибо, что выбрали Skin Stories!</p>
      </div>
    `
  });
}
