import { Telegraf, session } from 'telegraf';
import https from 'https';
import config from '../config/environment.js';

// Handlers
import { handleStart, handleHelp } from './handlers/start.js';
import {
  handleStartQuestionnaire,
  handleSkinTypeSelection,
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
  handleAddMorePhotos
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
  bot.action('problems_help', handleProblemsHelp);
  bot.action(/^problem_(.+)$/, handleProblemSelection);
  bot.action('problems_done', handleProblemsDone);
  bot.action('skip_comment', handleSkipComment);
  bot.action('cancel', handleCancel);
  bot.action('confirm_submit', handleConfirmSubmit);

  // Callback queries - photos
  bot.action('photos_done', handlePhotosDone);
  bot.action('add_more_photos', handleAddMorePhotos);

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
  if (!bot) {
    createClientBot();
  }

  if (config.isProduction && config.server.webhookUrl) {
    const webhookUrl = `${config.server.webhookUrl}/client-webhook`;
    await bot.telegram.setWebhook(webhookUrl);
    console.log(`[CLIENT_BOT] Webhook set to ${webhookUrl}`);
  } else {
    await bot.launch();
    console.log('[CLIENT_BOT] Started in polling mode');
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
