import prisma from './prisma.js';

export async function getDoctorByTelegramId(telegramId) {
  return prisma.doctor.findUnique({
    where: { telegramId: BigInt(telegramId) }
  });
}

export async function createDoctor(data) {
  return prisma.doctor.create({
    data: {
      telegramId: BigInt(data.telegramId),
      telegramUsername: data.telegramUsername,
      fullName: data.fullName,
      specialization: data.specialization,
      status: 'PENDING'
    }
  });
}

export async function updateDoctor(id, data) {
  return prisma.doctor.update({
    where: { id },
    data
  });
}

export async function updateDoctorStatus(id, status) {
  return prisma.doctor.update({
    where: { id },
    data: { status }
  });
}

export async function getAllDoctors() {
  return prisma.doctor.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function getAvailableDoctors() {
  return prisma.doctor.findMany({
    where: {
      status: 'ACTIVE',
      isAvailable: true
    },
    orderBy: { fullName: 'asc' }
  });
}

export async function setDoctorAvailability(id, isAvailable) {
  return prisma.doctor.update({
    where: { id },
    data: { isAvailable }
  });
}

// Find doctor by telegram username
export async function getDoctorByUsername(username) {
  const cleanUsername = username.replace(/^@/, '');
  return prisma.doctor.findFirst({
    where: {
      telegramUsername: {
        equals: cleanUsername,
        mode: 'insensitive'
      }
    }
  });
}

// Create pre-registered doctor (invited, no telegram ID yet)
export async function createInvitedDoctor(data) {
  return prisma.doctor.create({
    data: {
      telegramId: BigInt(0), // Placeholder, will be updated on registration
      telegramUsername: data.telegramUsername.replace(/^@/, ''),
      fullName: data.fullName,
      specialization: data.specialization || null,
      status: 'PENDING' // Will be activated after they register
    }
  });
}

// Link telegram ID to pre-registered doctor
export async function linkDoctorTelegramId(doctorId, telegramId) {
  return prisma.doctor.update({
    where: { id: doctorId },
    data: {
      telegramId: BigInt(telegramId),
      status: 'ACTIVE' // Auto-activate pre-registered doctors
    }
  });
}
