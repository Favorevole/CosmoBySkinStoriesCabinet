import { createAnalyticsEvent } from '../db/analytics.js';

export function trackBotEvent(telegramId, event, metadata) {
  createAnalyticsEvent({ visitorId: `tg_${telegramId}`, event, metadata }).catch(() => {});
}
