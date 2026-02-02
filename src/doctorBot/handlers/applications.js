import { DOCTOR_STATES } from '../states/index.js';
import {
  applicationViewKeyboard,
  backToListKeyboard,
  viewPhotosKeyboard
} from '../keyboards/index.js';
import { getSession, doctorSessions } from './start.js';
import { getDoctorByTelegramId } from '../../db/doctors.js';
import {
  getApplicationById,
  getDoctorAssignedApplications
} from '../../db/applications.js';
import { getApplicationPhotos } from '../../db/photos.js';
import { formatSkinType } from '../../clientBot/states/index.js';
import config from '../../config/environment.js';

export async function handleMyApplications(ctx) {
  const telegramId = ctx.from.id;

  try {
    const doctor = await getDoctorByTelegramId(telegramId);

    if (!doctor || doctor.status !== 'ACTIVE') {
      await ctx.reply('У вас нет доступа к заявкам. Дождитесь подтверждения регистрации.');
      return;
    }

    const applications = await getDoctorAssignedApplications(doctor.id);

    if (applications.length === 0) {
      await ctx.reply('У вас пока нет назначенных заявок.');
      return;
    }

    let message = '*Ваши заявки:*\n\n';

    const { Markup } = await import('telegraf');
    const buttons = [];

    for (const app of applications) {
      const statusLabel = app.status === 'ASSIGNED' ? 'Ожидает ответа' : 'Ответ дан';
      const date = app.createdAt.toLocaleDateString('ru-RU');

      message += `#${app.id} от ${date}\n`;
      message += `Статус: ${statusLabel}\n`;
      message += `Возраст: ${app.age}, ${formatSkinType(app.skinType)}\n\n`;

      buttons.push([Markup.button.callback(`Заявка #${app.id}`, `view_app_${app.id}`)]);
    }

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(buttons)
    });

  } catch (error) {
    console.error('[DOCTOR_BOT] Error fetching applications:', error);
    await ctx.reply('Произошла ошибка при загрузке заявок.');
  }
}

export async function handleViewApplication(ctx) {
  const telegramId = ctx.from.id;
  const applicationId = parseInt(ctx.callbackQuery.data.split('_').pop());

  try {
    const doctor = await getDoctorByTelegramId(telegramId);

    if (!doctor || doctor.status !== 'ACTIVE') {
      await ctx.answerCbQuery('Нет доступа');
      return;
    }

    const application = await getApplicationById(applicationId);

    if (!application || application.doctorId !== doctor.id) {
      await ctx.answerCbQuery('Заявка не найдена');
      return;
    }

    const session = getSession(telegramId);
    session.state = DOCTOR_STATES.VIEWING_APPLICATION;
    session.currentApplicationId = applicationId;
    doctorSessions.set(telegramId, session);

    const statusLabel = {
      ASSIGNED: 'Ожидает вашего ответа',
      RESPONSE_GIVEN: 'Ответ отправлен на проверку',
      APPROVED: 'Одобрено',
      SENT_TO_CLIENT: 'Отправлено клиенту'
    }[application.status] || application.status;

    let message = `*Заявка #${application.id}*\n\n`;
    message += `Статус: ${statusLabel}\n\n`;
    message += `*Данные анкеты:*\n`;
    message += `Возраст: ${application.age}\n`;
    message += `Тип кожи: ${formatSkinType(application.skinType)}\n`;
    message += `Проблемы: ${application.mainProblems}\n`;
    if (application.additionalComment) {
      message += `Комментарий: ${application.additionalComment}\n`;
    }
    message += `\nФотографий: ${application.photos.length}\n`;

    if (application.recommendation) {
      message += `\n*Ваш ответ:*\n${application.recommendation.text}\n`;
    }

    await ctx.answerCbQuery();

    // Send photos if available
    if (application.photos.length > 0) {
      try {
        await ctx.editMessageText(message, {
          parse_mode: 'Markdown',
          ...applicationViewKeyboard(applicationId)
        });

        // Send first photo
        const photo = application.photos[0];
        if (photo.telegramFileId) {
          await ctx.replyWithPhoto(photo.telegramFileId, {
            caption: `Фото 1/${application.photos.length}`,
            ...viewPhotosKeyboard(applicationId, 0, application.photos.length)
          });
        } else {
          await ctx.replyWithPhoto(
            { source: photo.data },
            {
              caption: `Фото 1/${application.photos.length}`,
              ...viewPhotosKeyboard(applicationId, 0, application.photos.length)
            }
          );
        }
      } catch (e) {
        await ctx.reply(message, {
          parse_mode: 'Markdown',
          ...applicationViewKeyboard(applicationId)
        });
      }
    } else {
      try {
        await ctx.editMessageText(message, {
          parse_mode: 'Markdown',
          ...applicationViewKeyboard(applicationId)
        });
      } catch (e) {
        await ctx.reply(message, {
          parse_mode: 'Markdown',
          ...applicationViewKeyboard(applicationId)
        });
      }
    }

  } catch (error) {
    console.error('[DOCTOR_BOT] Error viewing application:', error);
    await ctx.answerCbQuery('Ошибка');
  }
}

