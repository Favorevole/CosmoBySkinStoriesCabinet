import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { getApplicationStats, getNewApplicationsCount } from '../../db/applications.js';
import prisma from '../../db/prisma.js';

const router = express.Router();

router.use(authenticateToken);
router.use(requireAdmin);

/**
 * GET /api/stats/dashboard
 * Get dashboard statistics
 */
router.get('/dashboard', async (req, res) => {
  try {
    const [applicationStats, doctorStats, recentApplications] = await Promise.all([
      getApplicationStats(),

      prisma.doctor.groupBy({
        by: ['status'],
        _count: { id: true }
      }),

      prisma.application.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          client: {
            select: { fullName: true, telegramUsername: true }
          },
          doctor: {
            select: { fullName: true }
          }
        }
      })
    ]);

    const doctorStatusCounts = {};
    doctorStats.forEach(s => {
      doctorStatusCounts[s.status] = s._count.id;
    });

    res.json({
      applications: {
        total: applicationStats.total,
        byStatus: applicationStats.byStatus,
        newCount: applicationStats.byStatus.NEW || 0,
        pendingReview: applicationStats.byStatus.RESPONSE_GIVEN || 0
      },
      doctors: {
        total: Object.values(doctorStatusCounts).reduce((a, b) => a + b, 0),
        active: doctorStatusCounts.ACTIVE || 0,
        pending: doctorStatusCounts.PENDING || 0
      },
      recentApplications: recentApplications.map(app => ({
        id: app.id,
        status: app.status,
        createdAt: app.createdAt,
        client: app.client?.fullName || app.client?.telegramUsername || 'Не указано',
        doctor: app.doctor?.fullName || null
      }))
    });

  } catch (error) {
    console.error('[STATS] Error getting dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/stats/doctors
 * Get doctor performance statistics
 */
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      where: { status: 'ACTIVE' },
      include: {
        _count: {
          select: {
            applications: true,
            recommendations: true
          }
        },
        applications: {
          where: {
            status: { in: ['ASSIGNED', 'RESPONSE_GIVEN'] }
          },
          select: { id: true }
        }
      }
    });

    const result = doctors.map(d => ({
      id: d.id,
      fullName: d.fullName,
      isAvailable: d.isAvailable,
      totalAssigned: d._count.applications,
      totalCompleted: d._count.recommendations,
      currentPending: d.applications.length
    }));

    res.json(result);

  } catch (error) {
    console.error('[STATS] Error getting doctor stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
