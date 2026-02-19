import prisma from './prisma.js';

export async function createTemplate(doctorId, data) {
  return prisma.careTemplate.create({
    data: {
      doctorId,
      title: data.title,
      text: data.text,
      category: data.category || null
    }
  });
}

export async function getTemplates(doctorId) {
  return prisma.careTemplate.findMany({
    where: { doctorId },
    orderBy: { updatedAt: 'desc' }
  });
}

export async function updateTemplate(id, doctorId, data) {
  return prisma.careTemplate.update({
    where: { id, doctorId },
    data: {
      title: data.title,
      text: data.text,
      category: data.category
    }
  });
}

export async function deleteTemplate(id, doctorId) {
  return prisma.careTemplate.delete({
    where: { id, doctorId }
  });
}
