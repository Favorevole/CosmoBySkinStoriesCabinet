import prisma from './prisma.js';

export async function createPaymentRecord({ applicationId, amount, provider = 'MOCK', promoCodeId = null, discountAmount = null }) {
  return prisma.payment.create({
    data: {
      applicationId,
      amount,
      provider,
      status: 'PENDING',
      promoCodeId,
      discountAmount
    }
  });
}

export async function getPaymentByApplicationId(applicationId) {
  return prisma.payment.findUnique({
    where: { applicationId }
  });
}

export async function completePayment(paymentId, externalId = null) {
  return prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: 'COMPLETED',
      externalId,
      completedAt: new Date()
    }
  });
}

export async function failPayment(paymentId) {
  return prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: 'FAILED'
    }
  });
}

export async function getPaymentByExternalId(externalId) {
  return prisma.payment.findFirst({
    where: { externalId }
  });
}

export async function updatePaymentExternalId(paymentId, externalId) {
  return prisma.payment.update({
    where: { id: paymentId },
    data: { externalId }
  });
}

export async function updatePaymentWithPromo(paymentId, { promoCodeId, discountAmount, amount }) {
  return prisma.payment.update({
    where: { id: paymentId },
    data: { promoCodeId, discountAmount, amount }
  });
}
