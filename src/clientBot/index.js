import { Telegraf, session } from 'telegraf';
import https from 'https';
import config from '../config/environment.js';

// Handlers
import { handleStart, handleHelp } from './handlers/start.js';
import {
  handleStartQuestionnaire,
  handleSkinTypeSelection,
  handlePriceRangeSelection,
  handleProblemsHelp,
  handleProblemSelection,
  handleProblemsDone,
  handleSkipComment,
  handleCancel,
  handleConfirmSubmit,
  handleTextMessage
} from './handlers/questionnaire.js';
import {
  handlePhotoUpload,
  handlePhotosDone,
  handleAddMorePhotos,
  handleAdditionalPhotosDone
} from './handlers/photos.js';

let bot = null;

export function createClientBot() {
  const httpsAgent = new https.Agent({
    keepAlive: true,
    keepAliveMsecs: 10000,
    timeout: 60000,
    maxSockets: 100,
    maxFreeSockets: 10
  });

  bot = new Telegraf(config.clientBot.token, {
    telegram: {
      agent: httpsAgent,
      apiRoot: 'https://api.telegram.org'
    },
    handlerTimeout: 90000
  });

  // Session middleware
  bot.use(session());

  // Logging middleware
  bot.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    console.log(`[CLIENT_BOT] ${ctx.updateType} processed in ${ms}ms`);
  });

  // Commands
  bot.command('start', handleStart);
  bot.command('help', handleHelp);

  // Callback queries - questionnaire
  bot.action('start_questionnaire', handleStartQuestionnaire);
  bot.action(/^skin_(.+)$/, handleSkinTypeSelection);
  bot.action(/^price_(.+)$/, handlePriceRangeSelection);
  bot.action('problems_help', handleProblemsHelp);
  bot.action(/^problem_(.+)$/, handleProblemSelection);
  bot.action('problems_done', handleProblemsDone);
  bot.action('skip_comment', handleSkipComment);
  bot.action('cancel', handleCancel);
  bot.action('confirm_submit', handleConfirmSubmit);

  // Callback queries - photos
  bot.action('photos_done', handlePhotosDone);
  bot.action('add_more_photos', handleAddMorePhotos);
  bot.action(/^additional_photos_done_(\d+)$/, handleAdditionalPhotosDone);

  // Photo handler
  bot.on('photo', handlePhotoUpload);

  // Text handler
  bot.on('text', async (ctx) => {
    const handled = await handleTextMessage(ctx);
    if (!handled) {
      await ctx.reply(
        'Не понял вас. Используйте /start для начала или нажмите кнопку "Новая консультация".'
      );
    }
  });

  // Error handler
  bot.catch((err, ctx) => {
    console.error(`[CLIENT_BOT] Error for ${ctx.updateType}:`, err);
    try {
      ctx.reply('Произошла ошибка. Пожалуйста, попробуйте позже или начните заново с /start');
    } catch (replyError) {
      console.error('[CLIENT_BOT] Could not send error message:', replyError);
    }
  });

  return bot;
}

export async function startClientBot() {
  // Load skin problems from database
  try {
    const { reloadSkinProblems } = await import('./states/index.js');
    const problems = await reloadSkinProblems();
    console.log(`[CLIENT_BOT] Loaded ${problems.length} skin problems from database`);
  } catch (error) {
    console.log('[CLIENT_BOT] Using default skin problems (DB not available)');
  }

  if (!bot) {
    createClientBot();
  }

  if (config.isProduction && config.server.webhookUrl) {
    // Production: используем webhook - НЕ вызываем bot.launch()!
    const webhookUrl = `${config.server.webhookUrl}/client-webhook`;
    try {
      await bot.telegram.setWebhook(webhookUrl);
      console.log(`[CLIENT_BOT] ✅ Webhook set to ${webhookUrl}`);

      // Проверяем статус webhook
      const webhookInfo = await bot.telegram.getWebhookInfo();
      console.log(`[CLIENT_BOT] Webhook info:`, {
        url: webhookInfo.url,
        pending_update_count: webhookInfo.pending_update_count,
        last_error_message: webhookInfo.last_error_message || 'none'
      });
    } catch (error) {
      console.error('[CLIENT_BOT] ❌ Error setting webhook:', error.message);
      throw error;
    }
  } else if (config.isProduction) {
    // Production но webhook URL не установлен - предупреждение
    console.warn('[CLIENT_BOT] ⚠️ PRODUCTION mode but no WEBHOOK_URL!');
    console.warn('[CLIENT_BOT] ⚠️ Set RAILWAY_PUBLIC_DOMAIN or WEBHOOK_URL');
    console.warn('[CLIENT_BOT] ⚠️ Starting in polling mode (not recommended for production)');
    await bot.launch();
    console.log('[CLIENT_BOT] Started in polling mode (temporary)');
  } else {
    // Development: используем polling
    await bot.launch();
    console.log('[CLIENT_BOT] ✅ Started in polling mode');
  }

  return bot;
}

export async function stopClientBot() {
  if (bot) {
    if (config.isProduction) {
      await bot.telegram.deleteWebhook();
    } else {
      bot.stop('SIGTERM');
    }
    console.log('[CLIENT_BOT] Stopped');
  }
}

export function getClientBot() {
  return bot;
}

export default bot;
