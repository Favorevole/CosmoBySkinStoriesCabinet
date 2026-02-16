import { createPaymentRecord, completePayment, failPayment, getPaymentByApplicationId, getPaymentByExternalId, updatePaymentExternalId, updatePaymentWithPromo } from '../db/payments.js';
import { updateApplicationStatus, getApplicationById } from '../db/applications.js';
import { notifyAdminsNewApplication } from './notifications.js';
import { validatePromoCode, incrementPromoCodeUsage } from '../db/promoCodes.js';
import config from '../config/environment.js';

export const PAYMENT_AMOUNT = 500;

const PROVIDER = 'YOOKASSA';

/**
 * Create a pending payment for an application.
 * Optionally applies promo code discount.
 */
export async function createPayment(applicationId, promoCodeId = null, discountPercent = 0) {
  const discountAmount = discountPercent > 0 ? Math.round(PAYMENT_AMOUNT * discountPercent / 100) : 0;
  const finalAmount = PAYMENT_AMOUNT - discountAmount;

  return createPaymentRecord({
    applicationId,
    amount: finalAmount,
    provider: PROVIDER,
    promoCodeId,
    discountAmount: discountAmount > 0 ? discountAmount : null
  });
}

/**
 * Create a YooKassa payment and return the confirmation URL.
 * Uses payment.amount from DB (supports discounts).
 */
async function createYooKassaPayment(applicationId) {
  const payment = await getPaymentByApplicationId(applicationId);
  if (!payment) {
    throw new Error(`Payment not found for application ${applicationId}`);
  }

  if (payment.status === 'COMPLETED') {
    return { alreadyPaid: true };
  }

  // Use amount from DB (may include discount)
  const paymentAmount = payment.amount;

  // Get displayNumber for return URL
  const application = await getApplicationById(applicationId);
  const displayNumber = application?.displayNumber || applicationId;

  const idempotenceKey = `app_${applicationId}_${Date.now()}`;

  const amountValue = paymentAmount % 1 === 0 ? `${paymentAmount}.00` : paymentAmount.toFixed(2);

  const body = {
    amount: {
      value: amountValue,
      currency: 'RUB'
    },
    confirmation: {
      type: 'redirect',
      return_url: `${config.yookassa.returnUrl}&app=${displayNumber}`
    },
    capture: true,
    description: 'Онлайн-консультация косметолога',
    receipt: {
      customer: {
        email: 'receipt@skinstories.ru'
      },
      items: [{
        description: 'Онлайн-консультация косметолога',
        quantity: '1.00',
        amount: {
          value: amountValue,
          currency: 'RUB'
        },
        vat_code: 1,
        payment_subject: 'service',
        payment_mode: 'full_payment'
      }]
    },
    metadata: {
      applicationId: String(applicationId)
    }
  };

  const credentials = Buffer.from(`${config.yookassa.shopId}:${config.yookassa.apiKey}`).toString('base64');

  const response = await fetch('https://api.yookassa.ru/v3/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${credentials}`,
      'Idempotence-Key': idempotenceKey
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[PAYMENT] YooKassa error:', response.status, errorText);
    throw new Error(`YooKassa API error: ${response.status}`);
  }

  const data = await response.json();

  // Save YooKassa payment ID
  await updatePaymentExternalId(payment.id, data.id);

  console.log(`[PAYMENT] YooKassa payment created: ${data.id} for application ${applicationId}, amount: ${paymentAmount}`);

  return {
    alreadyPaid: false,
    confirmationUrl: data.confirmation.confirmation_url,
    amount: paymentAmount
  };
}

/**
 * Complete payment immediately (for 100% discount).
 * Moves application to NEW and notifies admins.
 */
