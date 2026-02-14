import { processPayment, PAYMENT_AMOUNT } from '../../services/payment.js';
import { getApplicationById, updateApplicationStatus } from '../../db/applications.js';
import { getPaymentByApplicationId, failPayment } from '../../db/payments.js';
import { Markup } from 'telegraf';

// Build payment keyboard with 3 buttons: promo, pay, cancel
function paymentButtons(applicationId, amount, payUrl) {
  return Markup.inlineKeyboard([
    [Markup.button.callback('🏷 Ввести промокод', `promo_for_${applicationId}`)],
    [Markup.button.url(`💳 Оплатить ${amount} ₽`, payUrl)],
    [Markup.button.callback('❌ Отменить заявку', `cancel_app_${applicationId}`)]
  ]);
}

// Handle pay_{applicationId} callback — creates YooKassa payment URL + shows promo option
export async function handlePayment(ctx) {
  try {
    await ctx.answerCbQuery();

    const applicationId = parseInt(ctx.match[1]);

    await ctx.editMessageText('Создаём ссылку на оплату...');

    const application = await getApplicationById(applicationId);

    if (!application || application.status === 'CANCELLED') {
      await ctx.editMessageText('Заявка отменена.');
      return;
    }

    const result = await processPayment(applicationId);

    if (result.alreadyPaid || result.freeWithPromo) {
      await ctx.editMessageText('Эта заявка уже оплачена.');
      return;
    }

    const appNum = application?.displayNumber || applicationId;

    // Get actual amount from payment record
    const payment = await getPaymentByApplicationId(applicationId);
    const amount = payment?.amount || PAYMENT_AMOUNT;

    await ctx.editMessageText(
      `*Заявка #${appNum}*\n\n` +
      `Стоимость консультации: ${amount} ₽\n\n` +
      'Нажмите кнопку ниже для оплаты.\n' +
      'Если есть промокод — нажмите «Ввести промокод».',
      {
        parse_mode: 'Markdown',
        ...paymentButtons(applicationId, amount, result.confirmationUrl)
      }
    );

  } catch (error) {
    console.error('[CLIENT_BOT] Error creating payment:', error);
    await ctx.reply(
      'Произошла ошибка при создании платежа. Пожалуйста, попробуйте ещё раз или начните заново с /start'
    );
  }
}

// Handle cancel_app_{applicationId} — cancel unpaid application
export async function handleCancelApplication(ctx) {
  try {
    await ctx.answerCbQuery();

    const applicationId = parseInt(ctx.match[1]);
    const application = await getApplicationById(applicationId);

    if (!application) {
      await ctx.editMessageText('Заявка не найдена.');
      return;
    }

    if (application.status !== 'PENDING_PAYMENT') {
      await ctx.editMessageText('Эту заявку нельзя отменить.');
      return;
    }

    // Cancel the payment
    const payment = await getPaymentByApplicationId(applicationId);
    if (payment && payment.status === 'PENDING') {
      await failPayment(payment.id);
    }

    // Update application status to CANCELLED
    await updateApplicationStatus(
      applicationId,
      'CANCELLED',
      null,
      'CLIENT',
      'Отменена клиентом'
    );

    const appNum = application.displayNumber || applicationId;
    await ctx.editMessageText(
      `Заявка #${appNum} отменена.\n\n` +
      'Вы можете создать новую заявку в любое время — нажмите «Новая консультация».'
    );

  } catch (error) {
    console.error('[CLIENT_BOT] Error cancelling application:', error);
    await ctx.reply('Произошла ошибка при отмене заявки.');
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
    // Store message info so we can clean it up after promo input
    session.promoPromptChatId = ctx.callbackQuery.message.chat.id;
    session.promoPromptMessageId = ctx.callbackQuery.message.message_id;
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

  // Delete the old "Введите промокод:" message to avoid stale buttons
  const promoChatId = session.promoPromptChatId;
  const promoMsgId = session.promoPromptMessageId;

  try {
    // Validate and apply promo code via processPayment
    const result = await processPayment(applicationId, code);

    // Clear promo state
    session.state = 'idle';
    session.paymentApplicationId = null;
    session.promoPromptChatId = null;
    session.promoPromptMessageId = null;
    clientSessions.set(telegramId, session);

    // Remove the old promo prompt message
    if (promoChatId && promoMsgId) {
      try {
        await ctx.telegram.deleteMessage(promoChatId, promoMsgId);
      } catch (_) { /* message may already be gone */ }
    }

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
        [Markup.button.url(`💳 Оплатить ${amount} ₽`, result.confirmationUrl)],
        [Markup.button.callback('❌ Отменить заявку', `cancel_app_${applicationId}`)]
      ])
    });

    return true;

  } catch (error) {
    // Remove the old promo prompt message
    if (promoChatId && promoMsgId) {
      try {
        await ctx.telegram.deleteMessage(promoChatId, promoMsgId);
      } catch (_) { /* message may already be gone */ }
    }

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
