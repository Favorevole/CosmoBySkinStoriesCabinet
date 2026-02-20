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
  const existing = await prisma.careTemplate.findFirst({
    where: { id, doctorId }
  });
  if (!existing) {
    throw new Error('Template not found');
  }
  return prisma.careTemplate.update({
    where: { id },
    data: {
      title: data.title,
      text: data.text,
      category: data.category
    }
  });
}

export async function deleteTemplate(id, doctorId) {
  const existing = await prisma.careTemplate.findFirst({
    where: { id, doctorId }
  });
  if (!existing) {
    throw new Error('Template not found');
  }
  return prisma.careTemplate.delete({
    where: { id }
  });
}
