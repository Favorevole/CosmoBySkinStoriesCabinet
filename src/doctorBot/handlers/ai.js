import { DOCTOR_STATES } from '../states/index.js';
import {
  aiResultKeyboard,
  confirmRecommendationKeyboard,
  mainMenuKeyboard
} from '../keyboards/index.js';
import { getSession, doctorSessions } from './start.js';
import { getDoctorByTelegramId } from '../../db/doctors.js';
import { getApplicationById } from '../../db/applications.js';
import { generateRecommendation, refineRecommendation } from '../../services/ai.js';
import config from '../../config/environment.js';

const MAX_REFINEMENTS = 10;

export async function handleAiRecommendation(ctx) {
  const telegramId = ctx.from.id;
  const applicationId = parseInt(ctx.callbackQuery.data.split('_').pop());

  try {
    if (!config.openai.apiKey) {
      await ctx.answerCbQuery('AI-помощник не настроен');
      await ctx.reply('AI-помощник не настроен. Обратитесь к администратору для добавления OPENAI_API_KEY.');
      return;
    }

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

    await ctx.answerCbQuery();
    const waitMsg = await ctx.reply('Генерирую AI-рекомендацию...');

    const result = await generateRecommendation(application);

    if (result.error) {
      try { await ctx.deleteMessage(waitMsg.message_id); } catch (e) {}
      await ctx.reply(`Не удалось сгенерировать рекомендацию: ${result.error}`);
      return;
    }

    const session = getSession(telegramId);
    session.state = DOCTOR_STATES.AI_DIALOG;
    session.currentApplicationId = applicationId;
    session.aiGeneratedText = result.text;
    session.aiHistory = result.history;
    session.aiRefinements = 0;
    doctorSessions.set(telegramId, session);

    try { await ctx.deleteMessage(waitMsg.message_id); } catch (e) {}

    await ctx.reply(
      `AI-рекомендация:\n\n${result.text}`,
      {
        disable_web_page_preview: true,
        ...aiResultKeyboard(applicationId)
      }
    );

  } catch (error) {
    console.error('[DOCTOR_BOT] Error in AI recommendation:', error);
    try { await ctx.answerCbQuery('Ошибка'); } catch (e) {}
  }
}

export async function handleAiSend(ctx) {
  const telegramId = ctx.from.id;
  const applicationId = parseInt(ctx.callbackQuery.data.split('_').pop());
  const session = getSession(telegramId);

  if (!session.aiGeneratedText || session.currentApplicationId !== applicationId) {
    await ctx.answerCbQuery('Сессия истекла, начните заново');
    return;
  }

  session.recommendationText = session.aiGeneratedText;
  session.state = DOCTOR_STATES.IDLE;
  doctorSessions.set(telegramId, session);

  await ctx.answerCbQuery();

  await ctx.editMessageText(
    `Предпросмотр вашего ответа:\n\n${session.recommendationText}\n\nВсё верно?`,
    {
      disable_web_page_preview: true,
      ...confirmRecommendationKeyboard(applicationId)
    }
  );
}

export async function handleAiRefine(ctx) {
  const telegramId = ctx.from.id;
  const applicationId = parseInt(ctx.callbackQuery.data.split('_').pop());
  const session = getSession(telegramId);

  if (!session.aiGeneratedText || session.currentApplicationId !== applicationId) {
    await ctx.answerCbQuery('Сессия истекла, начните заново');
    return;
  }

  session.state = DOCTOR_STATES.AI_DIALOG;
  doctorSessions.set(telegramId, session);

  await ctx.answerCbQuery();
  await ctx.reply('Напишите, что нужно изменить в рекомендации:');
}

export async function handleAiDialogText(ctx) {
  const telegramId = ctx.from.id;
  const session = getSession(telegramId);

  if (session.state !== DOCTOR_STATES.AI_DIALOG) {
    return false;
  }

  const instruction = ctx.message.text.trim();
  const applicationId = session.currentApplicationId;

  session.aiRefinements = (session.aiRefinements || 0) + 1;

  if (session.aiRefinements > MAX_REFINEMENTS) {
    await ctx.reply(
      `Достигнут лимит доработок (${MAX_REFINEMENTS}). Вы можете отправить текущий вариант или написать рекомендацию вручную.`,
      aiResultKeyboard(applicationId)
    );
    return true;
  }

  const waitMsg = await ctx.reply('Дорабатываю рекомендацию...');

  const result = await refineRecommendation(session.aiHistory, instruction);

  if (result.error) {
    try { await ctx.deleteMessage(waitMsg.message_id); } catch (e) {}
    await ctx.reply(
      `Ошибка доработки: ${result.error}\n\nТекущий вариант сохранён.`,
      aiResultKeyboard(applicationId)
    );
    return true;
  }

  session.aiGeneratedText = result.text;
  session.aiHistory = result.history;
  doctorSessions.set(telegramId, session);

  try { await ctx.deleteMessage(waitMsg.message_id); } catch (e) {}

  await ctx.reply(
    `AI-рекомендация (доработка ${session.aiRefinements}/${MAX_REFINEMENTS}):\n\n${result.text}`,
    {
      disable_web_page_preview: true,
      ...aiResultKeyboard(applicationId)
    }
  );

  return true;
}

export async function handleAiManual(ctx) {
  const telegramId = ctx.from.id;
  const applicationId = parseInt(ctx.callbackQuery.data.split('_').pop());
  const session = getSession(telegramId);

  session.state = DOCTOR_STATES.WRITING_RECOMMENDATION;
  session.currentApplicationId = applicationId;
  session.aiHistory = [];
  session.aiGeneratedText = null;
  doctorSessions.set(telegramId, session);

  await ctx.answerCbQuery();
  await ctx.reply(
    'Напишите рекомендации для клиента вручную:\n\n' +
    'Включите в ответ:\n' +
    '- Анализ состояния кожи\n' +
    '- Рекомендации по уходу\n' +
    '- Рекомендуемые средства (если есть)'
  );
}
