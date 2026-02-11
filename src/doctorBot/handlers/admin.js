import { Markup } from 'telegraf';
import { isAdmin } from '../../db/admins.js';
import { getApplicationById, updateApplicationStatus } from '../../db/applications.js';
import { getPhotoData } from '../../db/photos.js';
import { approveRecommendation } from '../../db/recommendations.js';
import { notifyClientRecommendation, notifyDoctorStatusApproved } from '../../services/notifications.js';
import { formatSkinType, formatPriceRange } from '../../clientBot/states/index.js';
import config from '../../config/environment.js';

async function checkAdmin(ctx) {
  const telegramId = ctx.from.id;
  const adminStatus = await isAdmin(telegramId);
  const isConfigAdmin = config.adminTelegramIds.some(
    id => id.toString() === telegramId.toString()
  );
  return adminStatus || isConfigAdmin;
}

// Show application details to admin
export async function handleAdminViewApp(ctx) {
  const applicationId = parseInt(ctx.callbackQuery.data.split('_').pop());

  try {
    if (!await checkAdmin(ctx)) {
      await ctx.answerCbQuery('Нет доступа');
      return;
    }

    const application = await getApplicationById(applicationId);
    if (!application) {
      await ctx.answerCbQuery('Заявка не найдена');
      return;
    }

    let message = `*📋 Заявка #${application.displayNumber || application.id}*\n\n`;
    message += `*Клиент:* ${application.client.fullName || application.client.telegramUsername || 'Не указано'}\n`;
    if (application.client.telegramUsername) {
      message += `*Telegram:* @${application.client.telegramUsername}\n`;
    }
    message += `\n*Данные анкеты:*\n`;
    message += `• Возраст: ${application.age}\n`;
    message += `• Тип кожи: ${formatSkinType(application.skinType)}\n`;
    message += `• Бюджет: ${application.priceRange ? formatPriceRange(application.priceRange) : 'Не указан'}\n`;
    message += `• Проблемы: ${application.mainProblems}\n`;
    if (application.additionalComment) {
      message += `• Комментарий: ${application.additionalComment}\n`;
    }
    message += `\n*Фотографий:* ${application.photos.length}`;
    message += `\n*Врач:* ${application.doctor?.fullName || 'Не назначен'}`;

    await ctx.answerCbQuery();
    await ctx.reply(message, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🖼 Фото', `admin_photos_${applicationId}`)],
        [Markup.button.callback('📝 Ответ врача', `admin_rec_${applicationId}`)],
        [Markup.button.callback('✅ Утвердить и отправить', `admin_approve_${applicationId}`)]
      ])
    });

  } catch (error) {
    console.error('[ADMIN] Error viewing application:', error);
    await ctx.answerCbQuery('Ошибка');
  }
}

