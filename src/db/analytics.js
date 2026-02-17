import prisma from './prisma.js';

export async function createAnalyticsEvent({ visitorId, event, referrer, metadata }) {
  return prisma.analyticsEvent.create({
    data: { visitorId, event, referrer, metadata }
  });
}

export async function getAnalyticsSummary() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(todayStart);
  monthStart.setDate(monthStart.getDate() - 30);

  const [visitors, eventCounts, dailyStats] = await Promise.all([
    // Unique visitors today/week/month
    prisma.$queryRaw`
      SELECT
        COUNT(DISTINCT CASE WHEN created_at >= ${todayStart} THEN visitor_id END)::int AS "today",
        COUNT(DISTINCT CASE WHEN created_at >= ${weekStart} THEN visitor_id END)::int AS "week",
        COUNT(DISTINCT CASE WHEN created_at >= ${monthStart} THEN visitor_id END)::int AS "month"
      FROM analytics_events
    `,

    // Event counts for the last 30 days
    prisma.$queryRaw`
      SELECT
        COUNT(*) FILTER (WHERE event = 'page_view')::int AS "pageViews",
        COUNT(*) FILTER (WHERE event = 'click_web_form')::int AS "clickWebForm",
        COUNT(*) FILTER (WHERE event = 'click_telegram')::int AS "clickTelegram",
        COUNT(*) FILTER (WHERE event = 'click_gift')::int AS "clickGift",
        COUNT(*) FILTER (WHERE event = 'form_submit')::int AS "formSubmit",
        COUNT(*) FILTER (WHERE event = 'payment_start')::int AS "paymentStart",
        COUNT(*) FILTER (WHERE event = 'bot_start')::int AS "botStart",
        COUNT(*) FILTER (WHERE event = 'bot_quest_start')::int AS "botQuestStart",
        COUNT(*) FILTER (WHERE event = 'bot_quest_complete')::int AS "botQuestComplete"
      FROM analytics_events
      WHERE created_at >= ${monthStart}
    `,

    // Daily stats for the last 30 days
    prisma.$queryRaw`
      SELECT
        created_at::date AS "date",
        COUNT(DISTINCT visitor_id)::int AS "visitors",
        COUNT(*) FILTER (WHERE event = 'click_web_form')::int AS "clickWebForm",
        COUNT(*) FILTER (WHERE event = 'click_telegram')::int AS "clickTelegram",
        COUNT(*) FILTER (WHERE event = 'form_submit')::int AS "formSubmit",
        COUNT(*) FILTER (WHERE event = 'click_gift')::int AS "clickGift",
        COUNT(*) FILTER (WHERE event = 'bot_start')::int AS "botStart",
        COUNT(*) FILTER (WHERE event = 'bot_quest_start')::int AS "botQuestStart",
        COUNT(*) FILTER (WHERE event = 'bot_quest_complete')::int AS "botQuestComplete"
      FROM analytics_events
      WHERE created_at >= ${monthStart}
      GROUP BY created_at::date
      ORDER BY "date" DESC
    `
  ]);

  return {
    visitors: visitors[0],
    eventCounts: eventCounts[0],
    dailyStats
  };
}

const RETENTION_DAYS = 90;
const MAX_ROWS = 100_000;
const TRIM_TO = 50_000;

/**
 * Cleanup: delete events older than 90 days, then hard-cap at 100k rows
 */
export async function cleanupAnalytics() {
  // 1. TTL — delete old events
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);

  const deleted = await prisma.analyticsEvent.deleteMany({
    where: { createdAt: { lt: cutoff } }
  });
  if (deleted.count > 0) {
    console.log(`[ANALYTICS] TTL cleanup: deleted ${deleted.count} events older than ${RETENTION_DAYS} days`);
  }

  // 2. Hard cap — if still too many rows, keep only newest TRIM_TO
  const total = await prisma.analyticsEvent.count();
  if (total > MAX_ROWS) {
    const threshold = await prisma.analyticsEvent.findMany({
      orderBy: { createdAt: 'desc' },
      skip: TRIM_TO,
      take: 1,
      select: { createdAt: true }
    });
    if (threshold.length > 0) {
      const trimmed = await prisma.analyticsEvent.deleteMany({
        where: { createdAt: { lt: threshold[0].createdAt } }
      });
      console.log(`[ANALYTICS] Hard cap cleanup: ${total} rows exceeded ${MAX_ROWS}, trimmed ${trimmed.count} to keep ${TRIM_TO}`);
    }
  }

  return { deletedByTTL: deleted.count, totalAfter: await prisma.analyticsEvent.count() };
}

export async function getAnalyticsEvents({ page = 1, limit = 50 }) {
  const skip = (page - 1) * limit;

  const [events, total] = await Promise.all([
    prisma.analyticsEvent.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    }),
    prisma.analyticsEvent.count()
  ]);

  return { events, total, page, limit };
}