async function completeFreePayment(applicationId) {
  const payment = await getPaymentByApplicationId(applicationId);
  if (!payment) {
    throw new Error(`Payment not found for application ${applicationId}`);
  }

  if (payment.status === 'COMPLETED') {
    return { alreadyPaid: true, freeWithPromo: true };
  }

  await completePayment(payment.id, 'FREE_PROMO');

  // Increment promo code usage
  if (payment.promoCodeId) {
    await incrementPromoCodeUsage(payment.promoCodeId);
  }

  // Move application to NEW
  await updateApplicationStatus(
    applicationId,
    'NEW',
    null,
    'CLIENT',
    'Оплата по промокоду (100% скидка)'
  );

  // Notify admins
  const fullApplication = await getApplicationById(applicationId);
  await notifyAdminsNewApplication(fullApplication);

  // Send confirmation email
  if (fullApplication?.client?.email) {
    try {
      const { sendPaymentConfirmation } = await import('./email.js');
      await sendPaymentConfirmation({
        to: fullApplication.client.email,
        displayNumber: fullApplication.displayNumber || applicationId
      });
    } catch (err) {
      console.error('[PAYMENT] Error sending confirmation email:', err.message);
    }
  }

  // Telegram notification
  if (fullApplication?.client?.telegramId) {
    try {
      const { getClientBot } = await import('../clientBot/index.js');
      const bot = getClientBot();
      if (bot) {
        const appNum = fullApplication.displayNumber || applicationId;
        await bot.telegram.sendMessage(
          fullApplication.client.telegramId.toString(),
          `*Заявка #${appNum} оформлена!*\n\n` +
          'Промокод применён — оплата не требуется.\n\n' +
          'Эксперт изучит вашу анкету и фотографии, после чего вы получите персональные рекомендации.\n\n' +
          'Вам ответят в течение 24 часов.',
          { parse_mode: 'Markdown' }
        );
      }
    } catch (err) {
      console.error('[PAYMENT] Error sending Telegram notification:', err.message);
    }
  }

  console.log(`[PAYMENT] Free payment completed for application ${applicationId}`);

  return { alreadyPaid: false, freeWithPromo: true };
}

/**
 * Process payment — creates YooKassa payment and returns URL.
 * If amount is 0 (100% discount), completes immediately.
 */
export async function processPayment(applicationId, promoCode = null) {
  // If promo code provided (web flow), validate and apply
  if (promoCode) {
    const { valid, promoCode: promo, error } = await validatePromoCode(promoCode);
    if (!valid) {
      throw new Error(error);
    }

    const payment = await getPaymentByApplicationId(applicationId);
    if (payment && payment.status === 'PENDING') {
      const discountAmount = Math.round(PAYMENT_AMOUNT * promo.discount / 100);
      const finalAmount = PAYMENT_AMOUNT - discountAmount;

      await updatePaymentWithPromo(payment.id, {
        promoCodeId: promo.id,
        discountAmount,
        amount: finalAmount
      });
    }
  }

  // Check if payment amount is 0 (100% discount)
  const payment = await getPaymentByApplicationId(applicationId);
  if (payment && payment.amount === 0) {
    return completeFreePayment(applicationId);
  }

  return createYooKassaPayment(applicationId);
}

/**
 * Shared logic: complete a succeeded payment, move app to NEW, notify admins & client.
 */
async function completeSucceededPayment(localPayment, applicationId, externalId) {
  await completePayment(localPayment.id, externalId);

  // Increment promo code usage if applicable
  if (localPayment.promoCodeId) {
    await incrementPromoCodeUsage(localPayment.promoCodeId);
  }

  // Move application to NEW
  await updateApplicationStatus(
    applicationId,
    'NEW',
    null,
    'CLIENT',
    'Оплата получена'
  );

  // Notify admins
  const fullApplication = await getApplicationById(applicationId);
  await notifyAdminsNewApplication(fullApplication);

  // Send confirmation email if client has email
  if (fullApplication?.client?.email) {
    try {
      const { sendPaymentConfirmation } = await import('./email.js');
      await sendPaymentConfirmation({
        to: fullApplication.client.email,
        displayNumber: fullApplication.displayNumber || applicationId
      });
    } catch (err) {
      console.error('[PAYMENT] Error sending confirmation email:', err.message);
    }
  }

  // If Telegram user — send success message via bot
  if (fullApplication?.client?.telegramId) {
    try {
      const { getClientBot } = await import('../clientBot/index.js');
      const bot = getClientBot();
      if (bot) {
        const appNum = fullApplication.displayNumber || applicationId;
        await bot.telegram.sendMessage(
          fullApplication.client.telegramId.toString(),
          `*Оплата прошла успешно!*\n\n` +
          `Заявка #${appNum} отправлена специалисту.\n\n` +
          'Эксперт изучит вашу анкету и фотографии, после чего вы получите персональные рекомендации.\n\n' +
          'Вам ответят в течение 24 часов.\n\n' +
          'Мы пришлём вам уведомление, когда ответ будет готов.',
          { parse_mode: 'Markdown' }
        );
      }
    } catch (err) {
      console.error('[PAYMENT] Error sending Telegram notification:', err.message);
    }
  }

  console.log(`[PAYMENT] Payment completed for application ${applicationId}`);
}

