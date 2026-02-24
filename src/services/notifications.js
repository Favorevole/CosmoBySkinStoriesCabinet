import config from '../config/environment.js';
import { getAllAdmins } from '../db/admins.js';
import { formatSkinType, formatPriceRange } from '../clientBot/states/index.js';

let clientBot = null;
let doctorBot = null;

export function setClientBot(bot) {
  clientBot = bot;
}

export function setDoctorBot(bot) {
  doctorBot = bot;
}

// Helper to send message to admins via doctor bot
async function sendToAdminsViaDoctorBot(message, parseMode = 'Markdown') {
  if (!doctorBot) {
    console.log('[NOTIFICATIONS] Doctor bot not initialized, skipping doctor bot notification');
    return 0;
  }

  try {
    const admins = await getAllAdmins();
    const adminIds = new Set([
      ...admins.map(a => a.telegramId),
      ...config.adminTelegramIds
    ]);

    let sent = 0;
    for (const adminId of adminIds) {
      try {
        await doctorBot.telegram.sendMessage(Number(adminId), message, {
          parse_mode: parseMode
        });
        sent++;
      } catch (error) {
        // Admin might not have started doctor bot yet
        console.log(`[NOTIFICATIONS] Could not send to admin ${adminId} via doctor bot:`, error.message);
      }
    }
    return sent;
  } catch (error) {
    console.error('[NOTIFICATIONS] Error sending to admins via doctor bot:', error);
    return 0;
  }
}

// Notify all admins about new application
export async function notifyAdminsNewApplication(application) {
  const appNum = application.displayNumber || application.id;
  const clientName = application.client.fullName || application.client.telegramUsername || 'Не указано';
  const source = application.source === 'WEB' ? '🌐 Сайт' : '✈️ Telegram';
  const problems = application.mainProblems || 'Не указаны';

  const message = `📋 *Новая заявка #${appNum}*

━━━━━━━━━━━━━━━━━━
👤 *Клиент:* ${clientName}
📍 *Источник:* ${source}
━━━━━━━━━━━━━━━━━━

🔹 *Возраст:* ${application.age}
🔹 *Тип кожи:* ${formatSkinType(application.skinType)}
🔹 *Бюджет:* ${application.priceRange ? formatPriceRange(application.priceRange) : 'Не указан'}
🔹 *Проблемы:* ${problems}
📷 *Фото:* ${application.photos?.length || 0} шт.
${application.additionalComment ? `💬 *Комментарий:* ${application.additionalComment}` : ''}
━━━━━━━━━━━━━━━━━━

👉 Назначьте врача в админ-панели.`;

  // Send via doctor bot to admins only
  const sentViaDoctorBot = await sendToAdminsViaDoctorBot(message);
  console.log(`[NOTIFICATIONS] Notified ${sentViaDoctorBot} admins via doctor bot about application #${application.id}`);
}

// Notify doctor about assigned application
export async function notifyDoctorAssignment(doctor, application) {
  if (!doctorBot) {
    console.log('[NOTIFICATIONS] Doctor bot not initialized, skipping doctor notification');
    return;
  }

  try {
    const { Markup } = await import('telegraf');

    const appNum = application.displayNumber || application.id;
    const problems = application.mainProblems || 'Не указаны';

    const message = `🩺 *Вам назначена заявка #${appNum}*

━━━━━━━━━━━━━━━━━━
🔹 *Возраст:* ${application.age}
🔹 *Тип кожи:* ${formatSkinType(application.skinType)}
🔹 *Бюджет:* ${application.priceRange ? formatPriceRange(application.priceRange) : 'Не указан'}
🔹 *Проблемы:* ${problems}
📷 *Фото:* ${application.photos?.length || 0} шт.
${application.additionalComment ? `💬 *Комментарий:* ${application.additionalComment}` : ''}
━━━━━━━━━━━━━━━━━━

Ознакомьтесь с заявкой и подготовьте рекомендации.`;

    if (!doctor.telegramId) {
      console.log(`[NOTIFICATIONS] Doctor ${doctor.id} has no telegramId, skipping notification`);
      return;
    }

    await doctorBot.telegram.sendMessage(Number(doctor.telegramId), message, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('Посмотреть заявку', `view_app_${application.id}`)]
      ])
    });

    console.log(`[NOTIFICATIONS] Notified doctor ${doctor.id} about application #${application.id}`);
  } catch (error) {
    console.error('[NOTIFICATIONS] Error notifying doctor:', error);
  }

  // Cabinet notification
  try {
    const { createCabinetNotification } = await import('./notifications-cabinet.js');
    const appNum = application.displayNumber || application.id;
    await createCabinetNotification(
      doctor.id,
      'NEW_APPLICATION',
      `Новая заявка #${appNum}`,
      `Вам назначена заявка #${appNum}. Возраст: ${application.age}, тип кожи: ${formatSkinType(application.skinType)}.`,
      application.id
    );
  } catch (e) {
    console.error('[NOTIFICATIONS] Cabinet notification error:', e.message);
  }
}

