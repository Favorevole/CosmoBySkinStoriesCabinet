import prisma from './prisma.js';

export async function getAllPromoCodes() {
  return prisma.promoCode.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function getPromoCodeById(id) {
  return prisma.promoCode.findUnique({
    where: { id }
  });
}

export async function createPromoCode({ code, discount, maxUses, expiresAt }) {
  return prisma.promoCode.create({
    data: {
      code: code.toUpperCase().trim(),
      discount,
      maxUses: maxUses || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    }
  });
}

export async function updatePromoCode(id, data) {
  const updateData = {};
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.discount !== undefined) updateData.discount = data.discount;
  if (data.maxUses !== undefined) updateData.maxUses = data.maxUses;
  if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;

  return prisma.promoCode.update({
    where: { id },
    data: updateData
  });
}

export async function deletePromoCode(id) {
  return prisma.promoCode.delete({
    where: { id }
  });
}

export async function validatePromoCode(code) {
  const promoCode = await prisma.promoCode.findUnique({
    where: { code: code.toUpperCase().trim() }
  });

  if (!promoCode) {
    return { valid: false, promoCode: null, error: 'Промокод не найден' };
  }

  if (!promoCode.isActive) {
    return { valid: false, promoCode: null, error: 'Промокод неактивен' };
  }

  if (promoCode.expiresAt && new Date() > promoCode.expiresAt) {
    return { valid: false, promoCode: null, error: 'Срок действия промокода истёк' };
  }

  if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
    return { valid: false, promoCode: null, error: 'Промокод исчерпан' };
  }

  return { valid: true, promoCode, error: null };
}

export async function incrementPromoCodeUsage(id) {
  return prisma.promoCode.update({
    where: { id },
    data: {
      usedCount: { increment: 1 }
    }
  });
}
