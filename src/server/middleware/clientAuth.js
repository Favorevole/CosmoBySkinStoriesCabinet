import jwt from 'jsonwebtoken';
import prisma from '../../db/prisma.js';

if (!process.env.JWT_SECRET) {
  throw new Error('CRITICAL SECURITY ERROR: JWT_SECRET environment variable is required but not set');
}
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware to authenticate client requests
 * Expects: Authorization: Bearer <token>
 * Attaches req.client = { id, email, fullName, ... }
 */
export async function authenticateClient(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);

    // decoded should have: { clientId, email, type: 'client' }
    if (decoded.type !== 'client') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    // Fetch client from DB
    const client = await prisma.client.findUnique({
      where: { id: decoded.clientId },
      select: {
        id: true,
        email: true,
        fullName: true,
        emailVerified: true,
        telegramId: true,
        telegramUsername: true,
        createdAt: true
      }
    });

    if (!client) {
      return res.status(401).json({ error: 'Client not found' });
    }

    // Attach client to request
    req.client = client;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('[CLIENT_AUTH] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
