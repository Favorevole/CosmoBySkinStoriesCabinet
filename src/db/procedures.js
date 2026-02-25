import prisma from './prisma.js';

/**
 * Get client procedures
 */
export async function getClientProcedures(clientId, filters = {}) {
  const where = { clientId };

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.from) {
    where.scheduledAt = { ...where.scheduledAt, gte: new Date(filters.from) };
  }

  if (filters.to) {
    where.scheduledAt = { ...where.scheduledAt, lte: new Date(filters.to) };
  }

  return prisma.procedure.findMany({
    where,
    include: {
      photos: {
        select: {
          id: true,
          s3Key: true,
          fileName: true,
          zone: true,
          tags: true
        }
      }
    },
    orderBy: { scheduledAt: 'desc' }
  });
}

/**
 * Get procedure by ID
 */
export async function getProcedureById(id, clientId) {
  return prisma.procedure.findFirst({
    where: { id, clientId },
    include: {
      photos: {
        select: {
          id: true,
          s3Key: true,
          fileName: true,
          zone: true,
          tags: true,
          description: true,
          createdAt: true
        },
        orderBy: { createdAt: 'asc' }
      }
    }
  });
}

/**
 * Create procedure
 */
export async function createProcedure(clientId, data) {
  return prisma.procedure.create({
    data: {
      clientId,
      type: data.type,
      name: data.name,
      description: data.description || null,
      scheduledAt: new Date(data.scheduledAt),
      status: data.status || 'SCHEDULED',
      notes: data.notes || null,
      photoIds: data.photoIds || []
    }
  });
}

/**
 * Update procedure
 */
export async function updateProcedure(id, clientId, data) {
  const existing = await prisma.procedure.findFirst({
    where: { id, clientId }
  });

  if (!existing) {
    throw new Error('Procedure not found');
  }

  const updates = {};
  if (data.type !== undefined) updates.type = data.type;
  if (data.name !== undefined) updates.name = data.name;
  if (data.description !== undefined) updates.description = data.description;
  if (data.scheduledAt !== undefined) updates.scheduledAt = new Date(data.scheduledAt);
  if (data.status !== undefined) updates.status = data.status;
  if (data.notes !== undefined) updates.notes = data.notes;
  if (data.photoIds !== undefined) updates.photoIds = data.photoIds;
  if (data.completedAt !== undefined) updates.completedAt = data.completedAt ? new Date(data.completedAt) : null;

  return prisma.procedure.update({
    where: { id },
    data: updates
  });
}

/**
 * Complete procedure
 */
export async function completeProcedure(id, clientId) {
  const existing = await prisma.procedure.findFirst({
    where: { id, clientId }
  });

  if (!existing) {
    throw new Error('Procedure not found');
  }

  return prisma.procedure.update({
    where: { id },
    data: {
      status: 'COMPLETED',
      completedAt: new Date()
    }
  });
}

/**
 * Delete procedure
 */
export async function deleteProcedure(id, clientId) {
  const existing = await prisma.procedure.findFirst({
    where: { id, clientId }
  });

  if (!existing) {
    throw new Error('Procedure not found');
  }

  return prisma.procedure.delete({
    where: { id }
  });
}

/**
 * Get upcoming procedures (next 7 days)
 */
export async function getUpcomingProcedures(clientId) {
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return prisma.procedure.findMany({
    where: {
      clientId,
      status: 'SCHEDULED',
      scheduledAt: {
        gte: now,
        lte: weekFromNow
      }
    },
    orderBy: { scheduledAt: 'asc' },
    take: 10
  });
}
