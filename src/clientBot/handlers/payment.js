import { processPayment, PAYMENT_AMOUNT } from '../../services/payment.js';
import { getApplicationById } from '../../db/applications.js';
import { getPaymentByApplicationId } from '../../db/payments.js';
import { Markup } from 'telegraf';

// Handle pay_{applicationId} callback — creates YooKassa payment URL + shows promo option
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
    const amount = payment?.amount || PAYMENT_AMOUNT;

    await ctx.editMessageText(
      `*Заявка #${appNum} — оплата*\n\n` +
      `Стоимость: ${amount} ₽\n\n` +
      'Нажмите кнопку ниже, чтобы перейти к оплате.\n' +
      'Если у вас есть промокод — нажмите «Ввести промокод».',
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('🏷 Ввести промокод', `promo_for_${applicationId}`)],
          [Markup.button.url(`💳 Оплатить ${amount} ₽`, result.confirmationUrl)]
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

// Handle promo_for_{applicationId} — prompt user for promo code
export async function handlePaymentPromo(ctx) {
  try {
    await ctx.answerCbQuery();

    const applicationId = parseInt(ctx.match[1]);

    // Store applicationId in session for the text handler
    const telegramId = ctx.from.id;
    const { getSession, clientSessions } = await import('./questionnaire.js');
    const { CLIENT_STATES } = await import('../states/index.js');

    const session = getSession(telegramId);
    session.state = CLIENT_STATES.AWAITING_PROMO_CODE;
    session.paymentApplicationId = applicationId;
    clientSessions.set(telegramId, session);

    await ctx.editMessageText(
      'Введите промокод:',
      Markup.inlineKeyboard([
        [Markup.button.callback('⬅️ Назад к оплате', `pay_${applicationId}`)]
      ])
    );

  } catch (error) {
    console.error('[CLIENT_BOT] Error handling promo prompt:', error);
  }
}

// Handle promo code text input during payment
export async function handlePaymentPromoInput(ctx) {
  const telegramId = ctx.from.id;
  const { getSession, clientSessions } = await import('./questionnaire.js');
  const { CLIENT_STATES } = await import('../states/index.js');

  const session = getSession(telegramId);

  if (session.state !== CLIENT_STATES.AWAITING_PROMO_CODE || !session.paymentApplicationId) {
    return false;
  }

  const code = ctx.message.text.trim();
  const applicationId = session.paymentApplicationId;

  try {
    // Validate and apply promo code via processPayment
    const result = await processPayment(applicationId, code);

    // Clear promo state
    session.state = 'idle';
    session.paymentApplicationId = null;
    clientSessions.set(telegramId, session);

    if (result.freeWithPromo) {
      await ctx.reply(
        '*Промокод применён!*\n\n' +
        'Оплата не требуется — заявка отправлена специалисту.\n\n' +
        'Вам ответят в течение 24 часов.',
        { parse_mode: 'Markdown' }
      );
      return true;
    }

    if (result.alreadyPaid) {
      await ctx.reply('Эта заявка уже оплачена.');
      return true;
    }

    // Get payment info for display
    const payment = await getPaymentByApplicationId(applicationId);
    const application = await getApplicationById(applicationId);
    const appNum = application?.displayNumber || applicationId;
    const amount = payment?.amount || PAYMENT_AMOUNT;
    const discount = payment?.discountAmount || 0;

    let message = `*Промокод применён!*\n\n`;
    if (discount > 0) {
      message += `Скидка: ${discount} ₽\n`;
    }
    message += `Итого к оплате: *${amount} ₽*\n\n`;
    message += 'Нажмите кнопку ниже для оплаты.';

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.url(`💳 Оплатить ${amount} ₽`, result.confirmationUrl)]
      ])
    });

    return true;

  } catch (error) {
    // Invalid promo code — show error, let user try again
    await ctx.reply(
      `${error.message}\n\nПопробуйте другой промокод или вернитесь к оплате.`,
      Markup.inlineKeyboard([
        [Markup.button.callback('⬅️ Вернуться к оплате', `pay_${applicationId}`)]
      ])
    );
    return true;
  }
}
