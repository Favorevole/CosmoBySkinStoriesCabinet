import nodemailer from 'nodemailer';
import config from '../config/environment.js';
import { getClientBotUsername } from '../clientBot/index.js';

function getBotUsername() {
  return getClientBotUsername() || 'skinstories_bot';
}

let transporter = null;

const LOGO_URL = 'https://bot.skinstories.ru/logo.jpg';
const SITE_URL = 'https://skinstories.ru';

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

function emailWrapper(content) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background: #F5F0EB; font-family: 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #F5F0EB; padding: 32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width: 560px; width: 100%;">
        <!-- Header with logo -->
        <tr><td align="center" style="padding-bottom: 28px;">
          <a href="${SITE_URL}" style="text-decoration: none;">
            <img src="${LOGO_URL}" alt="Skin Stories" width="140" style="display: block; height: auto;" />
          </a>
        </td></tr>
        <!-- Content card -->
        <tr><td style="background: #FFFFFF; border-radius: 20px; padding: 36px 32px; box-shadow: 0 2px 16px rgba(45, 36, 32, 0.06);">
          ${content}
        </td></tr>
        <!-- Footer -->
        <tr><td align="center" style="padding-top: 24px;">
          <p style="margin: 0; font-size: 13px; color: #8B7355; line-height: 1.5;">
            <a href="${SITE_URL}" style="color: #8B3A4A; text-decoration: none;">skinstories.ru</a>
          </p>
          <p style="margin: 8px 0 0; font-size: 12px; color: #B5A99A;">
            &copy; ${new Date().getFullYear()} Skin Stories. Все права защищены.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
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
  const content = `
    <h2 style="margin: 0 0 8px; color: #8B3A4A; font-size: 22px; font-weight: 600;">Оплата получена</h2>
    <p style="margin: 0 0 20px; font-size: 14px; color: #8B7355;">Заявка #${displayNumber}</p>

    <p style="margin: 0 0 12px; font-size: 16px; color: #2D2420; line-height: 1.6;">Здравствуйте!</p>
    <p style="margin: 0 0 12px; font-size: 16px; color: #2D2420; line-height: 1.6;">
      Ваша заявка <strong>#${displayNumber}</strong> успешно оплачена и передана специалисту.
    </p>
    <p style="margin: 0 0 20px; font-size: 16px; color: #2D2420; line-height: 1.6;">
      Эксперт изучит вашу анкету и фотографии, после чего вы получите персональные рекомендации по уходу за кожей.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background: #FAF8F5; border-radius: 12px; margin-bottom: 20px;">
      <tr><td style="padding: 16px 20px;">
        <p style="margin: 0 0 4px; font-size: 13px; color: #8B7355;">Номер заявки</p>
        <p style="margin: 0; font-size: 20px; font-weight: 700; color: #8B3A4A;">#${displayNumber}</p>
        <p style="margin: 8px 0 0; font-size: 12px; color: #B5A99A;">Сохраните на случай обращения</p>
      </td></tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #F5F0EB;">
      <tr><td style="padding-top: 16px;">
        <p style="margin: 0; font-size: 14px; color: #8B7355;">Ожидайте ответ в течение 24 часов. Рекомендации придут на этот email.</p>
      </td></tr>
    </table>
  `;

  return sendEmail({
    to,
    subject: `Заявка #${displayNumber} — оплата получена | Skin Stories`,
    text: `Здравствуйте!\n\nВаша заявка #${displayNumber} оплачена и отправлена специалисту.\nОбычно ответ приходит в течение 24 часов.\n\nНомер заявки: #${displayNumber}\nСохраните его на случай обращения.\n\nС заботой о вашей коже,\nКоманда Skin Stories`,
    html: emailWrapper(content)
  });
}