export async function handlePhotoNavigation(ctx, direction) {
  const data = ctx.callbackQuery.data;
  const parts = data.split('_');
  const applicationId = parseInt(parts[2]);
  const currentIndex = parseInt(parts[3]);

  try {
    const application = await getApplicationById(applicationId);
    if (!application) {
      await ctx.answerCbQuery('Заявка не найдена');
      return;
    }

    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (newIndex < 0 || newIndex >= application.photos.length) {
      await ctx.answerCbQuery('Нет больше фото');
      return;
    }

    const photo = application.photos[newIndex];

    await ctx.answerCbQuery();

    try {
      if (photo.telegramFileId) {
        await ctx.editMessageMedia(
          {
            type: 'photo',
            media: photo.telegramFileId,
            caption: `Фото ${newIndex + 1}/${application.photos.length}`
          },
          viewPhotosKeyboard(applicationId, newIndex, application.photos.length)
        );
      } else {
        // Can't edit with buffer, need to delete and send new
        await ctx.deleteMessage();
        await ctx.replyWithPhoto(
          { source: photo.data },
          {
            caption: `Фото ${newIndex + 1}/${application.photos.length}`,
            ...viewPhotosKeyboard(applicationId, newIndex, application.photos.length)
          }
        );
      }
    } catch (e) {
      console.error('[DOCTOR_BOT] Error navigating photos:', e);
    }

  } catch (error) {
    console.error('[DOCTOR_BOT] Error in photo navigation:', error);
    await ctx.answerCbQuery('Ошибка');
  }
}

export async function handleBackToList(ctx) {
  await ctx.answerCbQuery();
  await handleMyApplications(ctx);
}

export async function notifyAdminsNewDoctor(doctor) {
  // Import getClientBot dynamically to avoid circular dependency
  try {
    const { getClientBot } = await import('../../clientBot/index.js');
    const clientBot = getClientBot();

    if (!clientBot) {
      console.log('[DOCTOR_BOT] Client bot not initialized, skipping admin notification');
      return;
    }

    const { getAllAdmins } = await import('../../db/admins.js');
    const admins = await getAllAdmins();

    const adminIds = new Set([
      ...admins.map(a => a.telegramId),
      ...config.adminTelegramIds
    ]);

    const message = `
*Новая заявка на регистрацию врача*

ФИО: ${doctor.fullName}
Username: @${doctor.telegramUsername || 'не указан'}

Откройте админ-панель для подтверждения.
`;

    for (const adminId of adminIds) {
      try {
        await clientBot.telegram.sendMessage(Number(adminId), message, {
          parse_mode: 'Markdown'
        });
      } catch (error) {
        console.error(`[DOCTOR_BOT] Failed to notify admin ${adminId}:`, error.message);
      }
    }
  } catch (error) {
    console.error('[DOCTOR_BOT] Error notifying admins:', error);
  }
}
