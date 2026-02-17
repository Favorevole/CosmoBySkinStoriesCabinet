import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { createAnalyticsEvent, getAnalyticsSummary, getAnalyticsEvents } from '../../db/analytics.js';

const router = express.Router();

const ALLOWED_EVENTS = [
  'page_view',
  'click_web_form',
  'click_telegram',
  'click_gift',
  'form_step',
  'form_submit',
  'payment_start'
];

/**
 * POST /api/analytics/track
 * Public, fire-and-forget — returns 204 immediately
 */
router.post('/track', (req, res) => {
  res.sendStatus(204);

  try {
    const { visitorId, event, referrer, metadata } = req.body || {};

    if (!visitorId || typeof visitorId !== 'string' || visitorId.length > 50) return;
    if (!event || !ALLOWED_EVENTS.includes(event)) return;

    createAnalyticsEvent({
      visitorId,
      event,
      referrer: typeof referrer === 'string' ? referrer.slice(0, 500) : null,
      metadata: metadata && typeof metadata === 'object' ? metadata : null
    }).catch(err => {
      console.error('[ANALYTICS] Track error:', err.message);
    });
  } catch {
    // Never fail — analytics is non-critical
  }
});

/**
 * GET /api/analytics/summary
 * Admin only — aggregated stats
 */
router.get('/summary', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const summary = await getAnalyticsSummary();
    res.json(summary);
  } catch (error) {
    console.error('[ANALYTICS] Summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/analytics/events
 * Admin only — paginated event list
 */
router.get('/events', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const result = await getAnalyticsEvents({ page, limit });
    res.json(result);
  } catch (error) {
    console.error('[ANALYTICS] Events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
