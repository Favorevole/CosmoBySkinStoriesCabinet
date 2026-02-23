import express from 'express';
import rateLimit from 'express-rate-limit';
import { authenticateDoctor } from '../middleware/doctorAuth.js';
import {
  getApplicationById,
  getApplications,
  declineApplication,
  updateApplicationStatus
} from '../../db/applications.js';
import { getPhotoById, getPhotoData } from '../../db/photos.js';
import { createRecommendation, getRecommendationByApplicationId } from '../../db/recommendations.js';
import { createTemplate, getTemplates, updateTemplate, deleteTemplate } from '../../db/careTemplates.js';
import { createProgram, getPrograms, updateProgram, deleteProgram } from '../../db/carePrograms.js';
import { createProduct, getProducts, updateProduct, deleteProduct } from '../../db/doctorProducts.js';
import { generateRecommendation, refineRecommendation } from '../../services/ai.js';
import prisma from '../../db/prisma.js';

const router = express.Router();

// All routes require doctor auth
router.use(authenticateDoctor);

// ==================== DASHBOARD ====================

router.get('/dashboard', async (req, res) => {
  try {
    const doctorId = req.doctor.id;

    const [assigned, completed, total] = await Promise.all([
      prisma.application.count({
        where: { doctorId, status: 'ASSIGNED' }
      }),
      prisma.application.count({
        where: { doctorId, status: { in: ['RESPONSE_GIVEN', 'APPROVED', 'SENT_TO_CLIENT'] } }
      }),
      prisma.application.count({
        where: { doctorId }
      })
    ]);

    // Recent applications
    const recentApplications = await prisma.application.findMany({
      where: { doctorId, status: 'ASSIGNED' },
      select: {
        id: true,
        status: true,
        createdAt: true,
        assignedAt: true,
        client: {
          select: { id: true, fullName: true }
        }
      },
      orderBy: { assignedAt: 'desc' },
      take: 5
    });

    res.json({
      stats: { assigned, completed, total },
      recentApplications
    });
  } catch (error) {
    console.error('[DOCTOR_CABINET] Dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== APPLICATIONS ====================

router.get('/applications', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const doctorId = req.doctor.id;

    const where = { doctorId };
    if (status) where.status = status;

    const [total, applications] = await Promise.all([
      prisma.application.count({ where }),
      prisma.application.findMany({
        where,
        select: {
          id: true,
          status: true,
          age: true,
          skinType: true,
          mainProblems: true,
          createdAt: true,
          assignedAt: true,
          completedAt: true,
          client: {
            select: { id: true, fullName: true, telegramUsername: true }
          },
          _count: {
            select: { photos: true }
          },
          recommendation: {
            select: { id: true }
          }
        },
        orderBy: { assignedAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit)
      })
    ]);

    res.json({
      applications: applications.map(app => ({
        ...app,
        photoCount: app._count?.photos || 0,
        hasRecommendation: !!app.recommendation
      })),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('[DOCTOR_CABINET] Applications list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/applications/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const application = await getApplicationById(id);

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (application.doctorId !== req.doctor.id) {
      return res.status(403).json({ error: 'This application is not assigned to you' });
    }

    res.json({
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
    });
  } catch (error) {
    console.error('[DOCTOR_CABINET] Application detail error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/applications/:id/photos/:photoId', async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);
    const photoId = parseInt(req.params.photoId);

    // Verify application belongs to this doctor
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: { doctorId: true }
    });

    if (!application || application.doctorId !== req.doctor.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const photo = await getPhotoById(photoId);
    if (!photo || photo.applicationId !== applicationId) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    const data = await getPhotoData(photo);
    if (!data) {
      return res.status(404).json({ error: 'Photo data not available' });
    }

    res.set('Content-Type', photo.mimeType);
    res.set('Content-Disposition', `inline; filename="${photo.fileName}"`);
    res.set('Cache-Control', 'private, max-age=86400');
    res.send(data);
  } catch (error) {
    console.error('[DOCTOR_CABINET] Photo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/applications/:id/recommendation', async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);
    const { text, links } = req.body;

    if (!text || text.length < 50) {
      return res.status(400).json({ error: 'Рекомендация должна быть не менее 50 символов' });
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: { doctorId: true, status: true }
    });

    if (!application || application.doctorId !== req.doctor.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (application.status !== 'ASSIGNED') {
      return res.status(400).json({ error: 'Рекомендация уже создана или заявка не в статусе ASSIGNED' });
    }

    // Extract URLs from text
    const urlRegex = /https?:\/\/[^\s)]+/g;
    const extractedUrls = text.match(urlRegex) || [];
    const allLinks = links || extractedUrls.map(url => ({ title: url, url }));

    const recommendation = await createRecommendation(
      applicationId,
      req.doctor.id,
      text,
      allLinks.length > 0 ? allLinks : null
    );

    // Notify admins
    try {
      const { notifyAdminsDoctorResponse } = await import('../../services/notifications.js');
      const fullApp = await getApplicationById(applicationId);
      await notifyAdminsDoctorResponse(fullApp);
    } catch (e) {
      console.error('[DOCTOR_CABINET] Failed to notify admins:', e.message);
    }

    res.json({ success: true, recommendation });
  } catch (error) {
    console.error('[DOCTOR_CABINET] Recommendation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/applications/:id/decline', async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);
    const { reason } = req.body;

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: { doctorId: true, status: true }
    });

    if (!application || application.doctorId !== req.doctor.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (application.status !== 'ASSIGNED') {
      return res.status(400).json({ error: 'Нельзя отклонить эту заявку' });
    }

    const declineReason = reason || 'Отклонено врачом';
    await declineApplication(applicationId, req.doctor.id, declineReason);

    // Notify admins about decline (matching bot behavior)
    try {
      const { notifyAdminsDecline } = await import('../../services/notifications.js');
      const fullApp = await getApplicationById(applicationId);
      await notifyAdminsDecline(fullApp, declineReason);
    } catch (e) {
      console.error('[DOCTOR_CABINET] Failed to notify admins about decline:', e.message);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('[DOCTOR_CABINET] Decline error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/applications/:id/request-photos', async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);
    const { message } = req.body;

    if (message && message.length > 500) {
      return res.status(400).json({ error: 'Сообщение не более 500 символов' });
    }

    const application = await getApplicationById(applicationId);
    if (!application || application.doctorId !== req.doctor.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Send notification to client requesting more photos
    try {
      const { getClientBot } = await import('../../clientBot/index.js');
      const bot = getClientBot();
      if (bot && application.client?.telegramId) {
        const text = message
          ? `Врач просит прислать дополнительные фото:\n\n${message}`
          : 'Врач просит прислать дополнительные фото для более точной рекомендации.';
        await bot.telegram.sendMessage(Number(application.client.telegramId), text);
      }
    } catch (e) {
      console.error('[DOCTOR_CABINET] Failed to notify client:', e.message);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('[DOCTOR_CABINET] Request photos error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== AI HELPER ====================

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Слишком много запросов к AI. Попробуйте через 15 минут.' }
});

router.post('/applications/:id/ai-generate', aiLimiter, async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);

    const application = await getApplicationById(applicationId);
    if (!application || application.doctorId !== req.doctor.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await generateRecommendation(application);

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      text: result.text,
      usage: result.usage
    });
  } catch (error) {
    console.error('[DOCTOR_CABINET] AI generate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/applications/:id/ai-refine', aiLimiter, async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);
    const { history, instruction } = req.body;

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: { doctorId: true }
    });

    if (!application || application.doctorId !== req.doctor.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!history || !instruction) {
      return res.status(400).json({ error: 'history и instruction обязательны' });
    }

    if (!Array.isArray(history) || history.length === 0 || history.length > 20) {
      return res.status(400).json({ error: 'history должен быть массивом (1-20 сообщений)' });
    }

    const validRoles = new Set(['system', 'user', 'assistant']);
    const MAX_MESSAGE_LENGTH = 5000;
    const isValidHistory = history.every(m =>
      m && typeof m.role === 'string' && validRoles.has(m.role) &&
      typeof m.content === 'string' && m.content.length <= MAX_MESSAGE_LENGTH
    );
    if (!isValidHistory) {
      return res.status(400).json({ error: 'Неверный формат history или сообщение слишком длинное' });
    }

    if (instruction.length > 500) {
      return res.status(400).json({ error: 'Инструкция не более 500 символов' });
    }

    const result = await refineRecommendation(history, instruction);

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      text: result.text,
      usage: result.usage
    });
  } catch (error) {
    console.error('[DOCTOR_CABINET] AI refine error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== PATIENTS ====================

router.get('/patients', async (req, res) => {
  try {
    const doctorId = req.doctor.id;

    const applications = await prisma.application.findMany({
      where: { doctorId },
      select: {
        id: true,
        status: true,
        createdAt: true,
        client: {
          select: {
            id: true,
            fullName: true,
            telegramUsername: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Group by client
    const clientMap = new Map();
    for (const app of applications) {
      if (!app.client) continue;
      const clientId = app.client.id;
      if (!clientMap.has(clientId)) {
        clientMap.set(clientId, {
          ...app.client,
          applicationsCount: 0,
          lastApplicationDate: null,
          applications: []
        });
      }
      const entry = clientMap.get(clientId);
      entry.applicationsCount++;
      if (!entry.lastApplicationDate || app.createdAt > entry.lastApplicationDate) {
        entry.lastApplicationDate = app.createdAt;
      }
      entry.applications.push({
        id: app.id,
        status: app.status,
        createdAt: app.createdAt
      });
    }

    const patients = Array.from(clientMap.values())
      .sort((a, b) => new Date(b.lastApplicationDate) - new Date(a.lastApplicationDate));

    res.json({ patients });
  } catch (error) {
    console.error('[DOCTOR_CABINET] Patients error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== TEMPLATES ====================

router.get('/templates', async (req, res) => {
  try {
    const templates = await getTemplates(req.doctor.id);
    res.json({ templates });
  } catch (error) {
    console.error('[DOCTOR_CABINET] Templates list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/templates', async (req, res) => {
  try {
    const { title, text, category } = req.body;
    if (!title || !text) {
      return res.status(400).json({ error: 'title и text обязательны' });
    }
    if (title.length > 200) {
      return res.status(400).json({ error: 'Название не более 200 символов' });
    }
    if (text.length > 10000) {
      return res.status(400).json({ error: 'Текст не более 10000 символов' });
    }
    const template = await createTemplate(req.doctor.id, { title, text, category });
    res.json({ success: true, template });
  } catch (error) {
    console.error('[DOCTOR_CABINET] Template create error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/templates/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const template = await updateTemplate(id, req.doctor.id, req.body);
    res.json({ success: true, template });
  } catch (error) {
    if (error.message === 'Template not found') {
      return res.status(404).json({ error: 'Шаблон не найден' });
    }
    console.error('[DOCTOR_CABINET] Template update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/templates/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await deleteTemplate(id, req.doctor.id);
    res.json({ success: true });
  } catch (error) {
    if (error.message === 'Template not found') {
      return res.status(404).json({ error: 'Шаблон не найден' });
    }
    console.error('[DOCTOR_CABINET] Template delete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== PROGRAMS ====================

router.get('/programs', async (req, res) => {
  try {
    const programs = await getPrograms(req.doctor.id);
    res.json({ programs });
  } catch (error) {
    console.error('[DOCTOR_CABINET] Programs list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/programs', async (req, res) => {
  try {
    const { title, description, steps } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'title обязателен' });
    }
    if (title.length > 200) {
      return res.status(400).json({ error: 'Название не более 200 символов' });
    }
    const program = await createProgram(req.doctor.id, { title, description, steps });
    res.json({ success: true, program });
  } catch (error) {
    console.error('[DOCTOR_CABINET] Program create error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/programs/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const program = await updateProgram(id, req.doctor.id, req.body);
    res.json({ success: true, program });
  } catch (error) {
    if (error.message === 'Program not found') {
      return res.status(404).json({ error: 'Программа не найдена' });
    }
    console.error('[DOCTOR_CABINET] Program update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/programs/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await deleteProgram(id, req.doctor.id);
    res.json({ success: true });
  } catch (error) {
    if (error.message === 'Program not found') {
      return res.status(404).json({ error: 'Программа не найдена' });
    }
    console.error('[DOCTOR_CABINET] Program delete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== PRODUCTS ====================

router.get('/products', async (req, res) => {
  try {
    const { category } = req.query;
    const products = await getProducts(req.doctor.id, category);
    res.json({ products });
  } catch (error) {
    console.error('[DOCTOR_CABINET] Products list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/products', async (req, res) => {
  try {
    const { name, brand, category, url, notes } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'name обязателен' });
    }
    if (name.length > 200) {
      return res.status(400).json({ error: 'Название не более 200 символов' });
    }
    const product = await createProduct(req.doctor.id, { name, brand, category, url, notes });
    res.json({ success: true, product });
  } catch (error) {
    console.error('[DOCTOR_CABINET] Product create error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const product = await updateProduct(id, req.doctor.id, req.body);
    res.json({ success: true, product });
  } catch (error) {
    if (error.message === 'Product not found') {
      return res.status(404).json({ error: 'Продукт не найден' });
    }
    console.error('[DOCTOR_CABINET] Product update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await deleteProduct(id, req.doctor.id);
    res.json({ success: true });
  } catch (error) {
    if (error.message === 'Product not found') {
      return res.status(404).json({ error: 'Продукт не найден' });
    }
    console.error('[DOCTOR_CABINET] Product delete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