// Show photos to admin
export async function handleAdminShowPhotos(ctx) {
  const applicationId = parseInt(ctx.callbackQuery.data.split('_').pop());

  try {
    if (!await checkAdmin(ctx)) {
      await ctx.answerCbQuery('Нет доступа');
      return;
    }

    const application = await getApplicationById(applicationId);
    if (!application) {
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

    try {
      const photoBuffer = await getPhotoData(photo);

      if (photoBuffer && photoBuffer.length > 0) {
        const navButtons = [];
        const navRow = [];
        navRow.push(Markup.button.callback(`1/${application.photos.length}`, 'noop'));
        if (application.photos.length > 1) {
          navRow.push(Markup.button.callback('След. ▶️', `admin_photo_next_${applicationId}_0`));
        }
        navButtons.push(navRow);
        navButtons.push([Markup.button.callback('✅ Утвердить и отправить', `admin_approve_${applicationId}`)]);

        await ctx.replyWithPhoto(
          { source: photoBuffer },
          {
            caption: `Фото 1/${application.photos.length}\nЗаявка #${application.displayNumber || applicationId}`,
            ...Markup.inlineKeyboard(navButtons)
          }
        );
      } else {
        await ctx.reply('Не удалось загрузить фото — данные отсутствуют');
      }
    } catch (photoError) {
      console.error('[ADMIN] Error loading photo data:', photoError.message);
      await ctx.reply('Не удалось загрузить фото');
    }

  } catch (error) {
    console.error('[ADMIN] Error showing photos:', error);
    try {
      await ctx.answerCbQuery('Ошибка');
    } catch (e) { /* already answered */ }
  }
}

// Navigate photos for admin
export async function handleAdminPhotoNav(ctx, direction) {
  const data = ctx.callbackQuery.data;
  const parts = data.split('_');
  // admin_photo_next_ID_INDEX or admin_photo_prev_ID_INDEX
  const applicationId = parseInt(parts[3]);
  const currentIndex = parseInt(parts[4]);

  try {
    if (!await checkAdmin(ctx)) {
      await ctx.answerCbQuery('Нет доступа');
      return;
    }

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
        const navButtons = [];
        const navRow = [];
        if (newIndex > 0) {
          navRow.push(Markup.button.callback('◀️ Пред.', `admin_photo_prev_${applicationId}_${newIndex}`));
        }
        navRow.push(Markup.button.callback(`${newIndex + 1}/${application.photos.length}`, 'noop'));
        if (newIndex < application.photos.length - 1) {
          navRow.push(Markup.button.callback('След. ▶️', `admin_photo_next_${applicationId}_${newIndex}`));
        }
        navButtons.push(navRow);
        navButtons.push([Markup.button.callback('✅ Утвердить и отправить', `admin_approve_${applicationId}`)]);

        try {
          await ctx.deleteMessage();
        } catch (e) {
          console.log('[ADMIN] Could not delete message:', e.message);
        }

        await ctx.replyWithPhoto(
          { source: photoBuffer },
          {
            caption: `Фото ${newIndex + 1}/${application.photos.length}\nЗаявка #${application.displayNumber || applicationId}`,
            ...Markup.inlineKeyboard(navButtons)
          }
        );
      } else {
        await ctx.reply('Не удалось загрузить фото');
      }
    } catch (photoError) {
      console.error('[ADMIN] Error loading photo data:', photoError.message);
      await ctx.reply('Не удалось загрузить фото');
    }

  } catch (error) {
    console.error('[ADMIN] Error navigating photos:', error);
    await ctx.answerCbQuery('Ошибка');
  }
}

// Show doctor's recommendation to admin
export async function handleAdminShowRec(ctx) {
  const applicationId = parseInt(ctx.callbackQuery.data.split('_').pop());

  try {
    if (!await checkAdmin(ctx)) {
      await ctx.answerCbQuery('Нет доступа');
      return;
    }

    const application = await getApplicationById(applicationId);
    if (!application) {
      await ctx.answerCbQuery('Заявка не найдена');
      return;
    }

    if (!application.recommendation) {
      await ctx.answerCbQuery('Рекомендация не найдена');
      return;
    }

    const rec = application.recommendation;
    let message = `*📝 Ответ врача по заявке #${application.displayNumber || applicationId}*\n\n`;
    message += `*Врач:* ${application.doctor?.fullName || 'Не указан'}\n\n`;
    message += `${rec.text}\n`;

    if (rec.links && Array.isArray(rec.links) && rec.links.length > 0) {
      message += '\n*Ссылки:*\n';
      for (const link of rec.links) {
        message += `• [${link.title}](${link.url})\n`;
      }
    }

    await ctx.answerCbQuery();
    await ctx.reply(message, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      ...Markup.inlineKeyboard([
        [Markup.button.callback('📋 Показать заявку', `admin_view_${applicationId}`)],
        [Markup.button.callback('🖼 Фото', `admin_photos_${applicationId}`)],
        [Markup.button.callback('✅ Утвердить и отправить', `admin_approve_${applicationId}`)]
      ])
    });

  } catch (error) {
    console.error('[ADMIN] Error showing recommendation:', error);
    await ctx.answerCbQuery('Ошибка');
  }
}

