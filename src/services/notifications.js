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
  const message = `
*Новая заявка #${application.id}*

Возраст: ${application.age}
Тип кожи: ${formatSkinType(application.skinType)}
Бюджет: ${application.priceRange ? formatPriceRange(application.priceRange) : 'Не указан'}
Проблемы: ${application.mainProblems}
${application.additionalComment ? `Комментарий: ${application.additionalComment}` : ''}

Клиент: ${application.client.fullName || application.client.telegramUsername || 'Не указано'}

Откройте админ-панель для назначения врача.
`;

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

    const message = `
*Вам назначена новая заявка #${application.id}*

Возраст пациента: ${application.age}
Тип кожи: ${formatSkinType(application.skinType)}
Бюджет: ${application.priceRange ? formatPriceRange(application.priceRange) : 'Не указан'}
Проблемы: ${application.mainProblems}
${application.additionalComment ? `Комментарий: ${application.additionalComment}` : ''}
Фотографий: ${application.photos?.length || 0}

Нажмите кнопку для просмотра:
`;

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
}

// Notify client about ready recommendation
export async function notifyClientRecommendation(application) {
  if (!clientBot) {
    console.log('[NOTIFICATIONS] Client bot not initialized, skipping client notification');
    return;
  }

  if (!application.client.telegramId) {
    console.log('[NOTIFICATIONS] Client has no telegramId, skipping notification');
    return;
  }

  try {
    const recommendation = application.recommendation;

    let message = `
*Ваши рекомендации готовы!*

Заявка #${application.id}

${recommendation.text}
`;

    // Add links if present
    if (recommendation.links && Array.isArray(recommendation.links) && recommendation.links.length > 0) {
      message += '\n*Полезные ссылки:*\n';
      for (const link of recommendation.links) {
        message += `• [${link.title}](${link.url})\n`;
      }
    }

    message += '\nСпасибо, что выбрали нас!';

    await clientBot.telegram.sendMessage(Number(application.client.telegramId), message, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });

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

    const message = `
*Врач дал ответ по заявке #${application.id}*

*Врач:* ${application.doctor.fullName}
*Клиент:* ${application.client.fullName || application.client.telegramUsername || 'Не указано'}

*Анкета:*
• Возраст: ${application.age}
• Тип кожи: ${formatSkinType(application.skinType)}
• Проблемы: ${application.mainProblems}
• Фото: ${application.photos?.length || 0}
`;

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
*Врач отклонил заявку #${application.id}*

Врач: ${application.doctor.fullName}
Причина: ${reason}

Необходимо назначить другого врача.
`;

  // Primary: send via doctor bot
  await sendToAdminsViaDoctorBot(message);
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

    const message = `
*Врач запрашивает дополнительные фотографии*

Заявка #${application.id}
Врач: ${doctor.fullName}

Пожалуйста, отправьте дополнительные фотографии для более точной консультации.
После отправки нажмите кнопку "Готово".
`;

    // Store the pending request
    pendingPhotoRequests.set(Number(application.client.telegramId), {
      applicationId: application.id,
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

    const message = `
*Клиент отправил дополнительные фотографии*

Заявка #${applicationId}
Добавлено фото: ${photoCount}

Нажмите кнопку для просмотра:
`;

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
}

// Notify doctor about approval status change
export async function notifyDoctorStatusApproved(doctor) {
  if (!doctorBot) {
    console.log('[NOTIFICATIONS] Doctor bot not initialized');
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