export async function sendPaymentReminderEmail({ to, displayNumber, paymentUrl }) {
  const content = `
    <h2 style="margin: 0 0 8px; color: #8B3A4A; font-size: 22px; font-weight: 600;">Напоминание об оплате</h2>
    <p style="margin: 0 0 20px; font-size: 14px; color: #8B7355;">Заявка #${displayNumber}</p>

    <p style="margin: 0 0 12px; font-size: 16px; color: #2D2420; line-height: 1.6;">Здравствуйте!</p>
    <p style="margin: 0 0 12px; font-size: 16px; color: #2D2420; line-height: 1.6;">
      Ваша заявка <strong>#${displayNumber}</strong> ожидает оплаты. После оплаты она будет передана специалисту для подготовки персональных рекомендаций.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
      <tr><td align="center">
        <a href="${paymentUrl}" style="display: inline-block; padding: 14px 36px; background: #8B3A4A; color: #ffffff; border-radius: 20px; text-decoration: none; font-size: 16px; font-weight: 600;">Перейти к оплате</a>
      </td></tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #F5F0EB;">
      <tr><td style="padding-top: 16px;">
        <p style="margin: 0; font-size: 14px; color: #8B7355;">Если вы уже оплатили заявку, проигнорируйте это письмо.</p>
      </td></tr>
    </table>
  `;

  return sendEmail({
    to,
    subject: `Напоминание: заявка #${displayNumber} ожидает оплаты | Skin Stories`,
    text: `Здравствуйте!\n\nВаша заявка #${displayNumber} ожидает оплаты.\nПерейдите по ссылке для оплаты: ${paymentUrl}\n\nЕсли вы уже оплатили, проигнорируйте это письмо.\n\nС заботой о вашей коже,\nКоманда Skin Stories`,
    html: emailWrapper(content)
  });
}

export async function sendRecommendationEmail(email, application, recommendation) {
  const appNum = application.displayNumber || application.id;
  const doctorName = application.doctor?.fullName || 'Специалист Skin Stories';

  let linksHtml = '';
  if (recommendation.links && Array.isArray(recommendation.links) && recommendation.links.length > 0) {
    linksHtml = `
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px; border-top: 1px solid #F5F0EB;">
        <tr><td style="padding-top: 20px;">
          <h3 style="margin: 0 0 12px; font-size: 16px; color: #8B3A4A;">Полезные ссылки</h3>
          ${recommendation.links.map(l => `
            <p style="margin: 0 0 8px;">
              <a href="${l.url}" style="color: #8B3A4A; text-decoration: underline; font-size: 15px;">${l.title}</a>
            </p>
          `).join('')}
        </td></tr>
      </table>
    `;
  }

  const content = `
    <h2 style="margin: 0 0 8px; color: #8B3A4A; font-size: 22px; font-weight: 600;">Ваши рекомендации готовы!</h2>
    <p style="margin: 0 0 24px; font-size: 14px; color: #8B7355;">Заявка #${appNum}</p>

    <!-- Doctor info -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background: #FAF8F5; border-radius: 12px; margin-bottom: 24px;">
      <tr><td style="padding: 16px 20px;">
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="width: 44px; vertical-align: middle;">
              <div style="width: 40px; height: 40px; background: #8B3A4A; border-radius: 20px; text-align: center; line-height: 40px; color: #fff; font-size: 16px; font-weight: 600;">
                ${doctorName.charAt(0)}
              </div>
            </td>
            <td style="padding-left: 12px; vertical-align: middle;">
              <p style="margin: 0; font-size: 15px; font-weight: 600; color: #2D2420;">${doctorName}</p>
              <p style="margin: 2px 0 0; font-size: 13px; color: #8B7355;">Ваш специалист</p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>

    <!-- Recommendation text -->
    <div style="font-size: 16px; color: #2D2420; line-height: 1.75; white-space: pre-wrap;">${recommendation.text}</div>

    ${linksHtml}

    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 28px; border-top: 1px solid #F5F0EB;">
      <tr><td align="center" style="padding-top: 24px;">
        <p style="margin: 0 0 12px; font-size: 14px; color: #8B7355;">Будем рады, если поделитесь впечатлениями о консультации</p>
        <a href="https://t.me/${getBotUsername()}" style="display: inline-block; padding: 12px 28px; background: #8B3A4A; color: #ffffff; border-radius: 20px; text-decoration: none; font-size: 14px; font-weight: 600;">Оставить отзыв</a>
      </td></tr>
    </table>
  `;

  return sendEmail({
    to: email,
    subject: `Рекомендации по заявке #${appNum} | Skin Stories`,
    text: `Ваши рекомендации готовы!\n\nЗаявка #${appNum}\nСпециалист: ${doctorName}\n\n${recommendation.text}\n\nС заботой о вашей коже,\nКоманда Skin Stories`,
    html: emailWrapper(content)
  });
}
