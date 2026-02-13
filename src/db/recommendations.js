import prisma from './prisma.js';

export async function createRecommendation(applicationId, doctorId, text, links = null) {
  return prisma.$transaction(async (tx) => {
    const application = await tx.application.findUnique({
      where: { id: applicationId }
    });

    if (!application) {
      throw new Error(`Application ${applicationId} not found`);
    }

    const recommendation = await tx.recommendation.create({
      data: {
        applicationId,
        doctorId,
        text,
        links
      }
    });

    await tx.application.update({
      where: { id: applicationId },
      data: {
        status: 'RESPONSE_GIVEN',
        completedAt: new Date()
      }
    });

    await tx.statusHistory.create({
      data: {
        applicationId,
        fromStatus: application.status,
        toStatus: 'RESPONSE_GIVEN',
        changedById: doctorId,
        changedByRole: 'DOCTOR',
        comment: 'Врач дал рекомендации'
      }
    });

    return recommendation;
  });
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

  if (!current) {
    throw new Error(`Recommendation for application ${applicationId} not found`);
  }

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
      doctor: true,
      recommendation: true
    }
  });
}
