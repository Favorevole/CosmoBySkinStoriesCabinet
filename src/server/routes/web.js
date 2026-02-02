import express from 'express';
import multer from 'multer';
import { createClient } from '../../db/clients.js';
import { createApplication } from '../../db/applications.js';
import { addPhotoToApplication } from '../../db/photos.js';
import { notifyAdminsNewApplication } from '../../services/notifications.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 6
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

/**
 * POST /api/web/applications
 * Create application from website form
 */
router.post('/applications', upload.array('photos', 6), async (req, res) => {
  try {
    const { age, skinType, mainProblems, additionalComment, email, phone, fullName } = req.body;
    const files = req.files;

    // Validation
    if (!age || !skinType || !mainProblems) {
      return res.status(400).json({
        error: 'Missing required fields: age, skinType, mainProblems'
      });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({
        error: 'At least one photo is required'
      });
    }

    if (files.length > 6) {
      return res.status(400).json({
        error: 'Maximum 6 photos allowed'
      });
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 12 || ageNum > 120) {
      return res.status(400).json({
        error: 'Invalid age (must be between 12 and 120)'
      });
    }

    const validSkinTypes = ['DRY', 'OILY', 'COMBINATION', 'NORMAL'];
    if (!validSkinTypes.includes(skinType)) {
      return res.status(400).json({
        error: 'Invalid skinType'
      });
    }

    // Create client (without telegramId for web users)
    const client = await createClient({
      telegramId: null,
      fullName: fullName || null,
      email: email || null,
      phone: phone || null
    });

    // Create application
    const application = await createApplication({
      clientId: client.id,
      age: ageNum,
      skinType,
      mainProblems,
      additionalComment: additionalComment || null,
      source: 'WEB'
    });

    // Save photos
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      await addPhotoToApplication(application.id, {
        fileName: file.originalname || `photo_${i + 1}.jpg`,
        mimeType: file.mimetype,
        fileSize: file.size,
        data: file.buffer,
        telegramFileId: null
      });
    }

    // Notify admins
    const fullApplication = await (await import('../../db/applications.js')).getApplicationById(application.id);
    await notifyAdminsNewApplication(fullApplication);

    res.status(201).json({
      success: true,
      applicationId: application.id,
      message: 'Application submitted successfully'
    });

  } catch (error) {
    console.error('[WEB] Error creating application:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/web/application/:id/status
 * Check application status (public, but limited info)
 */
router.get('/application/:id/status', async (req, res) => {
  try {
    const { getApplicationById } = await import('../../db/applications.js');
    const application = await getApplicationById(parseInt(req.params.id));

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const statusMessages = {
      NEW: 'Заявка получена и ожидает назначения специалиста',
      ASSIGNED: 'Заявка на рассмотрении у специалиста',
      RESPONSE_GIVEN: 'Рекомендации подготовлены и проверяются',
      APPROVED: 'Рекомендации одобрены',
      SENT_TO_CLIENT: 'Рекомендации отправлены',
      DECLINED: 'Заявка отклонена'
    };

    res.json({
      id: application.id,
      status: application.status,
      statusMessage: statusMessages[application.status] || application.status,
      createdAt: application.createdAt,
      hasDoctor: !!application.doctorId
    });

  } catch (error) {
    console.error('[WEB] Error getting status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
