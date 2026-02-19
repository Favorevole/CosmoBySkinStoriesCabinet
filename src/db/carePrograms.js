import prisma from './prisma.js';

export async function createProgram(doctorId, data) {
  return prisma.careProgram.create({
    data: {
      doctorId,
      title: data.title,
      description: data.description || null,
      steps: data.steps || []
    }
  });
}

export async function getPrograms(doctorId) {
  return prisma.careProgram.findMany({
    where: { doctorId },
    orderBy: { updatedAt: 'desc' }
  });
}

export async function updateProgram(id, doctorId, data) {
  return prisma.careProgram.update({
    where: { id, doctorId },
    data: {
      title: data.title,
      description: data.description,
      steps: data.steps
    }
  });
}

export async function deleteProgram(id, doctorId) {
  return prisma.careProgram.delete({
    where: { id, doctorId }
  });
}
