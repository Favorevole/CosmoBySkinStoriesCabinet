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
 */
router.get('/', async (req, res) => {
  try {
    // Check canSeeRevenue permission
    const admin = await getAdminByTelegramId(req.user.telegramId);
    if (!admin || !admin.canSeeRevenue) {
      return res.status(403).json({ error: 'Access denied: revenue permission required' });
    }

    const excludedClientIds = (await getSetting('excludedRevenueClients')) || [];

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

    // Build unique clients list from payments
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

    // Add excluded flag to each payment
    const paymentsWithFlag = payments.map(p => ({
      ...p,
      excluded: excludedClientIds.includes(p.application?.client?.id)
    }));

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
 * Update which clients are excluded from revenue calculations
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
