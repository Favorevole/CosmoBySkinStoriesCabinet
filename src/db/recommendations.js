import prisma from './prisma.js';

export async function createRecommendation(applicationId, doctorId, text, links = null) {
  const recommendation = await prisma.recommendation.create({
    data: {
      applicationId,
      doctorId,
      text,
      links
    }
  });

  // Update application status
  await prisma.application.update({
    where: { id: applicationId },
    data: {
      status: 'RESPONSE_GIVEN',
      completedAt: new Date()
    }
  });

  // Add to status history
  await prisma.statusHistory.create({
    data: {
      applicationId,
      fromStatus: 'ASSIGNED',
      toStatus: 'RESPONSE_GIVEN',
      changedById: doctorId,
      changedByRole: 'DOCTOR',
      comment: 'Врач дал рекомендации'
    }
  });

  return recommendation;
}

export async function getRecommendationByApplicationId(applicationId) {
  return prisma.recommendation.findUnique({
    where: { applicationId },
    include: {
      doctor: true
    }
  });
}

export async function updateRecommendation(applicationId, data, adminId) {
  const current = await prisma.recommendation.findUnique({
    where: { applicationId }
  });

  // Save original text if first edit
  const updateData = {
    text: data.text,
    links: data.links,
    editedByAdminId: adminId,
    editedByAdminAt: new Date()
  };

  if (!current.originalText) {
    updateData.originalText = current.text;
  }

  return prisma.recommendation.update({
    where: { applicationId },
    data: updateData
  });
}

export async function approveRecommendation(applicationId, adminId) {
  await prisma.application.update({
    where: { id: applicationId },
    data: { status: 'APPROVED' }
  });

  await prisma.statusHistory.create({
    data: {
      applicationId,
      fromStatus: 'RESPONSE_GIVEN',
      toStatus: 'APPROVED',
      changedById: adminId,
      changedByRole: 'ADMIN',
      comment: 'Рекомендации одобрены администратором'
    }
  });

  return prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      client: true,
      recommendation: true
    }
  });
}
