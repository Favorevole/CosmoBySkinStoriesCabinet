import { createPaymentRecord, completePayment, failPayment, getPaymentByApplicationId, getPaymentByExternalId, updatePaymentExternalId, updatePaymentWithPromo } from '../db/payments.js';
import { createGiftCertificate, getGiftCertificateById, getGiftCertificateByExternalId, updateGiftCertificateExternalId, completeGiftCertificate, failGiftCertificate } from '../db/giftCertificates.js';
import { updateApplicationStatus, getApplicationById } from '../db/applications.js';
import { notifyAdminsNewApplication } from './notifications.js';
import { validatePromoCode, incrementPromoCodeUsage, createPromoCode } from '../db/promoCodes.js';
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
 * Routes to gift certificate handler if metadata.type === 'gift_certificate'.
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

  // Route gift certificate payments separately
  if (paymentData.metadata?.type === 'gift_certificate') {
    console.log(`[PAYMENT] Webhook: gift certificate payment, id=${yookassaPaymentId}, status=${status}`);
    await handleGiftCertificateWebhook(paymentData, event);
    return;
  }

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

// ==================== Gift Certificates ====================

const GIFT_AMOUNT = 500;
const GIFT_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I

/**
 * Generate a readable gift code like GIFT-XXXX-XXXX.
 */
function generateGiftCode() {
  let code = 'GIFT-';
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-';
    code += GIFT_CHARS[Math.floor(Math.random() * GIFT_CHARS.length)];
  }
  return code;
}

/**
 * Create a gift certificate payment via YooKassa.
 * Accepts { buyerTelegramId } (bot) or { buyerEmail } (web).
 * Returns { giftCertificateId, confirmationUrl }.
 */