// Escape Telegram Markdown v1 special characters
function escapeMarkdown(text) {
  return text.replace(/([_*`\[])/g, '\\$1');
}

// Notify client about ready recommendation
export async function notifyClientRecommendation(application) {
  // Web clients: send via email
  if (!application.client.telegramId && application.client.email) {
    try {
      const { sendRecommendationEmail } = await import('./email.js');
      await sendRecommendationEmail(
        application.client.email,
        application,
        application.recommendation
      );
      console.log(`[NOTIFICATIONS] Sent recommendation via email to client ${application.client.id}`);
    } catch (error) {
      console.error('[NOTIFICATIONS] Error sending email recommendation:', error);
    }
    return;
  }

  if (!clientBot) {
    console.log('[NOTIFICATIONS] Client bot not initialized, skipping client notification');
    return;
  }

  if (!application.client.telegramId) {
    console.log('[NOTIFICATIONS] Client has no telegramId and no email, skipping notification');
    return;
  }

  try {
    const recommendation = application.recommendation;

    const appNum = application.displayNumber || application.id;
    const escapedText = escapeMarkdown(recommendation.text);
    let message = `
*Ваши рекомендации готовы!*

Заявка #${appNum}

${escapedText}
`;

    // Add links if present
    if (recommendation.links && Array.isArray(recommendation.links) && recommendation.links.length > 0) {
      message += '\n*Полезные ссылки:*\n';
      for (const link of recommendation.links) {
        message += `• [${link.title}](${link.url})\n`;
      }
    }

    message += '\nСпасибо, что выбрали нас!';

    try {
      await clientBot.telegram.sendMessage(Number(application.client.telegramId), message, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      });
    } catch (mdErr) {
      // Fallback: send without Markdown if parsing fails
      console.warn('[NOTIFICATIONS] Markdown send failed, retrying plain text:', mdErr.message);
      let plainMessage = `Ваши рекомендации готовы!\n\nЗаявка #${appNum}\n\n${recommendation.text}\n`;
      if (recommendation.links && Array.isArray(recommendation.links) && recommendation.links.length > 0) {
        plainMessage += '\nПолезные ссылки:\n';
        for (const link of recommendation.links) {
          plainMessage += `• ${link.title}: ${link.url}\n`;
        }
      }
      plainMessage += '\nСпасибо, что выбрали нас!';
      await clientBot.telegram.sendMessage(Number(application.client.telegramId), plainMessage, {
        disable_web_page_preview: true
      });
    }

    // Send review request after a short delay
    try {
      const { Markup } = await import('telegraf');
      const reviewMessage = `Будем рады вашему отзыву! Оцените нашу работу:`;

      await clientBot.telegram.sendMessage(
        Number(application.client.telegramId),
        reviewMessage,
        {
          ...Markup.inlineKeyboard([
            [
              Markup.button.callback('1', `review_1_${application.id}`),
              Markup.button.callback('2', `review_2_${application.id}`),
              Markup.button.callback('3', `review_3_${application.id}`),
              Markup.button.callback('4', `review_4_${application.id}`),
              Markup.button.callback('5', `review_5_${application.id}`)
            ]
          ])
        }
      );
    } catch (reviewError) {
      console.error('[NOTIFICATIONS] Error sending review request:', reviewError);
    }

    console.log(`[NOTIFICATIONS] Sent recommendation to client ${application.client.id}`);
  } catch (error) {
    console.error('[NOTIFICATIONS] Error notifying client:', error);
  }
}

// Notify admins about doctor response with interactive buttons
export async function notifyAdminsDoctorResponse(application) {
  if (!doctorBot) {
    console.log('[NOTIFICATIONS] Doctor bot not initialized, skipping notification');
    return 0;
  }

  try {
    const { Markup } = await import('telegraf');
    const { formatSkinType } = await import('../clientBot/states/index.js');

    const appNum = application.displayNumber || application.id;
    const clientName = application.client.fullName || application.client.telegramUsername || 'Не указано';
    const problems = application.mainProblems || 'Не указаны';

    const message = `✅ *Ответ врача по заявке #${appNum}*

━━━━━━━━━━━━━━━━━━
👨‍⚕️ *Врач:* ${application.doctor.fullName}
👤 *Клиент:* ${clientName}
━━━━━━━━━━━━━━━━━━

🔹 *Возраст:* ${application.age}
🔹 *Тип кожи:* ${formatSkinType(application.skinType)}
🔹 *Проблемы:* ${problems}
📷 *Фото:* ${application.photos?.length || 0} шт.

Проверьте рекомендации и утвердите отправку.`;

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('📋 Показать заявку', `admin_view_${application.id}`)],
      [
        Markup.button.callback('🖼 Фото', `admin_photos_${application.id}`),
        Markup.button.callback('📝 Ответ врача', `admin_rec_${application.id}`)
      ],
      [Markup.button.callback('✅ Утвердить и отправить', `admin_approve_${application.id}`)]
    ]);

    const admins = await getAllAdmins();
    const adminIds = new Set([
      ...admins.map(a => a.telegramId),
      ...config.adminTelegramIds
    ]);

    let sent = 0;
    for (const adminId of adminIds) {
      try {
        await doctorBot.telegram.sendMessage(Number(adminId), message, {
          parse_mode: 'Markdown',
          ...keyboard
        });
        sent++;
      } catch (error) {
        console.log(`[NOTIFICATIONS] Could not send to admin ${adminId}:`, error.message);
      }
    }
    return sent;
  } catch (error) {
    console.error('[NOTIFICATIONS] Error sending doctor response notification:', error);
    return 0;
  }
}

