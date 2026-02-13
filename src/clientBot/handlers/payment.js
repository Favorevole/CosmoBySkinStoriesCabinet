import { processPayment } from '../../services/payment.js';
import { getApplicationById } from '../../db/applications.js';
import { getPaymentByApplicationId } from '../../db/payments.js';
import { Markup } from 'telegraf';

// Handle pay_{applicationId} callback — now creates a YooKassa payment URL
export async function handlePayment(ctx) {
  try {
    await ctx.answerCbQuery();

    const applicationId = parseInt(ctx.match[1]);

    await ctx.editMessageText('Создаём ссылку на оплату...');

    const result = await processPayment(applicationId);

    if (result.alreadyPaid || result.freeWithPromo) {
      await ctx.editMessageText('Эта заявка уже оплачена.');
      return;
    }

    const application = await getApplicationById(applicationId);
    const appNum = application?.displayNumber || applicationId;

    // Get actual amount from payment record
    const payment = await getPaymentByApplicationId(applicationId);
    const amount = payment?.amount || 500;

    await ctx.editMessageText(
      `*Заявка #${appNum} — оплата*\n\n` +
      'Нажмите кнопку ниже, чтобы перейти к оплате.',
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.url(`Оплатить ${amount} ₽`, result.confirmationUrl)]
        ])
      }
    );

  } catch (error) {
    console.error('[CLIENT_BOT] Error creating payment:', error);
    await ctx.reply(
      'Произошла ошибка при создании платежа. Пожалуйста, попробуйте ещё раз или начните заново с /start'
    );
  }
}
