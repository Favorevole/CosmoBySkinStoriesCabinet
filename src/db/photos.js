import prisma from './prisma.js';
import { isS3Configured, buildPhotoKey, uploadPhoto, downloadPhoto, deletePhotoFromS3 } from '../services/s3.js';

export async function addPhotoToApplication(applicationId, photoData) {
  const photoCount = await prisma.photo.count({
    where: { applicationId }
  });

  // Create DB record first (with data as fallback if S3 is not configured)
  const photo = await prisma.photo.create({
    data: {
      applicationId,
      fileName: photoData.fileName,
      mimeType: photoData.mimeType,
      fileSize: photoData.fileSize,
      data: isS3Configured() ? null : photoData.data,
      sortOrder: photoCount,
      telegramFileId: photoData.telegramFileId
    }
  });

  // Upload to S3 if configured
  if (isS3Configured()) {
    try {
      const key = buildPhotoKey(applicationId, photo.id, photoData.fileName);
      await uploadPhoto(key, photoData.data, photoData.mimeType);

      return prisma.photo.update({
        where: { id: photo.id },
        data: { s3Key: key }
      });
    } catch (error) {
      console.error(`[PHOTOS] S3 upload failed for photo ${photo.id}, rolling back:`, error.message);
      await prisma.photo.delete({ where: { id: photo.id } });
      throw error;
    }
  }

  return photo;
}

export async function getApplicationPhotos(applicationId) {
  return prisma.photo.findMany({
    where: { applicationId },
    orderBy: { sortOrder: 'asc' }
  });
}

export async function getPhotoById(id) {
  return prisma.photo.findUnique({
    where: { id }
  });
}

export async function deletePhoto(id) {
  const photo = await prisma.photo.findUnique({ where: { id } });

  if (photo?.s3Key) {
    try {
      await deletePhotoFromS3(photo.s3Key);
    } catch (error) {
      console.error(`[PHOTOS] S3 delete failed for key ${photo.s3Key}:`, error.message);
    }
  }

  return prisma.photo.delete({ where: { id } });
}

export async function getPhotoData(photo) {
  if (photo.s3Key) {
    return downloadPhoto(photo.s3Key);
  }
  // Fallback: read binary data from DB (for old photos)
  if (photo.data) {
    return Buffer.isBuffer(photo.data) ? photo.data : Buffer.from(photo.data);
  }
  // If no data in-memory, fetch from DB
  const fullPhoto = await prisma.photo.findUnique({
    where: { id: photo.id },
    select: { data: true }
  });
  if (fullPhoto?.data) {
    return Buffer.isBuffer(fullPhoto.data) ? fullPhoto.data : Buffer.from(fullPhoto.data);
  }
  return null;
}

export async function getApplicationPhotoCount(applicationId) {
  return prisma.photo.count({
    where: { applicationId }
  });
}
