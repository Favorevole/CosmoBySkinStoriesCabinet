import { Telegraf, session } from 'telegraf';
import https from 'https';
import config from '../config/environment.js';

// Handlers
import { handleStart, handleHelp, handleRegistration, getSession } from './handlers/start.js';
import {
  handleMyApplications,
  handleViewApplication,
  handleShowPhotos,
  handlePhotoNavigation,
  handleBackToList,
  handleRequestPhotos
} from './handlers/applications.js';
import {
  handleStartRecommendation,
  handleRecommendationText,
  handleConfirmRecommendation,
  handleEditRecommendation,
  handleCancelRecommendation,
  handleStartDecline,
  handleDeclineReason,
  handleConfirmDecline,
  handleCancelDecline
} from './handlers/recommendation.js';
import {
  handleAiRecommendation,
  handleAiSend,
  handleAiRefine,
  handleAiManual,
  handleAiDialogText
} from './handlers/ai.js';
import {
  handleAdminViewApp,
  handleAdminShowPhotos,
  handleAdminPhotoNav,
  handleAdminShowRec,
  handleAdminApprove,
  handleAdminConfirmApprove,
  handleAdminCancelApprove
} from './handlers/admin.js';
import { DOCTOR_STATES } from './states/index.js';

let bot = null;

export function createDoctorBot() {
  const httpsAgent = new https.Agent({
    keepAlive: true,
    keepAliveMsecs: 10000,
    timeout: 60000,
    maxSockets: 100,
    maxFreeSockets: 10
  });

  bot = new Telegraf(config.doctorBot.token, {
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
    console.log(`[DOCTOR_BOT] ${ctx.updateType} processed in ${ms}ms`);
  });

  // Commands
  bot.command('start', handleStart);
  bot.command('help', handleHelp);

  // Callback queries - application viewing
  bot.action(/^view_app_(\d+)$/, handleViewApplication);
  bot.action(/^show_photos_(\d+)$/, handleShowPhotos);
  bot.action('back_to_list', handleBackToList);
  bot.action(/^photo_next_/, (ctx) => handlePhotoNavigation(ctx, 'next'));
  bot.action(/^photo_prev_/, (ctx) => handlePhotoNavigation(ctx, 'prev'));
  bot.action('noop', (ctx) => ctx.answerCbQuery());

  // Callback queries - photo request
  bot.action(/^request_photos_(\d+)$/, handleRequestPhotos);

  // Callback queries - AI recommendations
  bot.action(/^ai_rec_(\d+)$/, handleAiRecommendation);
  bot.action(/^ai_send_(\d+)$/, handleAiSend);
  bot.action(/^ai_refine_(\d+)$/, handleAiRefine);
  bot.action(/^ai_manual_(\d+)$/, handleAiManual);

  // Callback queries - recommendations
  bot.action(/^recommend_(\d+)$/, handleStartRecommendation);
  bot.action(/^confirm_rec_(\d+)$/, handleConfirmRecommendation);
  bot.action(/^edit_rec_(\d+)$/, handleEditRecommendation);
  bot.action('cancel_rec', handleCancelRecommendation);

  // Callback queries - decline
  bot.action(/^decline_(\d+)$/, handleStartDecline);
  bot.action(/^confirm_decline_(\d+)$/, handleConfirmDecline);
  bot.action('cancel_decline', handleCancelDecline);

  // Callback queries - admin review (from notification buttons)
  bot.action(/^admin_view_(\d+)$/, handleAdminViewApp);
  bot.action(/^admin_photos_(\d+)$/, handleAdminShowPhotos);
  bot.action(/^admin_photo_next_/, (ctx) => handleAdminPhotoNav(ctx, 'next'));
  bot.action(/^admin_photo_prev_/, (ctx) => handleAdminPhotoNav(ctx, 'prev'));
  bot.action(/^admin_rec_(\d+)$/, handleAdminShowRec);
  bot.action(/^admin_approve_(\d+)$/, handleAdminApprove);
  bot.action(/^admin_confirm_approve_(\d+)$/, handleAdminConfirmApprove);
  bot.action(/^admin_cancel_approve_(\d+)$/, handleAdminCancelApprove);

  // Text handler
  bot.on('text', async (ctx) => {
    const telegramId = ctx.from.id;
    const text = ctx.message.text;
    const session = getSession(telegramId);

    // Handle menu button
    if (text === 'Мои заявки') {
      await handleMyApplications(ctx);
      return;
    }

    if (text === 'Помощь') {
      await handleHelp(ctx);
      return;
    }

    // Handle registration
    if (session.state === DOCTOR_STATES.AWAITING_REGISTRATION) {
      await handleRegistration(ctx);
      return;
    }

    // Handle recommendation text
    if (session.state === DOCTOR_STATES.WRITING_RECOMMENDATION) {
      await handleRecommendationText(ctx);
      return;
    }

    // Handle decline reason
    if (session.state === DOCTOR_STATES.CONFIRMING_DECLINE) {
      await handleDeclineReason(ctx);
      return;
    }

    // Handle AI dialog text
    if (session.state === DOCTOR_STATES.AI_DIALOG) {
      await handleAiDialogText(ctx);
      return;
    }

    // Default response
    await ctx.reply(
      'Используйте команду /start или кнопку "Мои заявки" для работы с заявками.'
    );
  });

  // Error handler
  bot.catch((err, ctx) => {
    console.error(`[DOCTOR_BOT] Error for ${ctx.updateType}:`, err);
    try {
      ctx.reply('Произошла ошибка. Попробуйте позже или начните заново с /start');
    } catch (replyError) {
      console.error('[DOCTOR_BOT] Could not send error message:', replyError);
    }
  });

  return bot;
}

