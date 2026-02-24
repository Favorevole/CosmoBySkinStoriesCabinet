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
import {
  getDoctorNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
} from '../../db/notifications.js';
import { getDoctorExtendedStats } from '../../db/doctorStats.js';
import {
  createMessage,
  getMessagesByApplication,
  markMessagesAsRead,
  getDoctorUnreadChatCount
} from '../../db/messages.js';
import prisma from '../../db/prisma.js';

const router = express.Router();

// All routes require doctor auth
router.use(authenticateDoctor);

// ==================== NOTIFICATIONS ====================

router.get('/notifications', async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(parseInt(req.query.limit) || 20, 50));
    const offset = Math.max(0, parseInt(req.query.offset) || 0);
    const unreadOnly = req.query.unreadOnly === 'true';

    const result = await getDoctorNotifications(req.doctor.id, { limit, offset, unreadOnly });
    res.json(result);
  } catch (error) {
    console.error('[DOCTOR_CABINET] Notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/notifications/unread-count', async (req, res) => {
  try {
    const count = await getUnreadCount(req.doctor.id);
    res.json({ count });
  } catch (error) {
    console.error('[DOCTOR_CABINET] Unread count error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/notifications/:id/read', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await markAsRead(id, req.doctor.id);
    res.json({ success: true });
  } catch (error) {
    console.error('[DOCTOR_CABINET] Mark read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/notifications/read-all', async (req, res) => {
  try {
    await markAllAsRead(req.doctor.id);
    res.json({ success: true });
  } catch (error) {
    console.error('[DOCTOR_CABINET] Mark all read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== STATISTICS ====================

router.get('/stats', async (req, res) => {
  try {
    const period = ['week', 'month', 'all'].includes(req.query.period) ? req.query.period : 'month';
    const stats = await getDoctorExtendedStats(req.doctor.id, period);
    res.json(stats);
  } catch (error) {
    console.error('[DOCTOR_CABINET] Stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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
    const doctorId = req.doctor.id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(parseInt(req.query.limit) || 20, 100));
    const { status } = req.query;

    const validStatuses = ['ASSIGNED', 'RESPONSE_GIVEN', 'APPROVED', 'SENT_TO_CLIENT', 'DECLINED'];
    const where = { doctorId };
    if (status) {
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Некорректный статус' });
      }
      where.status = status;
    }

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
        skip: (page - 1) * limit,
        take: limit
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
        page,
        limit,
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
    res.set('Cache-Control', 'no-store');
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

    if (links && (!Array.isArray(links) || links.some(l => !l || typeof l.url !== 'string'))) {
      return res.status(400).json({ error: 'Неверный формат ссылок' });
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

    if (reason && reason.length > 1000) {
      return res.status(400).json({ error: 'Причина отклонения не более 1000 символов' });
    }

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
        const trimmedMessage = message?.trim();
        const text = trimmedMessage
          ? `Врач просит прислать дополнительные фото:\n\n${trimmedMessage}`
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
      typeof m.content === 'string' && m.content.length > 0 && m.content.length <= MAX_MESSAGE_LENGTH
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
    if (!title?.trim() || !text?.trim()) {
      return res.status(400).json({ error: 'title и text обязательны' });
    }
    if (title.length > 200) {
      return res.status(400).json({ error: 'Название не более 200 символов' });
    }
    if (text.length > 10000) {
      return res.status(400).json({ error: 'Текст не более 10000 символов' });
    }
    if (category && category.length > 100) {
      return res.status(400).json({ error: 'Категория не более 100 символов' });
    }
    const template = await createTemplate(req.doctor.id, { title: title.trim(), text: text.trim(), category: category?.trim() || null });
    res.json({ success: true, template });
  } catch (error) {
    console.error('[DOCTOR_CABINET] Template create error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/templates/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, text, category } = req.body;
    if (title !== undefined && (!title.trim() || title.length > 200)) {
      return res.status(400).json({ error: 'Название: от 1 до 200 символов' });
    }
    if (text !== undefined && (!text.trim() || text.length > 10000)) {
      return res.status(400).json({ error: 'Текст: от 1 до 10000 символов' });
    }
    if (category !== undefined && category && category.length > 100) {
      return res.status(400).json({ error: 'Категория не более 100 символов' });
    }
    const cleanData = {};
    if (title !== undefined) cleanData.title = title.trim();
    if (text !== undefined) cleanData.text = text.trim();
    if (category !== undefined) cleanData.category = category?.trim() || null;
    const template = await updateTemplate(id, req.doctor.id, cleanData);
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
    if (!title?.trim()) {
      return res.status(400).json({ error: 'title обязателен' });
    }
    if (title.length > 200) {
      return res.status(400).json({ error: 'Название не более 200 символов' });
    }
    if (description && description.length > 5000) {
      return res.status(400).json({ error: 'Описание не более 5000 символов' });
    }
    if (steps && JSON.stringify(steps).length > 50000) {
      return res.status(400).json({ error: 'Данные шагов слишком большие' });
    }
    const program = await createProgram(req.doctor.id, { title: title.trim(), description, steps });
    res.json({ success: true, program });
  } catch (error) {
    console.error('[DOCTOR_CABINET] Program create error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/programs/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, description, steps } = req.body;
    if (title !== undefined && (!title.trim() || title.length > 200)) {
      return res.status(400).json({ error: 'Название: от 1 до 200 символов' });
    }
    if (description !== undefined && description && description.length > 5000) {
      return res.status(400).json({ error: 'Описание не более 5000 символов' });
    }
    if (steps !== undefined && JSON.stringify(steps).length > 50000) {
      return res.status(400).json({ error: 'Данные шагов слишком большие' });
    }
    const cleanData = {};
    if (title !== undefined) cleanData.title = title.trim();
    if (description !== undefined) cleanData.description = description?.trim() || null;
    if (steps !== undefined) cleanData.steps = steps;
    const program = await updateProgram(id, req.doctor.id, cleanData);
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
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'name обязателен' });
    }
    if (name.length > 200) {
      return res.status(400).json({ error: 'Название не более 200 символов' });
    }
    if (url && url.length > 2048) {
      return res.status(400).json({ error: 'URL не более 2048 символов' });
    }
    if (brand && brand.length > 200) {
      return res.status(400).json({ error: 'Бренд не более 200 символов' });
    }
    if (category && category.length > 100) {
      return res.status(400).json({ error: 'Категория не более 100 символов' });
    }
    if (notes && notes.length > 5000) {
      return res.status(400).json({ error: 'Заметки не более 5000 символов' });
    }
    const product = await createProduct(req.doctor.id, { name: name.trim(), brand, category, url, notes });
    res.json({ success: true, product });
  } catch (error) {
    console.error('[DOCTOR_CABINET] Product create error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, brand, category, url, notes } = req.body;
    if (name !== undefined && (!name.trim() || name.length > 200)) {
      return res.status(400).json({ error: 'Название: от 1 до 200 символов' });
    }
    if (brand !== undefined && brand && brand.length > 200) {
      return res.status(400).json({ error: 'Бренд не более 200 символов' });
    }
    if (category !== undefined && category && category.length > 100) {
      return res.status(400).json({ error: 'Категория не более 100 символов' });
    }
    if (url !== undefined && url && url.length > 2048) {
      return res.status(400).json({ error: 'URL не более 2048 символов' });
    }
    if (notes !== undefined && notes && notes.length > 5000) {
      return res.status(400).json({ error: 'Заметки не более 5000 символов' });
    }
    const cleanData = {};
    if (name !== undefined) cleanData.name = name.trim();
    if (brand !== undefined) cleanData.brand = brand?.trim() || null;
    if (category !== undefined) cleanData.category = category?.trim() || null;
    if (url !== undefined) cleanData.url = url?.trim() || null;
    if (notes !== undefined) cleanData.notes = notes?.trim() || null;
    const product = await updateProduct(id, req.doctor.id, cleanData);
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

// ==================== ALGORITHMS ====================

router.get('/algorithms', async (req, res) => {
  try {
    const algorithms = await prisma.careAlgorithm.findMany({
      where: { doctorId: req.doctor.id },
      include: {
        template: { select: { id: true, title: true } },
        program: { select: { id: true, title: true } }
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }]
    });
    res.json({ algorithms });
  } catch (error) {
    console.error('[DOCTOR_CABINET] Algorithms list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/algorithms', async (req, res) => {
  try {
    const { name, description, rules, matchMode, outputType, templateId, programId, customText, priority } = req.body;

    if (!name?.trim() || name.length > 200) {
      return res.status(400).json({ error: 'Название: от 1 до 200 символов' });
    }
    if (!Array.isArray(rules) || rules.length === 0) {
      return res.status(400).json({ error: 'Необходимо хотя бы одно правило' });
    }
    if (rules.length > 20) {
      return res.status(400).json({ error: 'Максимум 20 правил' });
    }
    if (!['ALL', 'ANY'].includes(matchMode)) {
      return res.status(400).json({ error: 'matchMode должен быть ALL или ANY' });
    }
    if (!['template', 'program', 'text'].includes(outputType)) {
      return res.status(400).json({ error: 'outputType должен быть template, program или text' });
    }

    const algorithm = await prisma.careAlgorithm.create({
      data: {
        doctorId: req.doctor.id,
        name: name.trim(),
        description: description?.trim() || null,
        rules,
        matchMode,
        outputType,
        templateId: templateId || null,
        programId: programId || null,
        customText: customText?.trim() || null,
        priority: parseInt(priority) || 0
      },
      include: {
        template: { select: { id: true, title: true } },
        program: { select: { id: true, title: true } }
      }
    });
    res.json({ success: true, algorithm });
  } catch (error) {
    console.error('[DOCTOR_CABINET] Algorithm create error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/algorithms/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await prisma.careAlgorithm.findFirst({
      where: { id, doctorId: req.doctor.id }
    });
    if (!existing) {
      return res.status(404).json({ error: 'Алгоритм не найден' });
    }

    const { name, description, rules, matchMode, outputType, templateId, programId, customText, priority, isActive } = req.body;
    const data = {};

    if (name !== undefined) {
      if (!name.trim() || name.length > 200) return res.status(400).json({ error: 'Название: от 1 до 200 символов' });
      data.name = name.trim();
    }
    if (description !== undefined) data.description = description?.trim() || null;
    if (rules !== undefined) {
      if (!Array.isArray(rules) || rules.length === 0) return res.status(400).json({ error: 'Необходимо хотя бы одно правило' });
      data.rules = rules;
    }
    if (matchMode !== undefined) {
      if (!['ALL', 'ANY'].includes(matchMode)) return res.status(400).json({ error: 'matchMode: ALL или ANY' });
      data.matchMode = matchMode;
    }
    if (outputType !== undefined) {
      if (!['template', 'program', 'text'].includes(outputType)) return res.status(400).json({ error: 'outputType: template, program или text' });
      data.outputType = outputType;
    }
    if (templateId !== undefined) data.templateId = templateId || null;
    if (programId !== undefined) data.programId = programId || null;
    if (customText !== undefined) data.customText = customText?.trim() || null;
    if (priority !== undefined) data.priority = parseInt(priority) || 0;
    if (isActive !== undefined) data.isActive = !!isActive;

    const algorithm = await prisma.careAlgorithm.update({
      where: { id },
      data,
      include: {
        template: { select: { id: true, title: true } },
        program: { select: { id: true, title: true } }
      }
    });
    res.json({ success: true, algorithm });
  } catch (error) {
    console.error('[DOCTOR_CABINET] Algorithm update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/algorithms/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await prisma.careAlgorithm.findFirst({
      where: { id, doctorId: req.doctor.id }
    });
    if (!existing) {
      return res.status(404).json({ error: 'Алгоритм не найден' });
    }
    await prisma.careAlgorithm.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('[DOCTOR_CABINET] Algorithm delete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/applications/:id/match-algorithms', async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: {
        doctorId: true,
        skinType: true,
        age: true,
        consultationGoal: true,
        priceRange: true,
        mainProblems: true,
        additionalComment: true,
        source: true
      }
    });

    if (!application || application.doctorId !== req.doctor.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const algorithms = await prisma.careAlgorithm.findMany({
      where: { doctorId: req.doctor.id, isActive: true },
      include: {
        template: { select: { id: true, title: true, text: true } },
        program: { select: { id: true, title: true, description: true, steps: true } }
      },
      orderBy: { priority: 'desc' }
    });

    const matched = algorithms.filter(algo => {
      const rules = algo.rules;
      if (!Array.isArray(rules) || rules.length === 0) return false;

      const results = rules.map(rule => evaluateRule(rule, application));

      return algo.matchMode === 'ALL'
        ? results.every(r => r)
        : results.some(r => r);
    });

    res.json({ algorithms: matched });
  } catch (error) {
    console.error('[DOCTOR_CABINET] Match algorithms error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function evaluateRule(rule, app) {
  const { field, operator, value } = rule;
  const appValue = app[field];

  if (appValue === null || appValue === undefined) return false;

  switch (operator) {
    case 'equals':
      return String(appValue).toLowerCase() === String(value).toLowerCase();
    case 'not_equals':
      return String(appValue).toLowerCase() !== String(value).toLowerCase();
    case 'in':
      if (!Array.isArray(value)) return false;
      return value.map(v => String(v).toLowerCase()).includes(String(appValue).toLowerCase());
    case 'gte':
      return Number(appValue) >= Number(value);
    case 'lte':
      return Number(appValue) <= Number(value);
    case 'between':
      if (!Array.isArray(value) || value.length !== 2) return false;
      return Number(appValue) >= Number(value[0]) && Number(appValue) <= Number(value[1]);
    case 'contains':
      return String(appValue).toLowerCase().includes(String(value).toLowerCase());
    default:
      return false;
  }
}

// ==================== CHAT ====================

router.get('/applications/:id/messages', async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);
    const { limit, before } = req.query;

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: { doctorId: true }
    });
    if (!application || application.doctorId !== req.doctor.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messages = await getMessagesByApplication(applicationId, {
      limit: Math.min(parseInt(limit) || 30, 50),
      before: before || null
    });
    res.json({ messages });
  } catch (error) {
    console.error('[DOCTOR_CABINET] Messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/applications/:id/messages', async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);
    const { text } = req.body;

    if (!text?.trim() || text.length > 2000) {
      return res.status(400).json({ error: 'Сообщение от 1 до 2000 символов' });
    }

    const application = await getApplicationById(applicationId);
    if (!application || application.doctorId !== req.doctor.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const message = await createMessage(applicationId, 'DOCTOR', text.trim(), req.doctor.id);

    // Send to client via Telegram
    if (application.client?.telegramId) {
      try {
        const { getClientBot } = await import('../../clientBot/index.js');
        const { Markup } = await import('telegraf');
        const bot = getClientBot();
        if (bot) {
          const appNum = application.displayNumber || application.id;
          const doctorName = application.doctor?.fullName || 'Врач';
          await bot.telegram.sendMessage(
            Number(application.client.telegramId),
            `Сообщение от врача по заявке #${appNum}:\n\n${text.trim()}`,
            {
              ...Markup.inlineKeyboard([
                [Markup.button.callback('Ответить', `chat_reply_${applicationId}`)]
              ])
            }
          );
        }
      } catch (e) {
        console.error('[DOCTOR_CABINET] Failed to send chat to client:', e.message);
      }
    }

    res.json({ success: true, message });
  } catch (error) {
    console.error('[DOCTOR_CABINET] Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/applications/:id/messages/read', async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: { doctorId: true }
    });
    if (!application || application.doctorId !== req.doctor.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await markMessagesAsRead(applicationId, 'DOCTOR');
    res.json({ success: true });
  } catch (error) {
    console.error('[DOCTOR_CABINET] Mark messages read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/chat/unread-count', async (req, res) => {
  try {
    const count = await getDoctorUnreadChatCount(req.doctor.id);
    res.json({ count });
  } catch (error) {
    console.error('[DOCTOR_CABINET] Chat unread count error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
