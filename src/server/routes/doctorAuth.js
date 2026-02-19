import express from 'express';
import { generateDoctorToken, authenticateDoctor } from '../middleware/doctorAuth.js';
import {
  getDoctorByEmail,
  getDoctorById,
  registerDoctorWithEmail,
  verifyDoctorPassword,
  setDoctorPassword,
  linkTelegramToDoctor,
  linkEmailToDoctor
} from '../../db/doctorAuth.js';
import { getDoctorByTelegramId } from '../../db/doctors.js';
import { createAuthCode, verifyAuthCode } from '../../db/auth.js';
import prisma from '../../db/prisma.js';

const router = express.Router();

/**
 * POST /api/doctor-auth/register
 * Register new doctor with email+password
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, specialization } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'email, password и fullName обязательны' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Пароль должен быть не менее 6 символов' });
    }

    const existing = await getDoctorByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Врач с таким email уже зарегистрирован' });
    }

    const doctor = await registerDoctorWithEmail({ email, password, fullName, specialization });

    // Notify admins about new doctor registration
    try {
      const { notifyAdminsNewDoctor } = await import('../../services/notifications.js');
      if (notifyAdminsNewDoctor) {
        await notifyAdminsNewDoctor(doctor);
      }
    } catch (e) {
      // Notification is best-effort
      console.error('[DOCTOR_AUTH] Failed to notify admins:', e.message);
    }

    res.json({
      success: true,
      message: 'Регистрация успешна. Ожидайте одобрения администратором.',
      doctor: {
        id: doctor.id,
        fullName: doctor.fullName,
        email: doctor.email,
        status: doctor.status
      }
    });
  } catch (error) {
    console.error('[DOCTOR_AUTH] Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/doctor-auth/login
 * Login with email+password
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email и password обязательны' });
    }

    const doctor = await getDoctorByEmail(email);
    if (!doctor) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const valid = await verifyDoctorPassword(doctor, password);
    if (!valid) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    if (doctor.status !== 'ACTIVE') {
      if (doctor.status === 'PENDING') {
        return res.status(403).json({ error: 'Ваш аккаунт ожидает одобрения администратором' });
      }
      return res.status(403).json({ error: 'Ваш аккаунт заблокирован' });
    }

    const token = generateDoctorToken(doctor);

    res.json({
      success: true,
      token,
      expiresIn: 7 * 24 * 60 * 60,
      doctor: {
        id: doctor.id,
        fullName: doctor.fullName,
        email: doctor.email,
        specialization: doctor.specialization,
        telegramId: doctor.telegramId?.toString() || null
      }
    });
  } catch (error) {
    console.error('[DOCTOR_AUTH] Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/doctor-auth/telegram-request-code
 * Request OTP code sent to Telegram
 */
