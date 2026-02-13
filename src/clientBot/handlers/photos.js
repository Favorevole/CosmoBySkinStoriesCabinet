import { CLIENT_STATES } from '../states/index.js';
import { photoUploadKeyboard } from '../keyboards/index.js';
import { getSession, showConfirmation, clientSessions } from './questionnaire.js';
import { pendingPhotoRequests } from '../../services/notifications.js';
import { addPhotoToApplication } from '../../db/photos.js';

const MAX_PHOTOS = 6;
const MAX_ADDITIONAL_PHOTOS = 10;

export async function handlePhotoUpload(ctx) {
  const telegramId = ctx.from.id;
  const session = getSession(telegramId);

  // Check if this is an additional photo request
  const pendingRequest = pendingPhotoRequests.get(telegramId);
  if (pendingRequest) {
    return await handleAdditionalPhotoUpload(ctx, pendingRequest);
  }

  if (session.state !== CLIENT_STATES.AWAITING_PHOTOS) {
    await ctx.reply('Сессия истекла после обновления. Начните заново — /new');
    return;
  }

  if (session.photos.length >= MAX_PHOTOS) {
    await ctx.reply(`Достигнуто максимальное количество фотографий (${MAX_PHOTOS}). Нажмите "Готово" для продолжения.`);
    return;
  }

  try {
    // Get the largest photo
    const photos = ctx.message.photo;
    const largestPhoto = photos[photos.length - 1];

    // Download photo
    const file = await ctx.telegram.getFile(largestPhoto.file_id);
    const fileUrl = `https://api.telegram.org/file/bot${ctx.telegram.token}/${file.file_path}`;

    const response = await fetch(fileUrl);
    const buffer = Buffer.from(await response.arrayBuffer());

    // Save to session
    session.photos.push({
      fileId: largestPhoto.file_id,
      buffer,
      width: largestPhoto.width,
      height: largestPhoto.height
    });

    clientSessions.set(telegramId, session);

    const photoCount = session.photos.length;

    const text = photoCount < MAX_PHOTOS
      ? `Фото ${photoCount} получено.\n\nВы можете добавить ещё ${MAX_PHOTOS - photoCount} фото или нажать "Готово".`
      : `Все ${MAX_PHOTOS} фотографий получены!`;

    // Edit previous message instead of sending a new one
    if (session.lastPhotoMsgId) {
      try {
        await ctx.telegram.editMessageText(
          ctx.chat.id,
          session.lastPhotoMsgId,
          null,
          text,
          photoUploadKeyboard(photoCount)
        );
        return;
      } catch (e) {
        // Message might be too old or deleted — fall through to send new
      }
    }

    const sent = await ctx.reply(text, photoUploadKeyboard(photoCount));
    session.lastPhotoMsgId = sent.message_id;
    clientSessions.set(telegramId, session);

  } catch (error) {
    console.error('[CLIENT_BOT] Error downloading photo:', error);
    await ctx.reply('Не удалось загрузить фото. Попробуйте отправить другое изображение.');
  }
}

export async function handlePhotosDone(ctx) {
  const telegramId = ctx.from.id;
  const session = getSession(telegramId);

  if (session.state !== CLIENT_STATES.AWAITING_PHOTOS) {
    await ctx.answerCbQuery('Пожалуйста, начните заново');
    return;
  }

  if (session.photos.length === 0) {
    await ctx.answerCbQuery('Добавьте хотя бы одно фото');
    return;
  }

  await ctx.answerCbQuery();
  await ctx.editMessageText(`Получено фотографий: ${session.photos.length}`);

  await showConfirmation(ctx);
}

export async function handleAddMorePhotos(ctx) {
  const telegramId = ctx.from.id;
  const session = getSession(telegramId);

  if (session.state !== CLIENT_STATES.AWAITING_PHOTOS) {
    await ctx.answerCbQuery('Пожалуйста, начните заново');
    return;
  }

  if (session.photos.length >= MAX_PHOTOS) {
    await ctx.answerCbQuery(`Максимум ${MAX_PHOTOS} фото`);
    return;
  }

  await ctx.answerCbQuery();
  await ctx.reply('Отправьте ещё одно фото:');
}