/**
 * Handle YooKassa webhook notification.
 */
export async function handleYooKassaWebhook(body) {
  const event = body.event;
  const paymentData = body.object;

  if (!paymentData) {
    console.warn('[PAYMENT] Webhook: no object in body');
    return;
  }

  const yookassaPaymentId = paymentData.id;
  const status = paymentData.status;
  const applicationId = parseInt(paymentData.metadata?.applicationId);

  console.log(`[PAYMENT] Webhook: event=${event}, paymentId=${yookassaPaymentId}, status=${status}, appId=${applicationId}`);

  if (!applicationId) {
    console.warn('[PAYMENT] Webhook: no applicationId in metadata');
    return;
  }

  const payment = await getPaymentByExternalId(yookassaPaymentId);
  if (!payment) {
    // Try to find by applicationId as fallback
    const paymentByApp = await getPaymentByApplicationId(applicationId);
    if (!paymentByApp) {
      console.warn(`[PAYMENT] Webhook: payment not found for ${yookassaPaymentId}`);
      return;
    }
    // Update the externalId
    await updatePaymentExternalId(paymentByApp.id, yookassaPaymentId);
  }

  const localPayment = payment || await getPaymentByApplicationId(applicationId);

  if (event === 'payment.succeeded' || status === 'succeeded') {
    if (localPayment.status === 'COMPLETED') {
      console.log(`[PAYMENT] Webhook: payment already completed for app ${applicationId}`);
      return;
    }

    await completeSucceededPayment(localPayment, applicationId, yookassaPaymentId);

  } else if (event === 'payment.canceled' || status === 'canceled') {
    if (localPayment.status !== 'PENDING') {
      return;
    }
    await failPayment(localPayment.id);
    console.log(`[PAYMENT] Payment canceled for application ${applicationId}`);
  }
}

/**
 * Check YooKassa payment status by applicationId.
 * If succeeded — runs the same completion flow as the webhook.
 */
export async function checkYooKassaPaymentStatus(applicationId) {
  const payment = await getPaymentByApplicationId(applicationId);
  if (!payment) {
    throw new Error('Платёж не найден для данной заявки');
  }

  if (!payment.externalId) {
    throw new Error('Платёж ещё не был создан в ЮКассе (нет externalId)');
  }

  if (payment.status === 'COMPLETED') {
    return { alreadyPaid: true, status: 'succeeded' };
  }

  const credentials = Buffer.from(`${config.yookassa.shopId}:${config.yookassa.apiKey}`).toString('base64');

  const response = await fetch(`https://api.yookassa.ru/v3/payments/${payment.externalId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${credentials}`
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[PAYMENT] YooKassa check error:', response.status, errorText);
    throw new Error(`Ошибка запроса к ЮКассе: ${response.status}`);
  }

  const data = await response.json();

  console.log(`[PAYMENT] YooKassa check: app=${applicationId}, externalId=${payment.externalId}, status=${data.status}`);

  const result = {
    status: data.status,
    amount: data.amount,
    paid_at: data.captured_at || data.created_at,
    payment_method: data.payment_method?.type || null
  };

  if (data.status === 'succeeded') {
    await completeSucceededPayment(payment, applicationId, payment.externalId);
    result.completed = true;
  } else if (data.status === 'canceled') {
    if (payment.status === 'PENDING') {
      await failPayment(payment.id);
    }
    result.canceled = true;
  }

  return result;
}
