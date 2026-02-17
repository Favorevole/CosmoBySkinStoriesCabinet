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
        COUNT(*) FILTER (WHERE event = 'bot_start')::int AS "botStart"
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
        COUNT(*) FILTER (WHERE event = 'click_gift')::int AS "clickGift"
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
