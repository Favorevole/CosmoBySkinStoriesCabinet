import jwt from 'jsonwebtoken';
import config from '../../config/environment.js';
import { getAdminByTelegramId, isAdmin } from '../../db/admins.js';

export function generateToken(admin) {
  return jwt.sign(
    {
      id: admin.id,
      telegramId: admin.telegramId.toString(),
      username: admin.telegramUsername,
      fullName: admin.fullName
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN
    || req.query.token; // Support token in query param for img tags

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
}

export async function requireAdmin(req, res, next) {
  if (!req.user || !req.user.telegramId) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const adminStatus = await isAdmin(req.user.telegramId);

    // Also check config-defined admins
    const isConfigAdmin = config.adminTelegramIds.some(
      id => id.toString() === req.user.telegramId.toString()
    );

    if (!adminStatus && !isConfigAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('[AUTH] Error checking admin status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