export async function createGiftPayment({ buyerTelegramId, buyerEmail } = {}) {
  const gift = await createGiftCertificate({
    buyerTelegramId: buyerTelegramId ? BigInt(buyerTelegramId) : null,
    buyerEmail: buyerEmail || null,
    amount: GIFT_AMOUNT,
    provider: 'YOOKASSA'
  });

  const idempotenceKey = `gift_${gift.id}_${Date.now()}`;
  const amountValue = `${GIFT_AMOUNT}.00`;

  const body = {
    amount: {
      value: amountValue,
      currency: 'RUB'
    },
    confirmation: {
      type: 'redirect',
      return_url: `${config.yookassa.returnUrl}&gift=${gift.id}`
    },
    capture: true,
    description: 'Подарочный сертификат на консультацию косметолога',
    receipt: {
      customer: {
        email: 'receipt@skinstories.ru'
      },
      items: [{
        description: 'Подарочный сертификат на консультацию косметолога',
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
      type: 'gift_certificate',
      giftCertificateId: String(gift.id)
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
    console.error('[GIFT] YooKassa error:', response.status, errorText);
    throw new Error(`YooKassa API error: ${response.status}`);
  }

  const data = await response.json();

  await updateGiftCertificateExternalId(gift.id, data.id);

  console.log(`[GIFT] YooKassa payment created: ${data.id} for gift certificate ${gift.id}`);

  return {
    giftCertificateId: gift.id,
    confirmationUrl: data.confirmation.confirmation_url
  };
}

/**
 * Handle YooKassa webhook for gift certificate payments.
 */
async function handleGiftCertificateWebhook(paymentData, event) {
  const yookassaPaymentId = paymentData.id;
  const status = paymentData.status;
  const giftCertificateId = parseInt(paymentData.metadata?.giftCertificateId);

  // Find gift certificate
  let gift = await getGiftCertificateByExternalId(yookassaPaymentId);
  if (!gift && giftCertificateId) {
    gift = await getGiftCertificateById(giftCertificateId);
    if (gift) {
      await updateGiftCertificateExternalId(gift.id, yookassaPaymentId);
    }
  }

  if (!gift) {
    console.warn(`[GIFT] Webhook: gift certificate not found for payment ${yookassaPaymentId}`);
    return;
  }

  if (event === 'payment.succeeded' || status === 'succeeded') {
    if (gift.status === 'COMPLETED') {
      console.log(`[GIFT] Webhook: gift ${gift.id} already completed`);
      return;
    }

    // Generate unique promo code
    const giftCode = generateGiftCode();
    const promoCode = await createPromoCode({
      code: giftCode,
      discount: 100,
      maxUses: 1
    });

    await completeGiftCertificate(gift.id, yookassaPaymentId, promoCode.id);

    // Send promo code to buyer via Telegram (if purchased from bot)
    if (gift.buyerTelegramId) {
      try {
        const { getClientBot } = await import('../clientBot/index.js');
        const bot = getClientBot();
        if (bot) {
          await bot.telegram.sendMessage(
            gift.buyerTelegramId.toString(),
            `*Подарочный сертификат готов!* 🎁\n\n` +
            `Ваш промокод на бесплатную консультацию:\n\n` +
            `\`${giftCode}\`\n\n` +
            `Передайте этот код получателю. Он вводится при оплате консультации и даёт 100% скидку.\n\n` +
            `Код одноразовый — действует до первого использования.`,
            { parse_mode: 'Markdown' }
          );
        }
      } catch (err) {
        console.error('[GIFT] Error sending Telegram message to buyer:', err.message);
      }
    }

    // Send promo code to buyer via email (if purchased from web)
    if (gift.buyerEmail) {
      try {
        const { sendGiftCertificateEmail } = await import('./email.js');
        await sendGiftCertificateEmail({ to: gift.buyerEmail, giftCode });
      } catch (err) {
        console.error('[GIFT] Error sending email to buyer:', err.message);
      }
    }

    console.log(`[GIFT] Gift certificate ${gift.id} completed, promo code: ${giftCode}`);

  } else if (event === 'payment.canceled' || status === 'canceled') {
    if (gift.status !== 'PENDING') {
      return;
    }
    await failGiftCertificate(gift.id);
    console.log(`[GIFT] Gift certificate ${gift.id} payment canceled`);
  }
}

/**
 * Check gift certificate status. If payment succeeded at YooKassa but webhook
 * hasn't fired yet, completes the gift certificate and returns the promo code.
 */
export async function checkGiftCertificateStatus(giftCertificateId) {
  const gift = await getGiftCertificateById(giftCertificateId);
  if (!gift) {
    throw new Error('Сертификат не найден');
  }

  // Already completed — return promo code
  if (gift.status === 'COMPLETED' && gift.promoCodeId) {
    const { getPromoCodeById } = await import('../db/promoCodes.js');
    const promo = await getPromoCodeById(gift.promoCodeId);
    return { status: 'COMPLETED', promoCode: promo?.code || null };
  }

  if (gift.status === 'FAILED') {
    return { status: 'FAILED' };
  }

  // Still pending — check with YooKassa
  if (!gift.externalId) {
    return { status: 'PENDING' };
  }

  const credentials = Buffer.from(`${config.yookassa.shopId}:${config.yookassa.apiKey}`).toString('base64');

  const response = await fetch(`https://api.yookassa.ru/v3/payments/${gift.externalId}`, {
    method: 'GET',
    headers: { 'Authorization': `Basic ${credentials}` }
  });

  if (!response.ok) {
    return { status: 'PENDING' };
  }

  const data = await response.json();

  if (data.status === 'succeeded') {
    // Complete the gift certificate (webhook may not have fired yet)
    const giftCode = generateGiftCode();
    const promoCode = await createPromoCode({
      code: giftCode,
      discount: 100,
      maxUses: 1
    });

    await completeGiftCertificate(gift.id, gift.externalId, promoCode.id);

    // Also send notifications
    if (gift.buyerTelegramId) {
      try {
        const { getClientBot } = await import('../clientBot/index.js');
        const bot = getClientBot();
        if (bot) {
          await bot.telegram.sendMessage(
            gift.buyerTelegramId.toString(),
            `*Подарочный сертификат готов!* 🎁\n\n` +
            `Ваш промокод на бесплатную консультацию:\n\n` +
            `\`${giftCode}\`\n\n` +
            `Передайте этот код получателю. Он вводится при оплате консультации и даёт 100% скидку.\n\n` +
            `Код одноразовый — действует до первого использования.`,
            { parse_mode: 'Markdown' }
          );
        }
      } catch (err) {
        console.error('[GIFT] Error sending Telegram message:', err.message);
      }
    }

    if (gift.buyerEmail) {
      try {
        const { sendGiftCertificateEmail } = await import('./email.js');
        await sendGiftCertificateEmail({ to: gift.buyerEmail, giftCode });
      } catch (err) {
        console.error('[GIFT] Error sending email:', err.message);
      }
    }

    return { status: 'COMPLETED', promoCode: giftCode };
  }

  if (data.status === 'canceled') {
    await failGiftCertificate(gift.id);
    return { status: 'FAILED' };
  }

  return { status: 'PENDING' };
}