// Handle additional photo upload (requested by doctor)
async function handleAdditionalPhotoUpload(ctx, pendingRequest) {
  const telegramId = ctx.from.id;

  if (pendingRequest.photos.length >= MAX_ADDITIONAL_PHOTOS) {
    await ctx.reply(`Достигнуто максимальное количество дополнительных фотографий (${MAX_ADDITIONAL_PHOTOS}).`);
    return;
  }

  try {
    const { Markup } = await import('telegraf');

    // Get the largest photo
    const photos = ctx.message.photo;
    const largestPhoto = photos[photos.length - 1];

    // Download photo
    const file = await ctx.telegram.getFile(largestPhoto.file_id);
    const fileUrl = `https://api.telegram.org/file/bot${ctx.telegram.token}/${file.file_path}`;

    const response = await fetch(fileUrl);
    const buffer = Buffer.from(await response.arrayBuffer());

    // Save to pending request
    pendingRequest.photos.push({
      fileId: largestPhoto.file_id,
      buffer,
      width: largestPhoto.width,
      height: largestPhoto.height
    });

    pendingPhotoRequests.set(telegramId, pendingRequest);

    const photoCount = pendingRequest.photos.length;

    const text = `Дополнительное фото ${photoCount} получено.\n\n` +
      `Отправьте ещё фото или нажмите "Фото отправлены" когда закончите.`;
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback(`Фото отправлены (${photoCount}) ✓`, `additional_photos_done_${pendingRequest.applicationId}`)]
    ]);

    // Edit previous message instead of sending a new one
    if (pendingRequest.lastMsgId) {
      try {
        await ctx.telegram.editMessageText(
          ctx.chat.id,
          pendingRequest.lastMsgId,
          null,
          text,
          keyboard
        );
        return;
      } catch (e) {
        // Fall through to send new
      }
    }

    const sent = await ctx.reply(text, keyboard);
    pendingRequest.lastMsgId = sent.message_id;
    pendingPhotoRequests.set(telegramId, pendingRequest);

  } catch (error) {
    console.error('[CLIENT_BOT] Error downloading additional photo:', error);
    await ctx.reply('Не удалось загрузить фото. Попробуйте отправить другое изображение.');
  }
}

// Handle when client is done sending additional photos
export async function handleAdditionalPhotosDone(ctx) {
  const telegramId = ctx.from.id;
  const applicationId = parseInt(ctx.callbackQuery.data.split('_').pop());

  const pendingRequest = pendingPhotoRequests.get(telegramId);

  if (!pendingRequest || pendingRequest.applicationId !== applicationId) {
    await ctx.answerCbQuery('Запрос не найден или истёк');
    return;
  }

  if (pendingRequest.photos.length === 0) {
    await ctx.answerCbQuery('Отправьте хотя бы одно фото');
    return;
  }

  try {
    // Save photos to database
    for (const photo of pendingRequest.photos) {
      await addPhotoToApplication(applicationId, {
        fileName: `additional_${Date.now()}.jpg`,
        mimeType: 'image/jpeg',
        fileSize: photo.buffer.length,
        data: photo.buffer,
        telegramFileId: photo.fileId
      });
    }

    // Remove pending request
    pendingPhotoRequests.delete(telegramId);

    await ctx.answerCbQuery();
    await ctx.editMessageText(
      `Спасибо! ${pendingRequest.photos.length} дополнительных фото добавлено к заявке #${pendingRequest.displayNumber || applicationId}.\n\n` +
      `Врач ${pendingRequest.doctorName} получит уведомление.`
    );

    // Notify doctor about new photos
    const { notifyDoctorNewPhotos } = await import('../../services/notifications.js');
    await notifyDoctorNewPhotos(applicationId, pendingRequest.doctorId, pendingRequest.photos.length);

  } catch (error) {
    console.error('[CLIENT_BOT] Error saving additional photos:', error);
    await ctx.answerCbQuery('Ошибка сохранения фото');
  }
}