// Approve and send recommendation to client
export async function handleAdminApprove(ctx) {
  const applicationId = parseInt(ctx.callbackQuery.data.split('_').pop());

  try {
    if (!await checkAdmin(ctx)) {
      await ctx.answerCbQuery('Нет доступа');
      return;
    }

    const application = await getApplicationById(applicationId);
    if (!application) {
      await ctx.answerCbQuery('Заявка не найдена');
      return;
    }

    if (application.status !== 'RESPONSE_GIVEN') {
      const statusMsg = {
        APPROVED: 'уже одобрена',
        SENT_TO_CLIENT: 'уже отправлена клиенту',
        NEW: 'ещё не имеет ответа врача',
        ASSIGNED: 'ещё не имеет ответа врача'
      }[application.status] || application.status;

      await ctx.answerCbQuery(`Заявка ${statusMsg}`);
      return;
    }

    if (!application.recommendation) {
      await ctx.answerCbQuery('Нет рекомендации для отправки');
      return;
    }

    await ctx.answerCbQuery();

    // Show confirmation
    const preview = application.recommendation.text.length > 200
      ? application.recommendation.text.substring(0, 200) + '...'
      : application.recommendation.text;

    await ctx.reply(
      `*Подтвердите отправку клиенту*\n\n` +
      `Заявка #${application.displayNumber || applicationId}\n` +
      `Клиент: ${application.client.fullName || application.client.telegramUsername || 'Не указано'}\n\n` +
      `_Ответ врача (превью):_\n${preview}`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('✅ Да, отправить клиенту', `admin_confirm_approve_${applicationId}`)],
          [Markup.button.callback('❌ Отмена', `admin_cancel_approve_${applicationId}`)]
        ])
      }
    );

  } catch (error) {
    console.error('[ADMIN] Error starting approval:', error);
    await ctx.answerCbQuery('Ошибка');
  }
}

// Confirm approval
export async function handleAdminConfirmApprove(ctx) {
  const applicationId = parseInt(ctx.callbackQuery.data.split('_').pop());

  try {
    if (!await checkAdmin(ctx)) {
      await ctx.answerCbQuery('Нет доступа');
      return;
    }

    const application = await getApplicationById(applicationId);
    if (!application || application.status !== 'RESPONSE_GIVEN') {
      await ctx.answerCbQuery('Невозможно одобрить заявку');
      return;
    }

    // Get admin ID for audit
    const telegramId = ctx.from.id;
    const { getAdminByTelegramId } = await import('../../db/admins.js');
    const admin = await getAdminByTelegramId(telegramId);
    const adminId = admin?.id || null;

    // Approve recommendation
    const approvedApp = await approveRecommendation(applicationId, adminId);

    // Send to client
    await notifyClientRecommendation(approvedApp);

    // Update status to SENT_TO_CLIENT
    await updateApplicationStatus(
      applicationId,
      'SENT_TO_CLIENT',
      adminId,
      'ADMIN',
      'Рекомендации отправлены клиенту (через бот)'
    );

    await ctx.answerCbQuery('Отправлено!');
    await ctx.editMessageText(
      `✅ *Заявка #${application.displayNumber || applicationId} — рекомендации отправлены клиенту!*\n\n` +
      `Клиент: ${application.client.fullName || application.client.telegramUsername || 'Не указано'}`,
      { parse_mode: 'Markdown' }
    );

    console.log(`[ADMIN] Application #${applicationId} approved and sent to client via bot by admin ${telegramId}`);

  } catch (error) {
    console.error('[ADMIN] Error confirming approval:', error);
    await ctx.answerCbQuery('Ошибка при отправке');
    await ctx.reply(`Ошибка при одобрении заявки #${applicationId}: ${error.message}`);
  }
}

// Cancel approval
export async function handleAdminCancelApprove(ctx) {
  await ctx.answerCbQuery('Отменено');
  await ctx.editMessageText('Отправка отменена.');
}
