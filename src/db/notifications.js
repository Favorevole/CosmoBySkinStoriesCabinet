import prisma from './prisma.js';

export async function createNotification(doctorId, type, title, message, applicationId = null) {
  return prisma.notification.create({
    data: {
      doctorId,
      type,
      title,
      message,
      applicationId
    }
  });
}

export async function getDoctorNotifications(doctorId, { limit = 20, offset = 0, unreadOnly = false } = {}) {
  const where = { doctorId };
  if (unreadOnly) where.isRead = false;

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        isRead: true,
        applicationId: true,
        createdAt: true
      }
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { doctorId, isRead: false } })
  ]);

  return { notifications, total, unreadCount };
}

export async function getUnreadCount(doctorId) {
  return prisma.notification.count({
    where: { doctorId, isRead: false }
  });
}

export async function markAsRead(id, doctorId) {
  return prisma.notification.updateMany({
    where: { id, doctorId },
    data: { isRead: true }
  });
}

export async function markAllAsRead(doctorId) {
  return prisma.notification.updateMany({
    where: { doctorId, isRead: false },
    data: { isRead: true }
  });
}

export async function cleanupOldNotifications(daysOld = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysOld);

  const result = await prisma.notification.deleteMany({
    where: {
      createdAt: { lt: cutoff },
      isRead: true
    }
  });
  return result.count;
}
