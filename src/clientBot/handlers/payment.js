import { processPayment } from '../../services/payment.js';
import { mainMenuKeyboard } from '../keyboards/index.js';

// Handle pay_{applicationId} callback
export async function handlePayment(ctx) {
  try {
    await ctx.answerCbQuery();

    const applicationId = parseInt(ctx.match[1]);

    await ctx.editMessageText('Обработка платежа...');

    const result = await processPayment(applicationId);

    if (result.alreadyPaid) {
      await ctx.editMessageText('Эта заявка уже оплачена.');
      return;
    }

    await ctx.editMessageText(
      `*Оплата прошла успешно!*\n\n` +
      `Заявка #${applicationId} отправлена специалисту.\n\n` +
      'Эксперт изучит вашу анкету и фотографии, после чего вы получите персональные рекомендации.\n\n' +
      'Обычно это занимает 24-48 часов.\n\n' +
      'Мы пришлём вам уведомление, когда ответ будет готов.',
      { parse_mode: 'Markdown' }
    );

    await ctx.reply('Спасибо за оплату! Ожидайте ответа специалиста.', mainMenuKeyboard());

  } catch (error) {
    console.error('[CLIENT_BOT] Error processing payment:', error);
    await ctx.reply(
      'Произошла ошибка при обработке платежа. Пожалуйста, попробуйте ещё раз или начните заново с /start'
    );
  }
}
