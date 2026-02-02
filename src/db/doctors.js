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
