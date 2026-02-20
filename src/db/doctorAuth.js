import prisma from './prisma.js';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function getDoctorByEmail(email) {
  return prisma.doctor.findUnique({
    where: { email: email.toLowerCase() }
  });
}

export async function getDoctorById(id) {
  return prisma.doctor.findUnique({
    where: { id }
  });
}

export async function registerDoctorWithEmail({ email, password, fullName, specialization }) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  return prisma.doctor.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      fullName,
      specialization: specialization || null,
      status: 'PENDING'
    }
  });
}

export async function verifyDoctorPassword(doctor, password) {
  if (!doctor.passwordHash) return false;
  return bcrypt.compare(password, doctor.passwordHash);
}

export async function setDoctorPassword(doctorId, password) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  return prisma.doctor.update({
    where: { id: doctorId },
    data: { passwordHash }
  });
}

export async function linkTelegramToDoctor(doctorId, telegramId, username) {
  // Check if another doctor already has this telegramId
  const existing = await prisma.doctor.findUnique({
    where: { telegramId: BigInt(telegramId) }
  });

  if (existing && existing.id !== doctorId) {
    throw new Error('This Telegram account is already linked to another doctor');
  }

  return prisma.doctor.update({
    where: { id: doctorId },
    data: {
      telegramId: BigInt(telegramId),
      telegramUsername: username ? username.replace(/^@/, '') : undefined
    }
  });
}

export async function linkEmailToDoctor(doctorId, email, password) {
  const existingWithEmail = await getDoctorByEmail(email);
  if (existingWithEmail && existingWithEmail.id !== doctorId) {
    throw new Error('This email is already linked to another doctor');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  return prisma.doctor.update({
    where: { id: doctorId },
    data: {
      email: email.toLowerCase(),
      passwordHash
    }
  });
}
