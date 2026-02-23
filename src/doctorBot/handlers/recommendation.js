import { DOCTOR_STATES } from '../states/index.js';
import {
  confirmRecommendationKeyboard,
  confirmDeclineKeyboard,
  backToListKeyboard,
  mainMenuKeyboard
} from '../keyboards/index.js';
import { getSession, doctorSessions, clearSession } from './start.js';
import { getDoctorByTelegramId } from '../../db/doctors.js';
import { getApplicationById, declineApplication, updateApplicationStatus } from '../../db/applications.js';
import { createRecommendation } from '../../db/recommendations.js';
import { notifyAdminsDoctorResponse, notifyAdminsDecline } from '../../services/notifications.js';

export async function handleStartRecommendation(ctx) {
  const telegramId = ctx.from.id;
  const applicationId = parseInt(ctx.callbackQuery.data.split('_').pop());

  try {
    const doctor = await getDoctorByTelegramId(telegramId);
    if (!doctor) {
      await ctx.answerCbQuery('Вы не зарегистрированы как врач');
      return;
    }

    const application = await getApplicationById(applicationId);

    if (!application || application.doctorId !== doctor.id) {
      await ctx.answerCbQuery('Заявка не найдена');
      return;
    }

    if (application.status !== 'ASSIGNED') {
      await ctx.answerCbQuery('По этой заявке уже дан ответ');
      return;
    }

    const session = getSession(telegramId);
    session.state = DOCTOR_STATES.WRITING_RECOMMENDATION;
    session.currentApplicationId = applicationId;
    session.recommendationText = null;
    doctorSessions.set(telegramId, session);

    await ctx.answerCbQuery();
    await ctx.reply(
      '*Напишите рекомендации для клиента*\n\n' +
      'Включите в ответ:\n' +
      '- Анализ состояния кожи\n' +
      '- Рекомендации по уходу\n' +
      '- Рекомендуемые средства (если есть)\n\n' +
      'Вы также можете добавить ссылки на продукты.\n\n' +
      'Отправьте текст рекомендации:',
      { parse_mode: 'Markdown' }
    );

  } catch (error) {
    console.error('[DOCTOR_BOT] Error starting recommendation:', error);
    await ctx.answerCbQuery('Ошибка');
  }
}

