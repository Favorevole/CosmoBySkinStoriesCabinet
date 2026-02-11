import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log('[EMAIL] SMTP not configured — emails will be logged to console');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT) || 587,
    secure: (parseInt(SMTP_PORT) || 587) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });

  return transporter;
}

export async function sendRecommendationEmail(email, application, recommendation) {
  const subject = `Ваши рекомендации по заявке #${application.displayNumber || application.id} — Skin Stories`;

  let linksHtml = '';
  if (recommendation.links && Array.isArray(recommendation.links) && recommendation.links.length > 0) {
    linksHtml = `
      <h3 style="color: #8B3A4A; margin-top: 24px;">Полезные ссылки:</h3>
      <ul>
        ${recommendation.links.map(l => `<li><a href="${l.url}" style="color: #8B3A4A;">${l.title}</a></li>`).join('')}
      </ul>
    `;
  }

  const html = `
    <div style="font-family: 'Manrope', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #FAF8F5;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-family: 'Playfair Display', Georgia, serif; color: #2D2420; font-weight: 400; font-size: 28px;">
          Skin Stories
        </h1>
      </div>
      <div style="background: #FFFFFF; border-radius: 16px; padding: 32px; box-shadow: 0 2px 12px rgba(45, 36, 32, 0.06);">
        <h2 style="color: #8B3A4A; font-size: 22px; margin-bottom: 16px;">
          Ваши рекомендации готовы!
        </h2>
        <p style="color: #5C4A3D; font-size: 14px; margin-bottom: 24px;">
          Заявка #${application.displayNumber || application.id}
        </p>
        <div style="color: #2D2420; font-size: 16px; line-height: 1.7; white-space: pre-wrap;">
          ${recommendation.text}
        </div>
        ${linksHtml}
      </div>
      <p style="text-align: center; color: #5C4A3D; font-size: 14px; margin-top: 32px;">
        Спасибо, что выбрали Skin Stories!
      </p>
    </div>
  `;

  const transport = getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@skinstories.ru';

  if (!transport) {
    console.log('[EMAIL] === Email to console (SMTP not configured) ===');
    console.log(`[EMAIL] To: ${email}`);
    console.log(`[EMAIL] Subject: ${subject}`);
    console.log(`[EMAIL] Recommendation: ${recommendation.text}`);
    console.log('[EMAIL] =============================================');
    return;
  }

  await transport.sendMail({
    from,
    to: email,
    subject,
    html
  });

  console.log(`[EMAIL] Recommendation sent to ${email} for application #${application.id}`);
}
