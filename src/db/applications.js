import prisma from './prisma.js';

export async function createApplication(data) {
  const status = data.status || 'NEW';

  const application = await prisma.application.create({
    data: {
      clientId: data.clientId,
      age: data.age,
      skinType: data.skinType,
      priceRange: data.priceRange,
      mainProblems: data.mainProblems,
      additionalComment: data.additionalComment,
      consentToDataProcessing: data.consentToDataProcessing || false,
      source: data.source || 'TELEGRAM',
      status
    },
    include: {
      client: true
    }
  });

  // Create initial status history
  await prisma.statusHistory.create({
    data: {
      applicationId: application.id,
      fromStatus: null,
      toStatus: status,
      changedByRole: 'CLIENT'
    }
  });

  return application;
}

export async function getApplicationById(id) {
  return prisma.application.findUnique({
    where: { id },
    include: {
      client: true,
      doctor: true,
      photos: {
        select: {
          id: true,
          applicationId: true,
          fileName: true,
          mimeType: true,
          fileSize: true,
          s3Key: true,
          sortOrder: true,
          telegramFileId: true,
          createdAt: true
        },
        orderBy: { sortOrder: 'asc' }
      },
      recommendation: {
        include: { doctor: true }
      },
      statusHistory: {
        orderBy: { createdAt: 'asc' }
      }
    }
  });
}

export async function getApplications(filters = {}, pagination = {}) {
  const { status, doctorId, dateFrom, dateTo, clientId } = filters;
  const { page = 1, limit = 20 } = pagination;

  const where = {};

  if (status) where.status = status;
  if (doctorId) where.doctorId = doctorId;
  if (clientId) where.clientId = clientId;
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  const [total, applications] = await Promise.all([
    prisma.application.count({ where }),
    prisma.application.findMany({
      where,
      select: {
        id: true,
        status: true,
        age: true,
        skinType: true,
        createdAt: true,
        updatedAt: true,
        assignedAt: true,
        client: {
          select: {
            id: true,
            fullName: true,
            telegramUsername: true,
            telegramId: true
          }
        },
        doctor: {
          select: {
            id: true,
            fullName: true,
            telegramId: true
          }
        },
        photos: {
          select: { id: true },
          take: 1 // Only need count, so just get first
        },
        recommendation: {
          select: { id: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    })
  ]);

  return {
    applications,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function getClientApplications(clientId) {
  return prisma.application.findMany({
    where: { clientId },
    include: {
      doctor: {
        select: { fullName: true }
      },
      recommendation: {
        select: { id: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function assignDoctor(applicationId, doctorId, adminId) {
  const application = await prisma.application.update({
    where: { id: applicationId },
    data: {
      doctorId,
      status: 'ASSIGNED',
      assignedAt: new Date()
    },
    include: {
      client: true,
      doctor: true,
      photos: {
        select: {
          id: true,
          applicationId: true,
          fileName: true,
          mimeType: true,
          fileSize: true,
          s3Key: true,
          sortOrder: true,
          telegramFileId: true,
          createdAt: true
        }
      }
    }
  });

  await prisma.statusHistory.create({
    data: {
      applicationId,
      fromStatus: 'NEW',
      toStatus: 'ASSIGNED',
      changedById: adminId,
      changedByRole: 'ADMIN',
      comment: `Назначен врач: ${application.doctor.fullName}`
    }
  });

  return application;
}

export async function updateApplicationStatus(applicationId, status, changedById, changedByRole, comment) {
  const currentApp = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { status: true }
  });

  const application = await prisma.application.update({
    where: { id: applicationId },
    data: {
      status,
      ...(status === 'SENT_TO_CLIENT' ? { sentToClientAt: new Date() } : {}),
      ...(status === 'RESPONSE_GIVEN' || status === 'APPROVED' ? { completedAt: new Date() } : {})
    },
    include: {
      client: true,
      doctor: true,
      recommendation: true
    }
  });

  await prisma.statusHistory.create({
    data: {
      applicationId,
      fromStatus: currentApp.status,
      toStatus: status,
      changedById,
      changedByRole,
      comment
    }
  });

  return application;
}

export async function declineApplication(applicationId, doctorId, reason) {
  return updateApplicationStatus(
    applicationId,
    'DECLINED',
    doctorId,
    'DOCTOR',
    reason
  );
}

export async function getDoctorAssignedApplications(doctorId) {
  return prisma.application.findMany({
    where: {
      doctorId,
      status: { in: ['ASSIGNED', 'RESPONSE_GIVEN'] }
    },
    include: {
      client: true,
      photos: {
        select: { id: true }
      }
    },
    orderBy: { assignedAt: 'desc' }
  });
}

export async function getNewApplicationsCount() {
  return prisma.application.count({
    where: { status: 'NEW' }
  });
}

export async function getApplicationStats() {
  const [total, byStatus] = await Promise.all([
    prisma.application.count(),
    prisma.application.groupBy({
      by: ['status'],
      _count: { id: true }
    })
  ]);

  const statusCounts = {};
  byStatus.forEach(s => {
    statusCounts[s.status] = s._count.id;
  });

  return { total, byStatus: statusCounts };
}