// Notify admins about declined application
export async function notifyAdminsDecline(application, reason) {
  const message = `
*Врач отклонил заявку #${application.displayNumber || application.id}*

Врач: ${application.doctor.fullName}
Причина: ${reason}

Необходимо назначить другого врача.
`;

  // Primary: send via doctor bot
  await sendToAdminsViaDoctorBot(message);
}

// Send payment reminder to client
export async function sendPaymentReminder(application, confirmationUrl) {
  const appNum = application.displayNumber || application.id;

  // Send via Telegram if client has telegramId
  if (application.client?.telegramId && clientBot) {
    try {
      const { Markup } = await import('telegraf');
      const message = `Привет! Ваша заявка #${appNum} всё ещё ждёт 🤍\n\n` +
        'Врач готов начать работу — осталось только оплатить.\n' +
        'Если передумали — ничего страшного, можно отменить заявку.';

      await clientBot.telegram.sendMessage(
        Number(application.client.telegramId),
        message,
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.callback('🏷 Ввести промокод', `promo_for_${application.id}`)],
            [Markup.button.url(`💳 Оплатить`, confirmationUrl)],
            [Markup.button.callback('❌ Отменить заявку', `cancel_app_${application.id}`)]
          ])
        }
      );
      console.log(`[NOTIFICATIONS] Payment reminder sent via Telegram to client ${application.client.id}`);
      return 'telegram';
    } catch (error) {
      console.error('[NOTIFICATIONS] Error sending Telegram reminder:', error.message);
    }
  }

  // Send via email if client has email
  if (application.client?.email) {
    try {
      const { sendPaymentReminderEmail } = await import('./email.js');
      await sendPaymentReminderEmail({
        to: application.client.email,
        displayNumber: appNum,
        paymentUrl: confirmationUrl
      });
      console.log(`[NOTIFICATIONS] Payment reminder sent via email to ${application.client.email}`);
      return 'email';
    } catch (error) {
      console.error('[NOTIFICATIONS] Error sending email reminder:', error.message);
    }
  }

  console.log('[NOTIFICATIONS] No contact method for payment reminder');
  return null;
}

// Store pending photo requests (applicationId -> clientTelegramId)
export const pendingPhotoRequests = new Map();

// Request additional photos from client
export async function requestAdditionalPhotos(application, doctor) {
  if (!clientBot) {
    console.log('[NOTIFICATIONS] Client bot not initialized');
    return false;
  }

  if (!application.client.telegramId) {
    console.log('[NOTIFICATIONS] Client has no telegramId');
    return false;
  }

  try {
    const { Markup } = await import('telegraf');

    const appNum2 = application.displayNumber || application.id;
    const message = `
*Врач запрашивает дополнительные фотографии*

Заявка #${appNum2}
Врач: ${doctor.fullName}

Пожалуйста, отправьте дополнительные фотографии для более точной консультации.
После отправки нажмите кнопку "Готово".
`;

    // Store the pending request
    pendingPhotoRequests.set(Number(application.client.telegramId), {
      applicationId: application.id,
      displayNumber: application.displayNumber || application.id,
      doctorId: doctor.id,
      doctorName: doctor.fullName,
      photos: []
    });

    await clientBot.telegram.sendMessage(Number(application.client.telegramId), message, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('Фото отправлены ✓', `additional_photos_done_${application.id}`)]
      ])
    });

    console.log(`[NOTIFICATIONS] Photo request sent to client for application #${application.id}`);
    return true;
  } catch (error) {
    console.error('[NOTIFICATIONS] Error requesting photos:', error);
    return false;
  }
}