router.post('/telegram-request-code', async (req, res) => {
  try {
    const { telegramId } = req.body;

    if (!telegramId) {
      return res.status(400).json({ error: 'telegramId обязателен' });
    }

    const doctor = await getDoctorByTelegramId(telegramId);
    if (!doctor) {
      return res.status(404).json({ error: 'Врач с таким Telegram ID не найден' });
    }

    if (doctor.status !== 'ACTIVE') {
      if (doctor.status === 'PENDING') {
        return res.status(403).json({ error: 'Ваш аккаунт ожидает одобрения' });
      }
      return res.status(403).json({ error: 'Ваш аккаунт заблокирован' });
    }

    const code = await createAuthCode(telegramId);

    // Send code via doctor bot
    let codeSent = false;
    try {
      const { getDoctorBot } = await import('../../doctorBot/index.js');
      const bot = getDoctorBot();
      if (bot) {
        await bot.telegram.sendMessage(
          Number(telegramId),
          `Ваш код для входа в кабинет врача: *${code}*\n\nКод действителен 5 минут.`,
          { parse_mode: 'Markdown' }
        );
        codeSent = true;
      }
    } catch (e) {
      console.error('[DOCTOR_AUTH] Failed to send code via doctor bot:', e.message);
    }

    if (!codeSent) {
      try {
        const { getClientBot } = await import('../../clientBot/index.js');
        const bot = getClientBot();
        if (bot) {
          await bot.telegram.sendMessage(
            Number(telegramId),
            `Ваш код для входа в кабинет врача: *${code}*\n\nКод действителен 5 минут.`,
            { parse_mode: 'Markdown' }
          );
          codeSent = true;
        }
      } catch (e) {
        console.error('[DOCTOR_AUTH] Failed to send code via client bot:', e.message);
      }
    }

    res.json({
      success: true,
      message: 'Код отправлен в Telegram',
      telegramId: telegramId.toString()
    });
  } catch (error) {
    console.error('[DOCTOR_AUTH] Telegram request code error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/doctor-auth/telegram-login
 * Login via Telegram OTP
 */
router.post('/telegram-login', async (req, res) => {
  try {
    const { telegramId, code } = req.body;

    if (!telegramId || !code) {
      return res.status(400).json({ error: 'telegramId и code обязательны' });
    }

    const isValid = await verifyAuthCode(telegramId, code);
    if (!isValid) {
      return res.status(401).json({ error: 'Неверный или истёкший код' });
    }

    const doctor = await getDoctorByTelegramId(telegramId);
    if (!doctor) {
      return res.status(404).json({ error: 'Врач не найден' });
    }

    if (doctor.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Аккаунт не активен' });
    }

    const token = generateDoctorToken(doctor);

    res.json({
      success: true,
      token,
      expiresIn: 7 * 24 * 60 * 60,
      doctor: {
        id: doctor.id,
        fullName: doctor.fullName,
        email: doctor.email || null,
        specialization: doctor.specialization,
        telegramId: doctor.telegramId?.toString() || null
      }
    });
  } catch (error) {
    console.error('[DOCTOR_AUTH] Telegram login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/doctor-auth/me
 * Get current doctor profile
 */
router.get('/me', authenticateDoctor, async (req, res) => {
  try {
    const doctor = await getDoctorById(req.doctor.id);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json({
      id: doctor.id,
      fullName: doctor.fullName,
      email: doctor.email || null,
      specialization: doctor.specialization || null,
      bio: doctor.bio || null,
      telegramId: doctor.telegramId?.toString() || null,
      telegramUsername: doctor.telegramUsername || null,
      status: doctor.status,
      isAvailable: doctor.isAvailable,
      createdAt: doctor.createdAt
    });
  } catch (error) {
    console.error('[DOCTOR_AUTH] Get me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/doctor-auth/link-telegram
 * Link Telegram account to doctor
 */
router.post('/link-telegram', authenticateDoctor, async (req, res) => {
  try {
    const { telegramId, code } = req.body;

    if (!telegramId || !code) {
      return res.status(400).json({ error: 'telegramId и code обязательны' });
    }

    const isValid = await verifyAuthCode(telegramId, code);
    if (!isValid) {
      return res.status(401).json({ error: 'Неверный или истёкший код' });
    }

    await linkTelegramToDoctor(req.doctor.id, telegramId);

    res.json({ success: true, message: 'Telegram привязан' });
  } catch (error) {
    if (error.message.includes('already linked')) {
      return res.status(409).json({ error: error.message });
    }
    console.error('[DOCTOR_AUTH] Link telegram error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/doctor-auth/link-email
 * Link email to doctor (for Telegram-only accounts)
 */
router.post('/link-email', authenticateDoctor, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email и password обязательны' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Пароль должен быть не менее 6 символов' });
    }

    await linkEmailToDoctor(req.doctor.id, email, password);

    res.json({ success: true, message: 'Email привязан' });
  } catch (error) {
    if (error.message.includes('already linked')) {
      return res.status(409).json({ error: error.message });
    }
    console.error('[DOCTOR_AUTH] Link email error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/doctor-auth/profile
 * Update doctor profile
 */
router.patch('/profile', authenticateDoctor, async (req, res) => {
  try {
    const { fullName, specialization, bio } = req.body;
    const updateData = {};

    if (fullName !== undefined) updateData.fullName = fullName;
    if (specialization !== undefined) updateData.specialization = specialization;
    if (bio !== undefined) updateData.bio = bio;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'Нет данных для обновления' });
    }

    const doctor = await prisma.doctor.update({
      where: { id: req.doctor.id },
      data: updateData
    });

    res.json({
      success: true,
      doctor: {
        id: doctor.id,
        fullName: doctor.fullName,
        specialization: doctor.specialization,
        bio: doctor.bio
      }
    });
  } catch (error) {
    console.error('[DOCTOR_AUTH] Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/doctor-auth/change-password
 * Change password
 */
router.post('/change-password', authenticateDoctor, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Новый пароль должен быть не менее 6 символов' });
    }

    const doctor = await getDoctorById(req.doctor.id);

    // If doctor has a password, verify the current one
    if (doctor.passwordHash) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Текущий пароль обязателен' });
      }
      const valid = await verifyDoctorPassword(doctor, currentPassword);
      if (!valid) {
        return res.status(401).json({ error: 'Неверный текущий пароль' });
      }
    }

    await setDoctorPassword(req.doctor.id, newPassword);

    res.json({ success: true, message: 'Пароль изменён' });
  } catch (error) {
    console.error('[DOCTOR_AUTH] Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
