import prisma from './prisma.js';

export async function createMessage(applicationId, senderType, text, senderId = null) {
  return prisma.message.create({
    data: {
      applicationId,
      senderType,
      text,
      senderId
    }
  });
}

export async function getMessagesByApplication(applicationId, { limit = 30, before = null } = {}) {
  const where = { applicationId };
  if (before) {
    where.id = { lt: parseInt(before) };
  }

  const messages = await prisma.message.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      senderType: true,
      senderId: true,
      text: true,
      isRead: true,
      createdAt: true
    }
  });

  return messages.reverse();
}

export async function getUnreadMessageCount(applicationId, senderType) {
  // Count unread messages sent BY the given senderType (opposite side reads them)
  // For doctor view: count unread CLIENT messages
  const readBySender = senderType === 'DOCTOR' ? 'CLIENT' : 'DOCTOR';
  return prisma.message.count({
    where: {
      applicationId,
      senderType: readBySender,
      isRead: false
    }
  });
}

export async function markMessagesAsRead(applicationId, senderType) {
  // Mark messages FROM the other side as read
  // Doctor calls this → marks CLIENT messages as read
  const otherSender = senderType === 'DOCTOR' ? 'CLIENT' : 'DOCTOR';
  return prisma.message.updateMany({
    where: {
      applicationId,
      senderType: otherSender,
      isRead: false
    },
    data: { isRead: true }
  });
}

export async function getDoctorUnreadChatCount(doctorId) {
  // Count all unread CLIENT messages across all doctor's applications
  return prisma.message.count({
    where: {
      senderType: 'CLIENT',
      isRead: false,
      application: {
        doctorId
      }
    }
  });
}