// Notify doctor about new photos from client
export async function notifyDoctorNewPhotos(applicationId, doctorId, photoCount) {
  if (!doctorBot) {
    console.log('[NOTIFICATIONS] Doctor bot not initialized');
    return;
  }

  try {
    const prisma = (await import('../db/prisma.js')).default;
    const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });

    if (!doctor) return;

    const { Markup } = await import('telegraf');

    const appForNum = await prisma.application.findUnique({ where: { id: applicationId }, select: { displayNumber: true } });
    const appNum3 = appForNum?.displayNumber || applicationId;
    const message = `
*Клиент отправил дополнительные фотографии*

Заявка #${appNum3}
Добавлено фото: ${photoCount}

Нажмите кнопку для просмотра:
`;

    if (!doctor.telegramId) {
      console.log(`[NOTIFICATIONS] Doctor ${doctorId} has no telegramId, skipping photo notification`);
      return;
    }

    await doctorBot.telegram.sendMessage(Number(doctor.telegramId), message, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('Посмотреть заявку', `view_app_${applicationId}`)]
      ])
    });

    console.log(`[NOTIFICATIONS] Notified doctor ${doctorId} about ${photoCount} new photos for application #${applicationId}`);
  } catch (error) {
    console.error('[NOTIFICATIONS] Error notifying doctor about new photos:', error);
  }

  // Cabinet notification
  try {
    const { createCabinetNotification } = await import('./notifications-cabinet.js');
    const appForNotif = await prisma.application.findUnique({ where: { id: applicationId }, select: { displayNumber: true } });
    const num = appForNotif?.displayNumber || applicationId;
    await createCabinetNotification(
      doctorId,
      'NEW_PHOTOS',
      `Новые фото к заявке #${num}`,
      `Клиент добавил ${photoCount} фото к заявке #${num}.`,
      applicationId
    );
  } catch (e) {
    console.error('[NOTIFICATIONS] Cabinet photo notification error:', e.message);
  }
}

// Notify doctor about approval status change
export async function notifyDoctorStatusApproved(doctor) {
  if (!doctorBot) {
    console.log('[NOTIFICATIONS] Doctor bot not initialized');
    return;
  }

  if (!doctor.telegramId) {
    console.log(`[NOTIFICATIONS] Doctor ${doctor.id} has no telegramId, skipping approval notification`);
    return;
  }

  try {
    const message = `
*Вы подтверждены как врач!*

Теперь вы можете получать заявки на консультации.

Администратор будет назначать вам заявки, и вы будете получать уведомления.
`;

    await doctorBot.telegram.sendMessage(Number(doctor.telegramId), message, {
      parse_mode: 'Markdown'
    });

    console.log(`[NOTIFICATIONS] Notified doctor ${doctor.id} about approval`);
  } catch (error) {
    console.error('[NOTIFICATIONS] Error notifying doctor about approval:', error);
  }
}

/**
 * Notify admins about new doctor registration (email or bot)
 */
export async function notifyAdminsNewDoctor(doctor) {
  if (!clientBot) {
    console.log('[NOTIFICATIONS] Client bot not initialized, skipping new doctor notification');
    return;
  }

  try {
    const admins = await getAllAdmins();
    const adminIds = new Set([
      ...admins.map(a => a.telegramId),
      ...config.adminTelegramIds
    ]);

    const contactInfo = doctor.email
      ? `Email: ${doctor.email}`
      : `Username: @${doctor.telegramUsername || 'не указан'}`;

    const message = `*Новая заявка на регистрацию врача*\n\nФИО: ${doctor.fullName}\n${contactInfo}\n\nОткройте админ-панель для подтверждения.`;

    for (const adminId of adminIds) {
      try {
        await clientBot.telegram.sendMessage(Number(adminId), message, {
          parse_mode: 'Markdown'
        });
      } catch (e) {
        console.error(`[NOTIFICATIONS] Failed to notify admin ${adminId}:`, e.message);
      }
    }
  } catch (error) {
    console.error('[NOTIFICATIONS] Error notifying admins about new doctor:', error);
  }
}
