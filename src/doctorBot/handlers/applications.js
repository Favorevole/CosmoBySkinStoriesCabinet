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
import { getApplicationPhotos, getPhotoData } from '../../db/photos.js';
import { formatSkinType, formatPriceRange } from '../../clientBot/states/index.js';
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

      message += `#${app.displayNumber || app.id} от ${date}\n`;
      message += `Статус: ${statusLabel}\n`;
      message += `Возраст: ${app.age}, ${formatSkinType(app.skinType)}\n\n`;

      buttons.push([Markup.button.callback(`Заявка #${app.displayNumber || app.id}`, `view_app_${app.id}`)]);
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

    let message = `*Заявка #${application.displayNumber || application.id}*\n\n`;
    message += `Статус: ${statusLabel}\n\n`;
    message += `*Данные анкеты:*\n`;
    message += `Возраст: ${application.age}\n`;
    message += `Тип кожи: ${formatSkinType(application.skinType)}\n`;
    message += `Бюджет: ${application.priceRange ? formatPriceRange(application.priceRange) : 'Не указан'}\n`;
    message += `Проблемы: ${application.mainProblems}\n`;
    if (application.additionalComment) {
      message += `Комментарий: ${application.additionalComment}\n`;
    }
    message += `\nФотографий: ${application.photos.length}\n`;

    if (application.recommendation) {
      message += `\n*Ваш ответ:*\n${application.recommendation.text}\n`;
    }

    await ctx.answerCbQuery();

    const photoCount = application.photos.length;

    try {
      await ctx.editMessageText(message, {
        parse_mode: 'Markdown',
        ...applicationViewKeyboard(applicationId, photoCount)
      });
    } catch (e) {
      await ctx.reply(message, {
        parse_mode: 'Markdown',
        ...applicationViewKeyboard(applicationId, photoCount)
      });
    }

  } catch (error) {
    console.error('[DOCTOR_BOT] Error viewing application:', error);
    await ctx.answerCbQuery('Ошибка');
  }
}

export async function handleShowPhotos(ctx) {
  const telegramId = ctx.from.id;
  const callbackData = ctx.callbackQuery.data;
  console.log(`[DOCTOR_BOT] handleShowPhotos called with data: ${callbackData}`);

  const applicationId = parseInt(callbackData.split('_').pop());
  console.log(`[DOCTOR_BOT] Parsed applicationId: ${applicationId}`);

  try {
    const doctor = await getDoctorByTelegramId(telegramId);
    console.log(`[DOCTOR_BOT] Doctor found: ${doctor?.id}, status: ${doctor?.status}`);

    if (!doctor || doctor.status !== 'ACTIVE') {
      await ctx.answerCbQuery('Нет доступа');
      return;
    }

    const application = await getApplicationById(applicationId);
    console.log(`[DOCTOR_BOT] Application found: ${application?.id}, photos: ${application?.photos?.length}`);

    if (!application || application.doctorId !== doctor.id) {
      await ctx.answerCbQuery('Заявка не найдена');
      return;
    }

    if (!application.photos || application.photos.length === 0) {
      await ctx.answerCbQuery('Нет фотографий');
      return;
    }

    await ctx.answerCbQuery('Отправляю фотографии...');

    // Send first photo with navigation
    const photo = application.photos[0];
    console.log(`[DOCTOR_BOT] Sending photo id: ${photo.id}, telegramFileId: ${photo.telegramFileId}, hasData: ${!!photo.data}, dataType: ${photo.data ? photo.data.constructor.name : 'none'}, dataLength: ${photo.data ? photo.data.length : 0}`);

    try {
      const photoBuffer = await getPhotoData(photo);
      console.log(`[DOCTOR_BOT] Photo data resolved, size: ${photoBuffer?.length || 0} bytes`);

      if (photoBuffer && photoBuffer.length > 0) {
        await ctx.replyWithPhoto(
          { source: photoBuffer },
          {
            caption: `Фото 1/${application.photos.length}\nЗаявка #${application.displayNumber || applicationId}`,
            ...viewPhotosKeyboard(applicationId, 0, application.photos.length)
          }
        );
        console.log('[DOCTOR_BOT] Photo sent successfully');
      } else {
        console.error('[DOCTOR_BOT] Photo has no data');
        await ctx.reply('Не удалось загрузить фото - данные отсутствуют');
      }
    } catch (photoError) {
      console.error('[DOCTOR_BOT] Error sending photo:', photoError.message);
      await ctx.reply(`Не удалось отправить фото: ${photoError.message}`);
    }

  } catch (error) {
    console.error('[DOCTOR_BOT] Error showing photos:', error);
    try {
      await ctx.answerCbQuery('Ошибка загрузки фото');
    } catch (e) {
      // callback already answered
    }
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
      const photoBuffer = await getPhotoData(photo);

      if (photoBuffer && photoBuffer.length > 0) {
        try {
          await ctx.deleteMessage();
        } catch (deleteErr) {
          console.log('[DOCTOR_BOT] Could not delete message:', deleteErr.message);
        }

        await ctx.replyWithPhoto(
          { source: photoBuffer },
          {
            caption: `Фото ${newIndex + 1}/${application.photos.length}`,
            ...viewPhotosKeyboard(applicationId, newIndex, application.photos.length)
          }
        );
      } else {
        await ctx.reply('Не удалось загрузить фото - данные отсутствуют');
      }
    } catch (e) {
      console.error('[DOCTOR_BOT] Error navigating photos:', e.message);
      await ctx.reply('Ошибка при переключении фото');
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

export async function handleRequestPhotos(ctx) {
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

    // Check if client has telegram ID
    if (!application.client.telegramId) {
      await ctx.answerCbQuery('У клиента нет Telegram ID');
      return;
    }

    // Request additional photos from client
    const { requestAdditionalPhotos } = await import('../../services/notifications.js');
    await requestAdditionalPhotos(application, doctor);

    await ctx.answerCbQuery('Запрос отправлен клиенту');
    await ctx.reply(
      `Запрос на дополнительные фото отправлен клиенту.\n` +
      `Когда клиент отправит фото, они будут добавлены к заявке #${application.displayNumber || applicationId}.`
    );

  } catch (error) {
    console.error('[DOCTOR_BOT] Error requesting photos:', error);
    await ctx.answerCbQuery('Ошибка отправки запроса');
  }
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
