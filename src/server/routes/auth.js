import express from 'express';
import { createAuthCode, verifyAuthCode, cleanupExpiredCodes } from '../../db/auth.js';
import { getAdminByTelegramId, getAdminByUsername, createAdmin, isAdmin } from '../../db/admins.js';
import { generateToken } from '../middleware/auth.js';
import config from '../../config/environment.js';

const router = express.Router();

/**
 * POST /api/auth/request-code
 * Request an authentication code sent to Telegram
 * Body: { telegramUsername: string } or { telegramId: string }
 */
router.post('/request-code', async (req, res) => {
  try {
    const { telegramUsername, telegramId } = req.body;

    if (!telegramUsername && !telegramId) {
      return res.status(400).json({ error: 'telegramUsername or telegramId required' });
    }

    let admin = null;
    let targetTelegramId = telegramId;

    if (telegramId) {
      // Direct telegramId provided
      admin = await getAdminByTelegramId(telegramId);
      targetTelegramId = telegramId;
    } else if (telegramUsername) {
      // Find admin by username
      admin = await getAdminByUsername(telegramUsername);
      if (!admin) {
        return res.status(403).json({
          error: 'Администратор с таким username не найден'
        });
      }
      targetTelegramId = admin.telegramId.toString();
    }

    // Check if this telegramId is an admin
    const isConfigAdmin = config.adminTelegramIds.some(
      id => id.toString() === targetTelegramId.toString()
    );

    if (!admin && !isConfigAdmin) {
      return res.status(403).json({ error: 'Access denied. Not an admin.' });
    }

    // Generate and save code
    const code = await createAuthCode(targetTelegramId);

    // Send code via bot
    try {
      const { getClientBot } = await import('../../clientBot/index.js');
      const clientBot = getClientBot();

      if (clientBot) {
        await clientBot.telegram.sendMessage(
          Number(targetTelegramId),
          `Ваш код для входа в админ-панель: *${code}*\n\nКод действителен 5 минут.`,
          { parse_mode: 'Markdown' }
        );
      }
    } catch (botError) {
      console.error('[AUTH] Failed to send code via bot:', botError);
      // Continue anyway - admin can see code in logs for dev
    }

    res.json({
      success: true,
      message: 'Код отправлен в Telegram',
      telegramId: targetTelegramId.toString()
    });

  } catch (error) {
    console.error('[AUTH] Error requesting code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/verify
 * Verify the authentication code and get JWT
 * Body: { telegramId: string, code: string }
 */
router.post('/verify', async (req, res) => {
  try {
    const { telegramId, code } = req.body;

    if (!telegramId || !code) {
      return res.status(400).json({ error: 'telegramId and code required' });
    }

    const isValid = await verifyAuthCode(telegramId, code);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid or expired code' });
    }

    // Get or create admin record
    let admin = await getAdminByTelegramId(telegramId);

    if (!admin) {
      // Check if config admin
      const isConfigAdmin = config.adminTelegramIds.some(
        id => id.toString() === telegramId.toString()
      );

      if (!isConfigAdmin) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Create admin from config
      admin = await createAdmin({
        telegramId,
        telegramUsername: null,
        fullName: 'Admin'
      });
    }

    // Generate JWT
    const token = generateToken(admin);

    res.json({
      success: true,
      token,
      expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
      admin: {
        id: admin.id,
        fullName: admin.fullName,
        telegramUsername: admin.telegramUsername
      }
    });

  } catch (error) {
    console.error('[AUTH] Error verifying code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/auth/me
 * Get current user info (requires auth)
 */
router.get('/me', async (req, res) => {
  const { authenticateToken } = await import('../middleware/auth.js');

  authenticateToken(req, res, async () => {
    try {
      const admin = await getAdminByTelegramId(req.user.telegramId);

      if (!admin) {
        return res.status(404).json({ error: 'Admin not found' });
      }

      res.json({
        id: admin.id,
        fullName: admin.fullName,
        telegramUsername: admin.telegramUsername,
        status: admin.status
      });

    } catch (error) {
      console.error('[AUTH] Error getting user info:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

export default router;
