import { createMessage } from '../../db/messages.js';
import { createCabinetNotification } from '../../services/notifications-cabinet.js';
import prisma from '../../db/prisma.js';

// Active chat sessions: clientTelegramId → { applicationId, expiresAt }
export const activeChatSessions = new Map();

const SESSION_TTL = 30 * 60 * 1000; // 30 minutes

export async function handleStartChatReply(ctx) {
  try {
    const match = ctx.match[1];
    const applicationId = parseInt(match);

    if (!applicationId) {
      return ctx.answerCbQuery('Ошибка: неверный ID заявки');
    }

    const clientTelegramId = ctx.from.id;

    // Verify the application belongs to this client
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        doctorId: true,
        displayNumber: true,
        client: { select: { telegramId: true } }
      }
    });

    if (!application || !application.client?.telegramId || Number(application.client.telegramId) !== clientTelegramId) {
      return ctx.answerCbQuery('Заявка не найдена');
    }

    if (!application.doctorId) {
      return ctx.answerCbQuery('Врач ещё не назначен');
    }

    // Create chat session
    activeChatSessions.set(clientTelegramId, {
      applicationId,
      doctorId: application.doctorId,
      displayNumber: application.displayNumber || applicationId,
      expiresAt: Date.now() + SESSION_TTL
    });

    await ctx.answerCbQuery();
    await ctx.reply(
      `Вы отвечаете на сообщение по заявке #${application.displayNumber || applicationId}.\n\nНапишите ваш ответ (у вас 30 минут).\nДля отмены отправьте /cancel_chat`
    );
  } catch (error) {
    console.error('[CHAT] Error starting chat reply:', error);
    try {
      await ctx.answerCbQuery('Произошла ошибка');
    } catch (e) { /* silent */ }
  }
}

export async function handleChatMessage(ctx) {
  const clientTelegramId = ctx.from.id;
  const session = activeChatSessions.get(clientTelegramId);

  if (!session) return false;

  // Check if session expired
  if (Date.now() > session.expiresAt) {
    activeChatSessions.delete(clientTelegramId);
    return false;
  }

  const text = ctx.message?.text;
  if (!text) return false;

  // Handle cancel
  if (text === '/cancel_chat') {
    activeChatSessions.delete(clientTelegramId);
    await ctx.reply('Режим ответа отменён.');
    return true;
  }

  // Don't intercept commands
  if (text.startsWith('/')) return false;

  try {
    // Find client
    const client = await prisma.client.findUnique({
      where: { telegramId: BigInt(clientTelegramId) },
      select: { id: true }
    });

    if (!client) {
      activeChatSessions.delete(clientTelegramId);
      return false;
    }

    // Create message
    await createMessage(session.applicationId, 'CLIENT', text, client.id);

    // Create cabinet notification for doctor
    await createCabinetNotification(
      session.doctorId,
      'CHAT_MESSAGE',
      `Сообщение от клиента — #${session.displayNumber}`,
      text.length > 100 ? text.substring(0, 100) + '...' : text,
      session.applicationId
    );

    // Reset session timer
    session.expiresAt = Date.now() + SESSION_TTL;

    await ctx.reply('Сообщение отправлено врачу. Можете написать ещё или дождаться ответа.');
    return true;
  } catch (error) {
    console.error('[CHAT] Error handling chat message:', error);
    await ctx.reply('Ошибка при отправке сообщения. Попробуйте позже.');
    return true;
  }
}

export function cleanupChatSessions() {
  const now = Date.now();
  let cleaned = 0;
  for (const [id, session] of activeChatSessions) {
    if (now > session.expiresAt) {
      activeChatSessions.delete(id);
      cleaned++;
    }
  }
  return cleaned;
}
