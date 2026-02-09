import { createPaymentRecord, completePayment, getPaymentByApplicationId } from '../db/payments.js';
import { updateApplicationStatus } from '../db/applications.js';
import { getApplicationById } from '../db/applications.js';
import { notifyAdminsNewApplication } from './notifications.js';

export const PAYMENT_AMOUNT = 500;

// Currently using MOCK provider. Switch to YOOKASSA when ready.
const PROVIDER = 'MOCK';

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
 * Process payment (mock: instant success).
 * When switching to YooKassa, this will create a checkout session
 * and return a payment URL instead of completing immediately.
 */
export async function processPayment(applicationId) {
  const payment = await getPaymentByApplicationId(applicationId);
  if (!payment) {
    throw new Error(`Payment not found for application ${applicationId}`);
  }

  if (payment.status === 'COMPLETED') {
    return { success: true, alreadyPaid: true };
  }

  // --- MOCK: instant success ---
  await completePayment(payment.id, `mock_${Date.now()}`);

  // Move application from PENDING_PAYMENT to NEW
  const application = await updateApplicationStatus(
    applicationId,
    'NEW',
    null,
    'CLIENT',
    'Оплата получена'
  );

  // Notify admins about new application
  const fullApplication = await getApplicationById(applicationId);
  await notifyAdminsNewApplication(fullApplication);

  return { success: true, alreadyPaid: false };
}
