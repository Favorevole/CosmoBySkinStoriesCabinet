import prisma from './prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

/**
 * Register new client with email/password
 */
export async function registerClient({ email, password, fullName }) {
  // Check if email already exists
  const existing = await prisma.client.findUnique({
    where: { email }
  });

  if (existing) {
    throw new Error('EMAIL_EXISTS');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create client
  const client = await prisma.client.create({
    data: {
      email,
      passwordHash,
      fullName,
      emailVerified: false // Will need email verification
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      emailVerified: true,
      createdAt: true
    }
  });

  return client;
}

/**
 * Login client with email/password
 */
export async function loginClient({ email, password }) {
  // Find client
  const client = await prisma.client.findUnique({
    where: { email }
  });

  if (!client || !client.passwordHash) {
    throw new Error('INVALID_CREDENTIALS');
  }

  // Verify password
  const isValid = await bcrypt.compare(password, client.passwordHash);
  if (!isValid) {
    throw new Error('INVALID_CREDENTIALS');
  }

  // Generate JWT token
  const token = jwt.sign(
    {
      clientId: client.id,
      email: client.email,
      type: 'client'
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    token,
    client: {
      id: client.id,
      email: client.email,
      fullName: client.fullName,
      emailVerified: client.emailVerified,
      createdAt: client.createdAt
    }
  };
}

/**
 * Get client by ID
 */
export async function getClientById(clientId) {
  return prisma.client.findUnique({
    where: { id: clientId },
    select: {
      id: true,
      email: true,
      fullName: true,
      emailVerified: true,
      telegramId: true,
      telegramUsername: true,
      phone: true,
      createdAt: true,
      updatedAt: true
    }
  });
}

/**
 * Update client profile
 */
export async function updateClientProfile(clientId, data) {
  const updates = {};
  if (data.fullName !== undefined) updates.fullName = data.fullName;
  if (data.phone !== undefined) updates.phone = data.phone;

  return prisma.client.update({
    where: { id: clientId },
    data: updates,
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      emailVerified: true
    }
  });
}

/**
 * Change client password
 */
export async function changeClientPassword(clientId, oldPassword, newPassword) {
  const client = await prisma.client.findUnique({
    where: { id: clientId }
  });

  if (!client || !client.passwordHash) {
    throw new Error('CLIENT_NOT_FOUND');
  }

  // Verify old password
  const isValid = await bcrypt.compare(oldPassword, client.passwordHash);
  if (!isValid) {
    throw new Error('INVALID_PASSWORD');
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, 10);

  // Update password
  await prisma.client.update({
    where: { id: clientId },
    data: { passwordHash }
  });

  return true;
}
