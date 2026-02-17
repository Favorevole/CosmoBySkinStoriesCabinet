import { startKeyboard, mainMenuKeyboard } from '../keyboards/index.js';
import { getOrCreateClientByTelegramId } from '../../db/clients.js';
import { getClientApplications } from '../../db/applications.js';
import { formatSkinType } from '../states/index.js';
import { createAnalyticsEvent } from '../../db/analytics.js';

const WELCOME_MESSAGE = `Привет! 👋 Добро пожаловать в Skin Stories

Вы получите персональный план ухода за кожей — составленный дерматологом лично для вас.

Что внутри:
✦ Разбор вашего типа кожи и проблем
✦ Подобранные средства под ваш бюджет
✦ Рекомендации по ежедневному уходу

Как это работает:
Короткая анкета → фото → ответ дерматолога за 24 часа

Фото и данные видит только ваш врач. Без AI, без автоматики 🤍
Займёт пару минут.`;

export async function handleStart(ctx) {
  const telegramId = ctx.from.id;
  const username = ctx.from.username;
  const fullName = [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(' ');

  try {
    await getOrCreateClientByTelegramId(telegramId, username, fullName);

    // Analytics: cross-platform tracking
    try {
      const ref = ctx.startPayload || '';
      let visitorId;
      if (ref.startsWith('web_')) {
        visitorId = ref.slice(4);
      } else {
        visitorId = `tg_${telegramId}`;
      }
      await createAnalyticsEvent({
        visitorId,
        event: 'bot_start',
        referrer: null,
        metadata: { ref: ref || null, telegramId: String(telegramId) }
      });
    } catch (analyticsErr) {
      console.error('[ANALYTICS] bot_start tracking error:', analyticsErr.message);
    }

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

🎁 Подарочный сертификат:
Нажмите /gift — можно купить сертификат на консультацию в подарок.

Команды:
/new — новая консультация
/gift — подарочный сертификат
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
