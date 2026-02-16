import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { getAdminByTelegramId } from '../../db/admins.js';
import { getSetting, setSetting } from '../../db/settings.js';
import prisma from '../../db/prisma.js';

const router = express.Router();

router.use(authenticateToken);
router.use(requireAdmin);

/**
 * GET /api/payments
 * List completed YooKassa payments with client info
 * Requires canSeeRevenue permission
 * Admin clients are automatically excluded from revenue summary
 * Manually excluded clients (from settings) are also excluded
 */
router.get('/', async (req, res) => {
  try {
    // Check canSeeRevenue permission
    const admin = await getAdminByTelegramId(req.user.telegramId);
    if (!admin || !admin.canSeeRevenue) {
      return res.status(403).json({ error: 'Access denied: revenue permission required' });
    }

    // Find client IDs that belong to admins (by matching telegramId)
    const admins = await prisma.admin.findMany({ select: { telegramId: true } });
    const adminTelegramIds = admins.map(a => a.telegramId);
    const adminClients = await prisma.client.findMany({
      where: { telegramId: { in: adminTelegramIds } },
      select: { id: true }
    });
    const adminClientIds = adminClients.map(c => c.id);

    // Read manually excluded client IDs from settings
    const manualExcluded = await getSetting('excludedRevenueClients') || [];
    const excludedClientIds = [...new Set([...adminClientIds, ...manualExcluded])];

    const whereClause = {
      status: 'COMPLETED',
      provider: 'YOOKASSA',
      externalId: { not: null, notIn: ['FREE_PROMO'] }
    };

    const revenueWhereClause = excludedClientIds.length > 0
      ? {
          ...whereClause,
          application: { clientId: { notIn: excludedClientIds } }
        }
      : whereClause;

    const [payments, total, aggregate, freePromoCount] = await Promise.all([
      prisma.payment.findMany({
        where: whereClause,
        include: {
          application: {
            include: {
              client: {
                select: { id: true, fullName: true, telegramUsername: true }
              }
            }
          },
          promoCode: {
            select: { code: true, discount: true }
          }
        },
        orderBy: { completedAt: 'desc' }
      }),

      prisma.payment.count({ where: whereClause }),

      prisma.payment.aggregate({
        where: revenueWhereClause,
        _sum: { amount: true, discountAmount: true },
        _count: { id: true }
      }),

      prisma.payment.count({
        where: {
          status: 'COMPLETED',
          provider: 'YOOKASSA',
          externalId: 'FREE_PROMO'
        }
      })
    ]);

    // Add excluded flag to each payment
    const paymentsWithFlag = payments.map(p => ({
      ...p,
      excluded: excludedClientIds.includes(p.application?.client?.id)
    }));

    // Collect unique clients from payments for the exclusion UI
    const clientsMap = new Map();
    for (const p of payments) {
      const client = p.application?.client;
      if (client && !clientsMap.has(client.id)) {
        clientsMap.set(client.id, {
          id: client.id,
          fullName: client.fullName,
          telegramUsername: client.telegramUsername
        });
      }
    }

    res.json({
      payments: paymentsWithFlag,
      total,
      excludedClientIds,
      clients: Array.from(clientsMap.values()),
      summary: {
        totalRevenue: aggregate._sum.amount || 0,
        totalDiscount: aggregate._sum.discountAmount || 0,
        count: aggregate._count.id || 0,
        freePromoCount
      }
    });
  } catch (error) {
    console.error('[PAYMENTS] Error listing payments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/payments/excluded-clients
 * Save manually excluded client IDs for revenue calculations
 * Requires canSeeRevenue permission
 */
router.put('/excluded-clients', async (req, res) => {
  try {
    const admin = await getAdminByTelegramId(req.user.telegramId);
    if (!admin || !admin.canSeeRevenue) {
      return res.status(403).json({ error: 'Access denied: revenue permission required' });
    }

    const { clientIds } = req.body;
    if (!Array.isArray(clientIds)) {
      return res.status(400).json({ error: 'clientIds must be an array' });
    }

    await setSetting('excludedRevenueClients', clientIds);
    res.json({ ok: true });
  } catch (error) {
    console.error('[PAYMENTS] Error updating excluded clients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
