import { createPaymentRecord, completePayment, failPayment, getPaymentByApplicationId, getPaymentByExternalId, updatePaymentExternalId } from '../db/payments.js';
import { updateApplicationStatus, getApplicationById } from '../db/applications.js';
import { notifyAdminsNewApplication } from './notifications.js';
import config from '../config/environment.js';

export const PAYMENT_AMOUNT = 500;

const PROVIDER = 'YOOKASSA';

/**
 * Create a pending payment for an application.
 */
export async function createPayment(applicationId) {
  return createPaymentRecord({
    applicationId,
    amount: PAYMENT_AMOUNT,
    provider: PROVIDER
  });
}

/**
 * Create a YooKassa payment and return the confirmation URL.
 */
async function createYooKassaPayment(applicationId) {
  const payment = await getPaymentByApplicationId(applicationId);
  if (!payment) {
    throw new Error(`Payment not found for application ${applicationId}`);
  }

  if (payment.status === 'COMPLETED') {
    return { alreadyPaid: true };
  }

  // If we already have an externalId, the payment was already created at YooKassa.
  // Create a new one with a fresh idempotence key to get a valid confirmation URL.

  const idempotenceKey = `app_${applicationId}_${Date.now()}`;

  const body = {
    amount: {
      value: `${PAYMENT_AMOUNT}.00`,
      currency: 'RUB'
    },
    confirmation: {
      type: 'redirect',
      return_url: config.yookassa.returnUrl
    },
    capture: true,
    description: 'Онлайн-консультация косметолога',
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

  console.log(`[PAYMENT] YooKassa payment created: ${data.id} for application ${applicationId}`);

  return {
    alreadyPaid: false,
    confirmationUrl: data.confirmation.confirmation_url
  };
}

/**
 * Process payment — creates YooKassa payment and returns URL.
 */
export async function processPayment(applicationId) {
  return createYooKassaPayment(applicationId);
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

    await completePayment(localPayment.id, yookassaPaymentId);

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

  } else if (event === 'payment.canceled' || status === 'canceled') {
    if (localPayment.status !== 'PENDING') {
      return;
    }
    await failPayment(localPayment.id);
    console.log(`[PAYMENT] Payment canceled for application ${applicationId}`);
  }
}
