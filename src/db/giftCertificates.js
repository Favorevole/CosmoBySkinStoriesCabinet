import prisma from './prisma.js';

export async function createGiftCertificate({ buyerTelegramId, buyerEmail, amount, provider }) {
  return prisma.giftCertificate.create({
    data: {
      buyerTelegramId: buyerTelegramId || null,
      buyerEmail: buyerEmail || null,
      amount,
      provider,
      status: 'PENDING'
    }
  });
}

export async function getGiftCertificateById(id) {
  return prisma.giftCertificate.findUnique({
    where: { id }
  });
}

export async function getGiftCertificateByExternalId(externalId) {
  return prisma.giftCertificate.findFirst({
    where: { externalId }
  });
}

export async function updateGiftCertificateExternalId(id, externalId) {
  return prisma.giftCertificate.update({
    where: { id },
    data: { externalId }
  });
}

export async function completeGiftCertificate(id, externalId, promoCodeId) {
  return prisma.giftCertificate.update({
    where: { id },
    data: {
      status: 'COMPLETED',
      externalId,
      promoCodeId,
      completedAt: new Date()
    }
  });
}

export async function failGiftCertificate(id) {
  return prisma.giftCertificate.update({
    where: { id },
    data: {
      status: 'FAILED'
    }
  });
}
