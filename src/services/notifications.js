import config from '../config/environment.js';
import { getAllAdmins } from '../db/admins.js';
import { formatSkinType } from '../clientBot/states/index.js';

let clientBot = null;
let doctorBot = null;

export function setClientBot(bot) {
  clientBot = bot;
}

export function setDoctorBot(bot) {
  doctorBot = bot;
}

// Notify all admins about new application
export async function notifyAdminsNewApplication(application) {
  if (!clientBot) {
    console.log('[NOTIFICATIONS] Client bot not initialized, skipping admin notification');
    return;
  }

  try {
    const admins = await getAllAdmins();

    // Also notify config-defined admins
    const adminIds = new Set([
      ...admins.map(a => a.telegramId),
      ...config.adminTelegramIds
    ]);

    const message = `
*Новая заявка #${application.id}*

Возраст: ${application.age}
Тип кожи: ${formatSkinType(application.skinType)}
Проблемы: ${application.mainProblems}
${application.additionalComment ? `Комментарий: ${application.additionalComment}` : ''}

Клиент: ${application.client.fullName || application.client.telegramUsername || 'Не указано'}

Откройте админ-панель для назначения врача.
`;

    for (const adminId of adminIds) {
      try {
        await clientBot.telegram.sendMessage(Number(adminId), message, {
          parse_mode: 'Markdown'
        });
      } catch (error) {
        console.error(`[NOTIFICATIONS] Failed to notify admin ${adminId}:`, error.message);
      }
    }

    console.log(`[NOTIFICATIONS] Notified ${adminIds.size} admins about application #${application.id}`);
  } catch (error) {
    console.error('[NOTIFICATIONS] Error notifying admins:', error);
  }
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

// Notify admins about doctor response
export async function notifyAdminsDoctorResponse(application) {
  if (!clientBot) {
    console.log('[NOTIFICATIONS] Client bot not initialized');
    return;
  }

  try {
    const admins = await getAllAdmins();
    const adminIds = new Set([
      ...admins.map(a => a.telegramId),
      ...config.adminTelegramIds
    ]);

    const message = `
*Врач дал ответ по заявке #${application.id}*

Врач: ${application.doctor.fullName}
Клиент: ${application.client.fullName || application.client.telegramUsername || 'Не указано'}

Откройте админ-панель для проверки и одобрения.
`;

    for (const adminId of adminIds) {
      try {
        await clientBot.telegram.sendMessage(Number(adminId), message, {
          parse_mode: 'Markdown'
        });
      } catch (error) {
        console.error(`[NOTIFICATIONS] Failed to notify admin ${adminId}:`, error.message);
      }
    }
  } catch (error) {
    console.error('[NOTIFICATIONS] Error notifying admins about doctor response:', error);
  }
}

// Notify admins about declined application
export async function notifyAdminsDecline(application, reason) {
  if (!clientBot) {
    console.log('[NOTIFICATIONS] Client bot not initialized');
    return;
  }

  try {
    const admins = await getAllAdmins();
    const adminIds = new Set([
      ...admins.map(a => a.telegramId),
      ...config.adminTelegramIds
    ]);

    const message = `
*Врач отклонил заявку #${application.id}*

Врач: ${application.doctor.fullName}
Причина: ${reason}

Необходимо назначить другого врача.
`;

    for (const adminId of adminIds) {
      try {
        await clientBot.telegram.sendMessage(Number(adminId), message, {
          parse_mode: 'Markdown'
        });
      } catch (error) {
        console.error(`[NOTIFICATIONS] Failed to notify admin ${adminId}:`, error.message);
      }
    }
  } catch (error) {
    console.error('[NOTIFICATIONS] Error notifying admins about decline:', error);
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