// Escape Telegram Markdown v1 special characters
function escapeMarkdown(text) {
  return text.replace(/([_*`\[])/g, '\\$1');
}

export async function handleRecommendationText(ctx) {
  const telegramId = ctx.from.id;
  const session = getSession(telegramId);

  if (session.state !== DOCTOR_STATES.WRITING_RECOMMENDATION) {
    return false;
  }

  const text = ctx.message.text.trim();

  if (text.length < 50) {
    await ctx.reply(
      'Рекомендация слишком короткая (минимум 50 символов).\n' +
      'Пожалуйста, дайте более развернутый ответ.'
    );
    return true;
  }

  session.recommendationText = text;
  doctorSessions.set(telegramId, session);

  // Extract links from text
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const links = text.match(urlRegex) || [];

  const escaped = escapeMarkdown(text);
  let preview = `*Предпросмотр вашего ответа:*\n\n${escaped}\n`;

  if (links.length > 0) {
    preview += `\n_Найдено ссылок: ${links.length}_`;
  }

  preview += '\n\nВсё верно?';

  try {
    await ctx.reply(preview, {
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      ...confirmRecommendationKeyboard(session.currentApplicationId)
    });
  } catch (err) {
    // Fallback: send without Markdown if escaping still fails
    console.warn('[DOCTOR_BOT] Markdown preview failed, sending plain text:', err.message);
    await ctx.reply(
      `Предпросмотр вашего ответа:\n\n${text}\n${links.length > 0 ? `\nНайдено ссылок: ${links.length}` : ''}\n\nВсё верно?`,
      {
        disable_web_page_preview: true,
        ...confirmRecommendationKeyboard(session.currentApplicationId)
      }
    );
  }

  return true;
}

export async function handleConfirmRecommendation(ctx) {
  const telegramId = ctx.from.id;
  const session = getSession(telegramId);
  const applicationId = parseInt(ctx.callbackQuery.data.split('_').pop());

  if (!session.recommendationText || session.currentApplicationId !== applicationId) {
    await ctx.answerCbQuery('Сессия истекла, начните заново');
    return;
  }

  try {
    const doctor = await getDoctorByTelegramId(telegramId);
    if (!doctor) {
      await ctx.answerCbQuery('Вы не зарегистрированы как врач');
      return;
    }

    const application = await getApplicationById(applicationId);

    if (!application || application.doctorId !== doctor.id) {
      await ctx.answerCbQuery('Заявка не найдена');
      return;
    }

    if (application.status !== 'ASSIGNED') {
      await ctx.answerCbQuery('По этой заявке уже дан ответ');
      clearSession(telegramId);
      return;
    }

    // Extract links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = session.recommendationText.match(urlRegex) || [];
    const links = urls.map((url, i) => ({
      title: `Ссылка ${i + 1}`,
      url
    }));

    await createRecommendation(
      applicationId,
      doctor.id,
      session.recommendationText,
      links.length > 0 ? links : null
    );

    clearSession(telegramId);

    await ctx.answerCbQuery('Рекомендация отправлена!');
    await ctx.editMessageText(
      '*Рекомендация отправлена на проверку!*\n\n' +
      'Администратор проверит ваш ответ и отправит клиенту.',
      { parse_mode: 'Markdown' }
    );

    await ctx.reply(
      'Вы можете продолжить работу с другими заявками.',
      mainMenuKeyboard()
    );

    // Notify admins
    const updatedApp = await getApplicationById(applicationId);
    await notifyAdminsDoctorResponse(updatedApp);

  } catch (error) {
    console.error('[DOCTOR_BOT] Error confirming recommendation:', error);
    await ctx.answerCbQuery('Ошибка при сохранении');
  }
}

export async function handleEditRecommendation(ctx) {
  const telegramId = ctx.from.id;
  const session = getSession(telegramId);

  session.state = DOCTOR_STATES.WRITING_RECOMMENDATION;
  doctorSessions.set(telegramId, session);

  await ctx.answerCbQuery();
  await ctx.reply(
    'Отправьте исправленный текст рекомендации:'
  );
}

export async function handleCancelRecommendation(ctx) {
  const telegramId = ctx.from.id;
  const session = getSession(telegramId);

  session.state = DOCTOR_STATES.IDLE;
  session.recommendationText = null;
  doctorSessions.set(telegramId, session);

  await ctx.answerCbQuery('Отменено');
  await ctx.editMessageText('Написание рекомендации отменено.');
  await ctx.reply(
    'Вы можете вернуться к заявке позже.',
    mainMenuKeyboard()
  );
}

// Decline handlers
export async function handleStartDecline(ctx) {
  const telegramId = ctx.from.id;
  const applicationId = parseInt(ctx.callbackQuery.data.split('_').pop());

  try {
    const doctor = await getDoctorByTelegramId(telegramId);
    if (!doctor) {
      await ctx.answerCbQuery('Вы не зарегистрированы как врач');
      return;
    }

    const application = await getApplicationById(applicationId);

    if (!application || application.doctorId !== doctor.id) {
      await ctx.answerCbQuery('Заявка не найдена');
      return;
    }

    if (application.status !== 'ASSIGNED') {
      await ctx.answerCbQuery('Нельзя отклонить эту заявку');
      return;
    }

    const session = getSession(telegramId);
    session.state = DOCTOR_STATES.CONFIRMING_DECLINE;
    session.currentApplicationId = applicationId;
    doctorSessions.set(telegramId, session);

    await ctx.answerCbQuery();
    await ctx.reply(
      '*Отклонение заявки*\n\n' +
      'Пожалуйста, укажите причину отклонения:',
      { parse_mode: 'Markdown' }
    );

  } catch (error) {
    console.error('[DOCTOR_BOT] Error starting decline:', error);
    await ctx.answerCbQuery('Ошибка');
  }
}

export async function handleDeclineReason(ctx) {
  const telegramId = ctx.from.id;
  const session = getSession(telegramId);

  if (session.state !== DOCTOR_STATES.CONFIRMING_DECLINE) {
    return false;
  }

  const reason = ctx.message.text.trim();

  if (reason.length < 10) {
    await ctx.reply('Пожалуйста, укажите более подробную причину (минимум 10 символов).');
    return true;
  }

  session.declineReason = reason;
  doctorSessions.set(telegramId, session);

  await ctx.reply(
    `*Подтвердите отклонение*\n\nПричина: ${reason}`,
    {
      parse_mode: 'Markdown',
      ...confirmDeclineKeyboard(session.currentApplicationId)
    }
  );

  return true;
}

export async function handleConfirmDecline(ctx) {
  const telegramId = ctx.from.id;
  const session = getSession(telegramId);
  const applicationId = parseInt(ctx.callbackQuery.data.split('_').pop());

  if (!session.declineReason || session.currentApplicationId !== applicationId) {
    await ctx.answerCbQuery('Сессия истекла');
    return;
  }

  try {
    const doctor = await getDoctorByTelegramId(telegramId);
    if (!doctor) {
      await ctx.answerCbQuery('Вы не зарегистрированы как врач');
      return;
    }

    await declineApplication(applicationId, doctor.id, session.declineReason);

    const application = await getApplicationById(applicationId);

    clearSession(telegramId);

    await ctx.answerCbQuery('Заявка отклонена');
    await ctx.editMessageText('Заявка отклонена. Администратор назначит другого врача.');

    await ctx.reply(
      'Вы можете продолжить работу с другими заявками.',
      mainMenuKeyboard()
    );

    // Notify admins
    await notifyAdminsDecline(application, session.declineReason);

  } catch (error) {
    console.error('[DOCTOR_BOT] Error declining:', error);
    await ctx.answerCbQuery('Ошибка');
  }
}

export async function handleCancelDecline(ctx) {
  const telegramId = ctx.from.id;
  const session = getSession(telegramId);

  session.state = DOCTOR_STATES.IDLE;
  session.declineReason = null;
  doctorSessions.set(telegramId, session);

  await ctx.answerCbQuery('Отменено');
  await ctx.editMessageText('Отклонение отменено.');
}
