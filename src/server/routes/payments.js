import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { getAdminByTelegramId } from '../../db/admins.js';
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

    const whereClause = {
      status: 'COMPLETED',
      provider: 'YOOKASSA',
      externalId: { not: null, notIn: ['FREE_PROMO'] }
    };

    const [payments, total, aggregate, freePromoCount] = await Promise.all([
      prisma.payment.findMany({
        where: whereClause,
        include: {
          application: {
            include: {
              client: {
                select: { fullName: true, telegramUsername: true }
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
        where: whereClause,
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

    res.json({
      payments,
      total,
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

export default router;
