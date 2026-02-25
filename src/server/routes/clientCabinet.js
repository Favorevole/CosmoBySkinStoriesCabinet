import express from 'express';
import rateLimit from 'express-rate-limit';
import { authenticateClient } from '../middleware/clientAuth.js';
import {
  registerClient,
  loginClient,
  getClientById,
  updateClientProfile,
  changeClientPassword
} from '../../db/clientAuth.js';
import { getApplications } from '../../db/applications.js';
import { getRecommendationByApplicationId } from '../../db/recommendations.js';
import {
  getClientProcedures,
  getProcedureById,
  createProcedure,
  updateProcedure,
  completeProcedure,
  deleteProcedure,
  getUpcomingProcedures
} from '../../db/procedures.js';
import prisma from '../../db/prisma.js';

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: 'Too many requests, please try again later'
});

// ==================== AUTHENTICATION ====================

/**
 * POST /api/client/auth/register
 * Register new client
 */
router.post('/auth/register', authLimiter, async (req, res) => {
  const requestId = `REG-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  console.log(`\n========== [${requestId}] CLIENT REGISTRATION START ==========`);
  console.log('Timestamp:', new Date().toISOString());
  console.log('IP:', req.ip);
  console.log('User-Agent:', req.headers['user-agent']);
  console.log('Request Body:', {
    email: req.body.email ? `${req.body.email.substring(0, 3)}***@${req.body.email.split('@')[1] || '?'}` : 'missing',
    fullName: req.body.fullName || 'missing',
    passwordLength: req.body.password?.length || 0
  });

  try {
    const { email, password, fullName } = req.body;

    // Validation
    console.log(`[${requestId}] Validating input...`);

    if (!email || !email.trim()) {
      console.log(`[${requestId}] ❌ VALIDATION FAILED: Email missing`);
      return res.status(400).json({ error: 'Email обязателен' });
    }
    if (!password || password.length < 6) {
      console.log(`[${requestId}] ❌ VALIDATION FAILED: Password too short (${password?.length || 0} chars)`);
      return res.status(400).json({ error: 'Пароль должен быть не менее 6 символов' });
    }
    if (!fullName || !fullName.trim()) {
      console.log(`[${requestId}] ❌ VALIDATION FAILED: FullName missing`);
      return res.status(400).json({ error: 'Имя обязательно' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log(`[${requestId}] ❌ VALIDATION FAILED: Invalid email format`);
      return res.status(400).json({ error: 'Неверный формат email' });
    }

    console.log(`[${requestId}] ✅ Validation passed`);
    console.log(`[${requestId}] Creating client in database...`);

    const client = await registerClient({
      email: email.trim().toLowerCase(),
      password,
      fullName: fullName.trim()
    });

    console.log(`[${requestId}] ✅ Client created successfully:`, {
      id: client.id,
      email: client.email,
      fullName: client.fullName
    });
    console.log(`========== [${requestId}] REGISTRATION SUCCESS ==========\n`);

    res.json({ success: true, client });
  } catch (error) {
    console.log(`[${requestId}] ❌ ERROR CAUGHT:`, error.message);
    console.error(`[${requestId}] Error stack:`, error.stack);

    if (error.message === 'EMAIL_EXISTS') {
      console.log(`[${requestId}] Email already registered`);
      console.log(`========== [${requestId}] REGISTRATION FAILED (Duplicate Email) ==========\n`);
      return res.status(400).json({ error: 'Этот email уже зарегистрирован' });
    }
    console.error(`[${requestId}] ❌ UNEXPECTED ERROR:`, error);
    console.log(`========== [${requestId}] REGISTRATION FAILED (Server Error) ==========\n`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/client/auth/login
 * Login client
 */
router.post('/auth/login', authLimiter, async (req, res) => {
  const requestId = `LOGIN-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  console.log(`\n========== [${requestId}] CLIENT LOGIN START ==========`);
  console.log('Timestamp:', new Date().toISOString());
  console.log('IP:', req.ip);
  console.log('Request Body:', {
    email: req.body.email ? `${req.body.email.substring(0, 3)}***@${req.body.email.split('@')[1] || '?'}` : 'missing',
    hasPassword: !!req.body.password
  });

  try {
    const { email, password } = req.body;

    console.log(`[${requestId}] Validating input...`);

    if (!email || !password) {
      console.log(`[${requestId}] ❌ VALIDATION FAILED: Missing credentials`);
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    console.log(`[${requestId}] ✅ Validation passed`);
    console.log(`[${requestId}] Authenticating client...`);

    const result = await loginClient({
      email: email.trim().toLowerCase(),
      password
    });

    console.log(`[${requestId}] ✅ Login successful:`, {
      clientId: result.client?.id,
      email: result.client?.email,
      tokenGenerated: !!result.token
    });
    console.log(`========== [${requestId}] LOGIN SUCCESS ==========\n`);

    res.json({ success: true, ...result });
  } catch (error) {
    console.log(`[${requestId}] ❌ ERROR CAUGHT:`, error.message);

    if (error.message === 'INVALID_CREDENTIALS') {
      console.log(`[${requestId}] Invalid credentials provided`);
      console.log(`========== [${requestId}] LOGIN FAILED (Invalid Credentials) ==========\n`);
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    console.error(`[${requestId}] ❌ UNEXPECTED ERROR:`, error);
    console.error(`[${requestId}] Error stack:`, error.stack);
    console.log(`========== [${requestId}] LOGIN FAILED (Server Error) ==========\n`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/client/auth/me
 * Get current client info
 */
router.get('/auth/me', authenticateClient, async (req, res) => {
  try {
    res.json({ client: req.client });
  } catch (error) {
    console.error('[CLIENT_AUTH] Me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== PROFILE ====================

/**
 * PATCH /api/client/profile
 * Update client profile
 */
router.patch('/profile', authenticateClient, async (req, res) => {
  try {
    const { fullName, phone } = req.body;

    // Validation
    if (fullName !== undefined && (!fullName.trim() || fullName.length > 200)) {
      return res.status(400).json({ error: 'Имя: от 1 до 200 символов' });
    }
    if (phone !== undefined && phone && phone.length > 20) {
      return res.status(400).json({ error: 'Телефон не более 20 символов' });
    }

    const client = await updateClientProfile(req.client.id, {
      fullName: fullName?.trim(),
      phone: phone?.trim()
    });

    res.json({ success: true, client });
  } catch (error) {
    console.error('[CLIENT_CABINET] Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/client/profile/change-password
 * Change password
 */
router.post('/profile/change-password', authenticateClient, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Старый и новый пароль обязательны' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Новый пароль должен быть не менее 6 символов' });
    }

    await changeClientPassword(req.client.id, oldPassword, newPassword);

    res.json({ success: true, message: 'Пароль изменен' });
  } catch (error) {
    if (error.message === 'INVALID_PASSWORD') {
      return res.status(400).json({ error: 'Неверный текущий пароль' });
    }
    console.error('[CLIENT_CABINET] Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== CONSULTATIONS ====================

/**
 * GET /api/client/consultations
 * Get client's consultations (applications)
 */
router.get('/consultations', authenticateClient, async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      where: { clientId: req.client.id },
      include: {
        doctor: {
          select: {
            id: true,
            fullName: true,
            specialization: true
          }
        },
        photos: {
          select: {
            id: true,
            s3Key: true,
            sortOrder: true
          },
          orderBy: { sortOrder: 'asc' }
        },
        recommendation: {
          select: {
            id: true,
            text: true,
            links: true,
            createdAt: true
          }
        },
        review: {
          select: {
            id: true,
            rating: true,
            text: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ consultations: applications });
  } catch (error) {
    console.error('[CLIENT_CABINET] Consultations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/client/consultations/:id
 * Get consultation details
 */
router.get('/consultations/:id', authenticateClient, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const application = await prisma.application.findFirst({
      where: {
        id,
        clientId: req.client.id // Ensure client owns this application
      },
      include: {
        doctor: {
          select: {
            id: true,
            fullName: true,
            specialization: true,
            bio: true
          }
        },
        photos: {
          select: {
            id: true,
            fileName: true,
            s3Key: true,
            sortOrder: true,
            createdAt: true
          },
          orderBy: { sortOrder: 'asc' }
        },
        recommendation: {
          select: {
            id: true,
            text: true,
            links: true,
            createdAt: true,
            updatedAt: true
          }
        },
        review: {
          select: {
            id: true,
            rating: true,
            text: true,
            createdAt: true
          }
        },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            completedAt: true
          }
        }
      }
    });

    if (!application) {
      return res.status(404).json({ error: 'Консультация не найдена' });
    }

    res.json({ consultation: application });
  } catch (error) {
    console.error('[CLIENT_CABINET] Consultation detail error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/client/consultations/:id/photos
 * Get consultation photos
 */
router.get('/consultations/:id/photos', authenticateClient, async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);

    // Verify ownership
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        clientId: req.client.id
      }
    });

    if (!application) {
      return res.status(404).json({ error: 'Консультация не найдена' });
    }

    const photos = await prisma.photo.findMany({
      where: { applicationId },
      orderBy: { sortOrder: 'asc' }
    });

    res.json({ photos });
  } catch (error) {
    console.error('[CLIENT_CABINET] Photos error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/client/photos/timeline
 * Get photos timeline grouped by date/zone/procedure
 */
router.get('/photos/timeline', authenticateClient, async (req, res) => {
  try {
    const { zone, from, to, procedureId } = req.query;

    // Build where clause
    const where = {
      application: {
        clientId: req.client.id
      }
    };

    if (zone) {
      where.zone = zone;
    }

    if (from) {
      where.createdAt = { ...where.createdAt, gte: new Date(from) };
    }

    if (to) {
      where.createdAt = { ...where.createdAt, lte: new Date(to) };
    }

    if (procedureId) {
      where.procedureId = parseInt(procedureId);
    }

    // Fetch photos
    const photos = await prisma.photo.findMany({
      where,
      include: {
        application: {
          select: {
            id: true,
            displayNumber: true,
            createdAt: true,
            skinType: true
          }
        },
        procedure: {
          select: {
            id: true,
            name: true,
            type: true,
            scheduledAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Group by date (YYYY-MM-DD)
    const grouped = {};
    for (const photo of photos) {
      const dateKey = photo.createdAt.toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(photo);
    }

    // Get available zones for filtering
    const zones = [...new Set(photos.map(p => p.zone).filter(Boolean))];

    res.json({
      photos,
      grouped,
      zones,
      total: photos.length
    });
  } catch (error) {
    console.error('[CLIENT_CABINET] Timeline error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== DASHBOARD ====================

/**
 * GET /api/client/dashboard
 * Get dashboard statistics
 */
router.get('/dashboard', authenticateClient, async (req, res) => {
  try {
    const [totalConsultations, latestApplication, pendingCount] = await Promise.all([
      // Total consultations
      prisma.application.count({
        where: { clientId: req.client.id }
      }),
      // Latest application
      prisma.application.findFirst({
        where: { clientId: req.client.id },
        orderBy: { createdAt: 'desc' },
        include: {
          doctor: {
            select: { fullName: true }
          }
        }
      }),
      // Pending/active applications
      prisma.application.count({
        where: {
          clientId: req.client.id,
          status: {
            in: ['PENDING_PAYMENT', 'NEW', 'ASSIGNED', 'RESPONSE_GIVEN', 'APPROVED']
          }
        }
      })
    ]);

    res.json({
      totalConsultations,
      latestApplication,
      pendingCount
    });
  } catch (error) {
    console.error('[CLIENT_CABINET] Dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== PROCEDURES ====================

/**
 * GET /api/client/procedures
 * Get client's procedures
 */
router.get('/procedures', authenticateClient, async (req, res) => {
  try {
    const filters = {
      type: req.query.type,
      status: req.query.status,
      from: req.query.from,
      to: req.query.to
    };

    const procedures = await getClientProcedures(req.client.id, filters);
    res.json({ procedures });
  } catch (error) {
    console.error('[CLIENT_CABINET] Procedures error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/client/procedures/upcoming
 * Get upcoming procedures (next 7 days)
 */
router.get('/procedures/upcoming', authenticateClient, async (req, res) => {
  try {
    const procedures = await getUpcomingProcedures(req.client.id);
    res.json({ procedures });
  } catch (error) {
    console.error('[CLIENT_CABINET] Upcoming procedures error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/client/procedures/:id
 * Get procedure details
 */
router.get('/procedures/:id', authenticateClient, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const procedure = await getProcedureById(id, req.client.id);

    if (!procedure) {
      return res.status(404).json({ error: 'Процедура не найдена' });
    }

    res.json({ procedure });
  } catch (error) {
    console.error('[CLIENT_CABINET] Procedure detail error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/client/procedures
 * Create procedure
 */
router.post('/procedures', authenticateClient, async (req, res) => {
  try {
    const { type, name, description, scheduledAt, notes } = req.body;

    // Validation
    if (!type || !['HOME_CARE', 'SALON', 'MEDICAL'].includes(type)) {
      return res.status(400).json({ error: 'Неверный тип процедуры' });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Название обязательно' });
    }
    if (!scheduledAt) {
      return res.status(400).json({ error: 'Дата обязательна' });
    }

    const procedure = await createProcedure(req.client.id, {
      type,
      name: name.trim(),
      description: description?.trim(),
      scheduledAt,
      notes: notes?.trim()
    });

    res.json({ success: true, procedure });
  } catch (error) {
    console.error('[CLIENT_CABINET] Procedure create error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/client/procedures/:id
 * Update procedure
 */
router.patch('/procedures/:id', authenticateClient, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { type, name, description, scheduledAt, status, notes } = req.body;

    // Validation
    if (type && !['HOME_CARE', 'SALON', 'MEDICAL'].includes(type)) {
      return res.status(400).json({ error: 'Неверный тип процедуры' });
    }
    if (status && !['SCHEDULED', 'COMPLETED', 'SKIPPED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ error: 'Неверный статус' });
    }

    const procedure = await updateProcedure(id, req.client.id, {
      type,
      name: name?.trim(),
      description: description?.trim(),
      scheduledAt,
      status,
      notes: notes?.trim()
    });

    res.json({ success: true, procedure });
  } catch (error) {
    if (error.message === 'Procedure not found') {
      return res.status(404).json({ error: 'Процедура не найдена' });
    }
    console.error('[CLIENT_CABINET] Procedure update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/client/procedures/:id/complete
 * Mark procedure as completed
 */
router.post('/procedures/:id/complete', authenticateClient, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const procedure = await completeProcedure(id, req.client.id);

    res.json({ success: true, procedure });
  } catch (error) {
    if (error.message === 'Procedure not found') {
      return res.status(404).json({ error: 'Процедура не найдена' });
    }
    console.error('[CLIENT_CABINET] Procedure complete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/client/procedures/:id
 * Delete procedure
 */
router.delete('/procedures/:id', authenticateClient, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await deleteProcedure(id, req.client.id);

    res.json({ success: true });
  } catch (error) {
    if (error.message === 'Procedure not found') {
      return res.status(404).json({ error: 'Процедура не найдена' });
    }
    console.error('[CLIENT_CABINET] Procedure delete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== CARE SCHEME ====================

/**
 * GET /api/client/care-scheme
 * Get client's latest care scheme
 */
router.get('/care-scheme', authenticateClient, async (req, res) => {
  try {
    const scheme = await prisma.careScheme.findFirst({
      where: { clientId: req.client.id },
      orderBy: { createdAt: 'desc' }
    });

    if (!scheme) {
      return res.status(404).json({ error: 'Схема ухода не найдена' });
    }

    res.json({ scheme });
  } catch (error) {
    console.error('[CLIENT_CABINET] Care scheme fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
