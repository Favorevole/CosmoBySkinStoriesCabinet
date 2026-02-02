import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import {
  getApplications,
  getApplicationById,
  assignDoctor,
  updateApplicationStatus
} from '../../db/applications.js';
import { getApplicationPhotos, getPhotoById } from '../../db/photos.js';
import {
  getRecommendationByApplicationId,
  updateRecommendation,
  approveRecommendation
} from '../../db/recommendations.js';
import {
  notifyDoctorAssignment,
  notifyClientRecommendation
} from '../../services/notifications.js';
import { getDoctorByTelegramId } from '../../db/doctors.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * GET /api/applications
 * List applications with filters
 */
router.get('/', async (req, res) => {
  try {
    const { status, doctorId, dateFrom, dateTo, page = 1, limit = 20 } = req.query;

    const filters = {
      status: status || undefined,
      doctorId: doctorId ? parseInt(doctorId) : undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined
    };

    const result = await getApplications(filters, {
      page: parseInt(page),
      limit: parseInt(limit)
    });

    // Convert BigInt to string for JSON serialization
    const applications = result.applications.map(app => ({
      ...app,
      client: app.client ? {
        ...app.client,
        telegramId: app.client.telegramId?.toString()
      } : null,
      doctor: app.doctor ? {
        ...app.doctor,
        telegramId: app.doctor.telegramId?.toString()
      } : null,
      photoCount: app.photos?.length || 0,
      hasRecommendation: !!app.recommendation
    }));

    res.json({
      applications,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('[APPLICATIONS] Error listing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/applications/:id
 * Get application details
 */
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const application = await getApplicationById(id);

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Convert BigInt and remove photo binary data
    const result = {
      ...application,
      client: application.client ? {
        ...application.client,
        telegramId: application.client.telegramId?.toString()
      } : null,
      doctor: application.doctor ? {
        ...application.doctor,
        telegramId: application.doctor.telegramId?.toString()
      } : null,
      photos: application.photos.map(p => ({
        id: p.id,
        fileName: p.fileName,
        mimeType: p.mimeType,
        fileSize: p.fileSize,
        sortOrder: p.sortOrder
      })),
      recommendation: application.recommendation ? {
        ...application.recommendation,
        doctor: application.recommendation.doctor ? {
          ...application.recommendation.doctor,
          telegramId: application.recommendation.doctor.telegramId?.toString()
        } : null
      } : null
    };

    res.json(result);

  } catch (error) {
    console.error('[APPLICATIONS] Error getting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/applications/:id/photos
 * Get application photos (metadata only)
 */
router.get('/:id/photos', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const photos = await getApplicationPhotos(id);

    res.json(photos.map(p => ({
      id: p.id,
      fileName: p.fileName,
      mimeType: p.mimeType,
      fileSize: p.fileSize,
      sortOrder: p.sortOrder
    })));

  } catch (error) {
    console.error('[APPLICATIONS] Error getting photos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/applications/:id/photos/:photoId
 * Get single photo data (binary)
 */
router.get('/:id/photos/:photoId', async (req, res) => {
  try {
    const photoId = parseInt(req.params.photoId);
    const photo = await getPhotoById(photoId);

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    res.set('Content-Type', photo.mimeType);
    res.set('Content-Disposition', `inline; filename="${photo.fileName}"`);
    res.send(photo.data);

  } catch (error) {
    console.error('[APPLICATIONS] Error getting photo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/applications/:id/assign
 * Assign doctor to application
 */
router.post('/:id/assign', async (req, res) => {
  try {
    const { doctorId } = req.body;
    const applicationId = parseInt(req.params.id);

    if (!doctorId) {
      return res.status(400).json({ error: 'doctorId required' });
    }

    const { getDoctorById } = await import('../../db/doctors.js');
    const prisma = (await import('../../db/prisma.js')).default;

    const doctor = await prisma.doctor.findUnique({
      where: { id: parseInt(doctorId) }
    });

    if (!doctor || doctor.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Doctor not found or not active' });
    }

    const application = await assignDoctor(applicationId, parseInt(doctorId), req.user.id);

    // Notify doctor
    await notifyDoctorAssignment(doctor, application);

    res.json({
      success: true,
      application: {
        ...application,
        client: application.client ? {
          ...application.client,
          telegramId: application.client.telegramId?.toString()
        } : null,
        doctor: {
          ...application.doctor,
          telegramId: application.doctor.telegramId?.toString()
        }
      }
    });

  } catch (error) {
    console.error('[APPLICATIONS] Error assigning doctor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/applications/:id/recommendation
 * Edit recommendation before sending
 */
router.patch('/:id/recommendation', async (req, res) => {
  try {
    const { text, links } = req.body;
    const applicationId = parseInt(req.params.id);

    if (!text) {
      return res.status(400).json({ error: 'text required' });
    }

    const recommendation = await updateRecommendation(
      applicationId,
      { text, links },
      req.user.id
    );

    res.json({
      success: true,
      recommendation
    });

  } catch (error) {
    console.error('[APPLICATIONS] Error updating recommendation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/applications/:id/approve
 * Approve recommendation and send to client
 */
router.post('/:id/approve', async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);

    // Approve and update status
    const application = await approveRecommendation(applicationId, req.user.id);

    // Send to client
    await notifyClientRecommendation(application);

    // Update status to sent
    await updateApplicationStatus(
      applicationId,
      'SENT_TO_CLIENT',
      req.user.id,
      'ADMIN',
      'Рекомендации отправлены клиенту'
    );

    res.json({
      success: true,
      message: 'Recommendation sent to client'
    });

  } catch (error) {
    console.error('[APPLICATIONS] Error approving:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/applications/:id/history
 * Get application status history
 */
router.get('/:id/history', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const application = await getApplicationById(id);

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(application.statusHistory);

  } catch (error) {
    console.error('[APPLICATIONS] Error getting history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
