import jwt from 'jsonwebtoken';
import config from '../../config/environment.js';
import prisma from '../../db/prisma.js';

export function generateDoctorToken(doctor) {
  return jwt.sign(
    {
      id: doctor.id,
      role: 'doctor',
      email: doctor.email || null,
      telegramId: doctor.telegramId ? doctor.telegramId.toString() : null
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

export async function authenticateDoctor(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]
    || req.query.token;

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);

    if (decoded.role !== 'doctor') {
      return res.status(403).json({ error: 'Doctor access required' });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: decoded.id }
    });

    if (!doctor) {
      return res.status(401).json({ error: 'Account no longer exists' });
    }

    if (doctor.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'Account is not active' });
    }

    req.doctor = {
      id: doctor.id,
      email: doctor.email,
      fullName: doctor.fullName,
      telegramId: doctor.telegramId ? doctor.telegramId.toString() : null,
      specialization: doctor.specialization,
      bio: doctor.bio
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
}
