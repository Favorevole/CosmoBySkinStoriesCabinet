import prisma from './prisma.js';
import { nanoid } from 'nanoid';
import crypto from 'crypto';

const CODE_EXPIRY_MINUTES = 5;

export async function createAuthCode(telegramId) {
  // Generate 6-digit code (cryptographically secure)
  const code = crypto.randomInt(100000, 999999).toString();

  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + CODE_EXPIRY_MINUTES);

  await prisma.authCode.create({
    data: {
      telegramId: BigInt(telegramId),
      code,
      expiresAt
    }
  });

  return code;
}

export async function verifyAuthCode(telegramId, code) {
  const authCode = await prisma.authCode.findFirst({
    where: {
      telegramId: BigInt(telegramId),
      code,
      used: false,
      expiresAt: { gt: new Date() }
    },
    orderBy: { createdAt: 'desc' }
  });

  if (!authCode) {
    return false;
  }

  // Mark as used
  await prisma.authCode.update({
    where: { id: authCode.id },
    data: { used: true }
  });

  return true;
}

export async function cleanupExpiredCodes() {
  const result = await prisma.authCode.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { used: true }
      ]
    }
  });

  if (result.count > 0) {
    console.log(`[AUTH] Cleaned up ${result.count} expired/used auth codes`);
  }
}
