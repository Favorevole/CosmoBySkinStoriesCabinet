import { startKeyboard, mainMenuKeyboard } from '../keyboards/index.js';
import { getOrCreateClientByTelegramId } from '../../db/clients.js';
import { getClientApplications } from '../../db/applications.js';
import { formatSkinType } from '../states/index.js';

const WELCOME_MESSAGE = `Привет! 👋 Добро пожаловать в Skin Stories

Здесь о вашей коже заботятся настоящие эксперты — дерматологи и косметологи с многолетним опытом.

Как это устроено:
✦ Ответите на несколько вопросов о коже
✦ Отправите фотографии
✦ Настоящий дерматолог изучит вашу ситуацию
✦ Получите персональный план ухода за 24 часа

Никакой автоматики — только внимательный взгляд специалиста и забота о вашей коже 🤍

Конфиденциально и займёт пару минут.`;

export async function handleStart(ctx) {
  const telegramId = ctx.from.id;
  const username = ctx.from.username;
  const fullName = [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(' ');

  try {
    await getOrCreateClientByTelegramId(telegramId, username, fullName);

    await ctx.reply(WELCOME_MESSAGE, {
      ...startKeyboard(),
      ...mainMenuKeyboard()
    });
  } catch (error) {
    console.error('[CLIENT_BOT] Error in /start:', error);
    await ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже.');
  }
}

export async function handleHelp(ctx) {
  const helpMessage = `Как получить консультацию:

1. Нажмите «Новая консультация» или /new
2. Заполните короткую анкету о вашей коже
3. Загрузите 1–6 фотографий
4. Подтвердите и оплатите
5. Эксперт изучит заявку и пришлёт рекомендации

Команды:
/new — новая консультация
/myapps — мои заявки
/help — справка

Обычно ответ приходит в течение 24 часов.`;

  await ctx.reply(helpMessage, mainMenuKeyboard());
}

export async function handleMyApplications(ctx) {
  const telegramId = ctx.from.id;

  try {
    const { getClientByTelegramId } = await import('../../db/clients.js');
    const client = await getClientByTelegramId(telegramId);

    if (!client) {
      await ctx.reply('Вы ещё не подавали заявок. Нажмите "Новая консультация" чтобы начать.');
      return;
    }

    const applications = await getClientApplications(client.id);

    if (applications.length === 0) {
      await ctx.reply('У вас пока нет заявок. Нажмите "Новая консультация" чтобы начать.');
      return;
    }

    const statusLabels = {
      PENDING_PAYMENT: 'Ожидает оплаты',
      NEW: 'Новая',
      ASSIGNED: 'На рассмотрении',
      RESPONSE_GIVEN: 'Ответ готов',
      APPROVED: 'Ответ одобрен',
      SENT_TO_CLIENT: 'Отправлено',
      DECLINED: 'Отклонена',
      CANCELLED: 'Отменена'
    };

    let message = 'Ваши заявки:\n\n';

    for (const app of applications) {
      const date = app.createdAt.toLocaleDateString('ru-RU');
      const status = statusLabels[app.status] || app.status;

      message += `#${app.displayNumber || app.id} от ${date}\n`;
      message += `Статус: ${status}\n`;
      message += `Тип кожи: ${formatSkinType(app.skinType)}\n`;
      if (app.doctor) {
        message += `Врач: ${app.doctor.fullName}\n`;
      }
      message += '\n';
    }

    await ctx.reply(message);
  } catch (error) {
    console.error('[CLIENT_BOT] Error fetching applications:', error);
    await ctx.reply('Произошла ошибка при загрузке заявок.');
  }
}
