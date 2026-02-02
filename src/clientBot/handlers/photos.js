import { CLIENT_STATES } from '../states/index.js';
import { photoUploadKeyboard } from '../keyboards/index.js';
import { getSession, showConfirmation, clientSessions } from './questionnaire.js';

const MAX_PHOTOS = 6;

export async function handlePhotoUpload(ctx) {
  const telegramId = ctx.from.id;
  const session = getSession(telegramId);

  if (session.state !== CLIENT_STATES.AWAITING_PHOTOS) {
    await ctx.reply('Пожалуйста, начните заполнение анкеты с команды /start или кнопки "Новая консультация".');
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

    if (photoCount < MAX_PHOTOS) {
      await ctx.reply(
        `Фото ${photoCount} получено.\n\n` +
        `Вы можете добавить ещё ${MAX_PHOTOS - photoCount} фото или нажать "Готово".`,
        photoUploadKeyboard(photoCount)
      );
    } else {
      await ctx.reply(
        `Все ${MAX_PHOTOS} фотографий получены!`,
        photoUploadKeyboard(photoCount)
      );
    }

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
