import prisma from './prisma.js';
import { deletePhotoFromS3 } from '../services/s3.js';

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

export async function createAdminReview({ rating, text, clientName, imageS3Key }) {
  return prisma.review.create({
    data: {
      rating,
      text: text || null,
      clientName: clientName || null,
      imageS3Key: imageS3Key || null,
      isApproved: true
    }
  });
}

export async function getReviewById(id) {
  return prisma.review.findUnique({ where: { id } });
}

export async function getReviewByApplicationId(applicationId) {
  return prisma.review.findUnique({
    where: { applicationId }
  });
}

export async function updateReviewImageKey(id, imageS3Key) {
  return prisma.review.update({
    where: { id },
    data: { imageS3Key }
  });
}

export async function getApprovedReviews(limit = 10) {
  const reviews = await prisma.$queryRaw`
    SELECT id, rating, text, image_s3_key as "imageS3Key", created_at as "createdAt"
    FROM reviews
    WHERE is_approved = true AND (text IS NOT NULL OR image_s3_key IS NOT NULL)
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
  const review = await prisma.review.findUnique({ where: { id } });
  if (review?.imageS3Key) {
    try {
      await deletePhotoFromS3(review.imageS3Key);
    } catch (err) {
      console.error('[REVIEWS] Failed to delete S3 image:', err);
    }
  }
  return prisma.review.delete({ where: { id } });
}
