import prisma from './prisma.js';

export async function createReview({ applicationId, clientId, rating, text, clientName }) {
  return prisma.review.create({
    data: {
      applicationId,
      clientId,
      rating,
      text: text || null,
      clientName: clientName || null
    }
  });
}

export async function getReviewByApplicationId(applicationId) {
  return prisma.review.findUnique({
    where: { applicationId }
  });
}

export async function getApprovedReviews(limit = 10) {
  const reviews = await prisma.$queryRaw`
    SELECT id, rating, text, created_at as "createdAt"
    FROM reviews
    WHERE is_approved = true AND text IS NOT NULL
    ORDER BY RANDOM()
    LIMIT ${limit}
  `;
  return reviews;
}

export async function getAllReviews() {
  return prisma.review.findMany({
    include: {
      application: { select: { id: true, displayNumber: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function approveReview(id) {
  return prisma.review.update({
    where: { id },
    data: { isApproved: true }
  });
}

export async function rejectReview(id) {
  return prisma.review.update({
    where: { id },
    data: { isApproved: false }
  });
}

export async function deleteReview(id) {
  return prisma.review.delete({ where: { id } });
}