export async function startDoctorBot() {
  if (!bot) {
    createDoctorBot();
  }

  if (config.isProduction && config.server.webhookUrl) {
    // Production: используем webhook - НЕ вызываем bot.launch()!
    const webhookUrl = `${config.server.webhookUrl}/doctor-webhook`;
    try {
      await bot.telegram.setWebhook(webhookUrl, { secret_token: config.webhookSecrets.doctor });
      console.log(`[DOCTOR_BOT] ✅ Webhook set to ${webhookUrl}`);

      // Проверяем статус webhook
      const webhookInfo = await bot.telegram.getWebhookInfo();
      console.log(`[DOCTOR_BOT] Webhook info:`, {
        url: webhookInfo.url,
        pending_update_count: webhookInfo.pending_update_count,
        last_error_message: webhookInfo.last_error_message || 'none'
      });
    } catch (error) {
      console.error('[DOCTOR_BOT] ❌ Error setting webhook:', error.message);
      throw error;
    }
  } else if (config.isProduction) {
    // Production но webhook URL не установлен - предупреждение
    console.warn('[DOCTOR_BOT] ⚠️ PRODUCTION mode but no WEBHOOK_URL!');
    console.warn('[DOCTOR_BOT] ⚠️ Set RAILWAY_PUBLIC_DOMAIN or WEBHOOK_URL');
    console.warn('[DOCTOR_BOT] ⚠️ Starting in polling mode (not recommended for production)');
    await bot.launch();
    console.log('[DOCTOR_BOT] Started in polling mode (temporary)');
  } else {
    // Development: используем polling
    await bot.launch();
    console.log('[DOCTOR_BOT] ✅ Started in polling mode');
  }

  return bot;
}

export async function stopDoctorBot() {
  if (bot) {
    if (config.isProduction) {
      await bot.telegram.deleteWebhook();
    } else {
      bot.stop('SIGTERM');
    }
    console.log('[DOCTOR_BOT] Stopped');
  }
}

export function getDoctorBot() {
  return bot;
}

export default bot;
