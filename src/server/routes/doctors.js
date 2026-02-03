import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import {
  getAllDoctors,
  getAvailableDoctors,
  getDoctorByTelegramId,
  getDoctorByUsername,
  updateDoctor,
  updateDoctorStatus,
  setDoctorAvailability,
  createInvitedDoctor
} from '../../db/doctors.js';
import { notifyDoctorStatusApproved } from '../../services/notifications.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * POST /api/doctors
 * Create a new pre-registered doctor (invite by username)
 */
router.post('/', async (req, res) => {
  try {
    const { telegramUsername, fullName, specialization } = req.body;

    if (!telegramUsername || !fullName) {
      return res.status(400).json({ error: 'telegramUsername and fullName are required' });
    }

    // Check if doctor with this username already exists
    const existing = await getDoctorByUsername(telegramUsername);
    if (existing) {
      return res.status(400).json({ error: 'Врач с таким username уже существует' });
    }

    const doctor = await createInvitedDoctor({
      telegramUsername,
      fullName,
      specialization
    });

    res.json({
      success: true,
      doctor: {
        ...doctor,
        telegramId: doctor.telegramId.toString()
      },
      message: `Врач @${doctor.telegramUsername} добавлен. Когда он запустит бота, его аккаунт будет автоматически активирован.`
    });

  } catch (error) {
    console.error('[DOCTORS] Error creating:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/doctors
 * List all doctors
 */
router.get('/', async (req, res) => {
  try {
    const doctors = await getAllDoctors();

    const result = doctors.map(d => ({
      ...d,
      telegramId: d.telegramId.toString()
    }));

    res.json(result);

  } catch (error) {
    console.error('[DOCTORS] Error listing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/doctors/available
 * List available doctors for assignment
 */
router.get('/available', async (req, res) => {
  try {
    const doctors = await getAvailableDoctors();

    const result = doctors.map(d => ({
      id: d.id,
      fullName: d.fullName,
      specialization: d.specialization,
      telegramId: d.telegramId.toString()
    }));

    res.json(result);

  } catch (error) {
    console.error('[DOCTORS] Error listing available:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/doctors/:id
 * Get doctor details
 */
router.get('/:id', async (req, res) => {
  try {
    const prisma = (await import('../../db/prisma.js')).default;

    const doctor = await prisma.doctor.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        applications: {
          select: {
            id: true,
            status: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            applications: true,
            recommendations: true
          }
        }
      }
    });

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json({
      ...doctor,
      telegramId: doctor.telegramId.toString(),
      stats: {
        totalApplications: doctor._count.applications,
        totalRecommendations: doctor._count.recommendations
      }
    });

  } catch (error) {
    console.error('[DOCTORS] Error getting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/doctors/:id
 * Update doctor (status, availability, etc.)
 */
router.patch('/:id', async (req, res) => {
  try {
    const { status, isAvailable, fullName, specialization } = req.body;
    const doctorId = parseInt(req.params.id);

    const prisma = (await import('../../db/prisma.js')).default;

    // Get current doctor
    const currentDoctor = await prisma.doctor.findUnique({
      where: { id: doctorId }
    });

    if (!currentDoctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Build update data
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
    if (fullName !== undefined) updateData.fullName = fullName;
    if (specialization !== undefined) updateData.specialization = specialization;

    const doctor = await updateDoctor(doctorId, updateData);

    // If status changed to ACTIVE, notify doctor
    if (status === 'ACTIVE' && currentDoctor.status !== 'ACTIVE') {
      await notifyDoctorStatusApproved(doctor);
    }

    res.json({
      success: true,
      doctor: {
        ...doctor,
        telegramId: doctor.telegramId.toString()
      }
    });

  } catch (error) {
    console.error('[DOCTORS] Error updating:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/doctors/:id/approve
 * Approve a pending doctor
 */
router.post('/:id/approve', async (req, res) => {
  try {
    const doctorId = parseInt(req.params.id);

    const doctor = await updateDoctorStatus(doctorId, 'ACTIVE');

    // Notify doctor
    await notifyDoctorStatusApproved(doctor);

    res.json({
      success: true,
      doctor: {
        ...doctor,
        telegramId: doctor.telegramId.toString()
      }
    });

  } catch (error) {
    console.error('[DOCTORS] Error approving:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/doctors/:id/block
 * Block a doctor
 */
router.post('/:id/block', async (req, res) => {
  try {
    const doctorId = parseInt(req.params.id);

    const doctor = await updateDoctorStatus(doctorId, 'BLOCKED');

    res.json({
      success: true,
      doctor: {
        ...doctor,
        telegramId: doctor.telegramId.toString()
      }
    });

  } catch (error) {
    console.error('[DOCTORS] Error blocking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
