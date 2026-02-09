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
  // Get random approved reviews using raw SQL for true randomness
  const reviews = await prisma.$queryRaw`
    SELECT id, rating, text, client_name as "clientName", created_at as "createdAt"
    FROM reviews
    WHERE is_approved = true AND text IS NOT NULL
    ORDER BY RANDOM()
    LIMIT ${limit}
  `;
  return reviews;
}
