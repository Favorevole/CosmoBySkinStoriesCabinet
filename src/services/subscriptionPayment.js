import config from '../config/environment.js';
import { activateSubscription, getSubscriptionPlanById } from '../db/subscriptions.js';
import prisma from '../db/prisma.js';

/**
 * Create YooKassa payment for subscription
 * @param {number} subscriptionId - ID of pending subscription
 * @param {string} userType - 'client' or 'doctor'
 * @param {string} returnUrl - URL to redirect after payment
 */
export async function createSubscriptionPayment(subscriptionId, userType, returnUrl) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { plan: true }
  });

  if (!subscription) {
    throw new Error('Subscription not found');
  }

  if (subscription.status === 'ACTIVE') {
    return { alreadyPaid: true };
  }

  const paymentAmount = subscription.amount; // in kopecks
  const idempotenceKey = `sub_${subscriptionId}_${Date.now()}`;
  const amountValue = (paymentAmount / 100).toFixed(2);

  const body = {
    amount: {
      value: amountValue,
      currency: 'RUB'
    },
    confirmation: {
      type: 'redirect',
      return_url: returnUrl || `${config.yookassa.returnUrl}&sub=${subscriptionId}`
    },
    capture: true,
    description: `Подписка ${subscription.plan.name}`,
    receipt: {
      customer: {
        email: 'receipt@skinstories.ru'
      },
      items: [{
        description: `Подписка ${subscription.plan.name}`,
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
      subscriptionId: String(subscriptionId),
      userType
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
    console.error('[SUBSCRIPTION_PAYMENT] YooKassa error:', response.status, errorText);
    throw new Error(`YooKassa API error: ${response.status}`);
  }

  const data = await response.json();

  // Save YooKassa payment ID to subscription
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { paymentId: data.id }
  });

  console.log(`[SUBSCRIPTION_PAYMENT] YooKassa payment created: ${data.id} for subscription ${subscriptionId}, amount: ${paymentAmount}`);

  return {
    alreadyPaid: false,
    confirmationUrl: data.confirmation.confirmation_url,
    amount: paymentAmount
  };
}

/**
 * Handle YooKassa webhook for subscription payment
 * This should be called from the main webhook handler when metadata contains subscriptionId
 */
export async function handleSubscriptionPaymentWebhook(notification) {
  const { object: payment } = notification;
  const subscriptionId = parseInt(payment.metadata?.subscriptionId);

  if (!subscriptionId) {
    console.log('[SUBSCRIPTION_PAYMENT] Not a subscription payment, skipping');
    return false;
  }

  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId }
  });

  if (!subscription) {
    console.error(`[SUBSCRIPTION_PAYMENT] Subscription ${subscriptionId} not found`);
    return false;
  }

  if (payment.status === 'succeeded') {
    console.log(`[SUBSCRIPTION_PAYMENT] ✅ Payment ${payment.id} succeeded for subscription ${subscriptionId}`);

    // Activate subscription
    await activateSubscription(subscriptionId, payment.id);

    console.log(`[SUBSCRIPTION_PAYMENT] ✅ Subscription ${subscriptionId} activated`);
    return true;
  }

  if (payment.status === 'canceled') {
    console.log(`[SUBSCRIPTION_PAYMENT] ❌ Payment ${payment.id} canceled for subscription ${subscriptionId}`);

    // Mark subscription as cancelled
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: 'CANCELLED' }
    });

    return true;
  }

  console.log(`[SUBSCRIPTION_PAYMENT] Payment ${payment.id} status: ${payment.status}`);
  return false;
}

/**
 * Get subscription payment URL
 * Creates payment if not exists, returns existing URL if already created
 */
export async function getSubscriptionPaymentUrl(subscriptionId, userType) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { plan: true }
  });

  if (!subscription) {
    throw new Error('Subscription not found');
  }

  if (subscription.status === 'ACTIVE') {
    return null; // Already paid
  }

  // If payment already created, try to retrieve it
  if (subscription.paymentId) {
    try {
      const credentials = Buffer.from(`${config.yookassa.shopId}:${config.yookassa.apiKey}`).toString('base64');
      const response = await fetch(`https://api.yookassa.ru/v3/payments/${subscription.paymentId}`, {
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      });

      if (response.ok) {
        const payment = await response.json();
        if (payment.status === 'pending' && payment.confirmation?.confirmation_url) {
          return payment.confirmation.confirmation_url;
        }
      }
    } catch (error) {
      console.error('[SUBSCRIPTION_PAYMENT] Error retrieving existing payment:', error);
    }
  }

  // Create new payment
  const result = await createSubscriptionPayment(subscriptionId, userType);
  return result.alreadyPaid ? null : result.confirmationUrl;
}
