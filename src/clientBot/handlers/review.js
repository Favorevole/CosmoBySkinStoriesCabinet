import { Markup } from 'telegraf';
import { createReview, getReviewByApplicationId } from '../../db/reviews.js';
import { getClientByTelegramId } from '../../db/clients.js';

// Handle star rating callback: review_{rating}_{applicationId}
export async function handleReviewRating(ctx) {
  try {
    await ctx.answerCbQuery();

    const rating = parseInt(ctx.match[1]);
    const applicationId = parseInt(ctx.match[2]);

    const telegramId = ctx.from.id;
    const client = await getClientByTelegramId(telegramId);

    if (!client) {
      await ctx.reply('Не удалось найти ваш профиль.');
      return;
    }

    // Check if review already exists
    const existing = await getReviewByApplicationId(applicationId);
    if (existing) {
      await ctx.editMessageText('Вы уже оставили отзыв. Спасибо!');
      return;
    }

    // Save rating in session for text follow-up
    if (!ctx.session) ctx.session = {};
    ctx.session.pendingReview = {
      applicationId,
      clientId: client.id,
      rating,
      clientName: ctx.from.first_name || null
    };

    const stars = '\u2B50'.repeat(rating);
    await ctx.editMessageText(
      `Вы поставили ${stars}\n\nХотите добавить комментарий к отзыву?`,
      Markup.inlineKeyboard([
        [Markup.button.callback('Пропустить', `skip_review_text_${applicationId}`)]
      ])
    );
  } catch (error) {
    console.error('[CLIENT_BOT] Error handling review rating:', error);
    await ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
}

// Handle skip review text
export async function handleSkipReviewText(ctx) {
  try {
    await ctx.answerCbQuery();

    if (!ctx.session?.pendingReview) {
      await ctx.editMessageText('Время отзыва истекло. Спасибо!');
      return;
    }

    const { applicationId, clientId, rating, clientName } = ctx.session.pendingReview;
    delete ctx.session.pendingReview;

    await createReview({ applicationId, clientId, rating, text: null, clientName });

    const stars = '\u2B50'.repeat(rating);
    await ctx.editMessageText(`${stars}\n\nСпасибо за вашу оценку!`);
  } catch (error) {
    console.error('[CLIENT_BOT] Error skipping review text:', error);
    await ctx.reply('Произошла ошибка при сохранении отзыва.');
  }
}

// Handle review text message (called from text handler)
export async function handleReviewText(ctx) {
  if (!ctx.session?.pendingReview) {
    return false;
  }

  try {
    const text = ctx.message.text.trim();
    if (!text || text.length < 3) {
      await ctx.reply('Пожалуйста, напишите хотя бы несколько слов или нажмите "Пропустить".');
      return true;
    }

    const { applicationId, clientId, rating, clientName } = ctx.session.pendingReview;
    delete ctx.session.pendingReview;

    await createReview({ applicationId, clientId, rating, text, clientName });

    const stars = '\u2B50'.repeat(rating);
    await ctx.reply(`${stars}\n\nСпасибо за ваш отзыв!`);
    return true;
  } catch (error) {
    console.error('[CLIENT_BOT] Error saving review text:', error);
    await ctx.reply('Произошла ошибка при сохранении отзыва.');
    return true;
  }
}
