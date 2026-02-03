import prisma from './prisma.js';

export async function getAdminByTelegramId(telegramId) {
  return prisma.admin.findUnique({
    where: { telegramId: BigInt(telegramId) }
  });
}

export async function getAdminByUsername(username) {
  // Remove @ if present
  const cleanUsername = username.replace(/^@/, '');
  return prisma.admin.findFirst({
    where: {
      telegramUsername: cleanUsername,
      status: 'ACTIVE'
    }
  });
}

export async function createAdmin(data) {
  return prisma.admin.create({
    data: {
      telegramId: BigInt(data.telegramId),
      telegramUsername: data.telegramUsername,
      fullName: data.fullName,
      status: 'ACTIVE'
    }
  });
}

export async function getAllAdmins() {
  return prisma.admin.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' }
  });
}

export async function isAdmin(telegramId) {
  const admin = await getAdminByTelegramId(telegramId);
  return admin && admin.status === 'ACTIVE';
}
