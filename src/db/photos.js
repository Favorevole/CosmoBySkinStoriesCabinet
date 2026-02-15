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
  // 1. Try S3
  if (photo.s3Key) {
    try {
      return await downloadPhoto(photo.s3Key);
    } catch (error) {
      console.error(`[PHOTOS] S3 download failed for photo ${photo.id} (key: ${photo.s3Key}):`, error.message);
    }
  }

  // 2. Fallback: read binary data from DB
  if (photo.data) {
    return Buffer.isBuffer(photo.data) ? photo.data : Buffer.from(photo.data);
  }
  const fullPhoto = await prisma.photo.findUnique({
    where: { id: photo.id },
    select: { data: true }
  });
  if (fullPhoto?.data) {
    return Buffer.isBuffer(fullPhoto.data) ? fullPhoto.data : Buffer.from(fullPhoto.data);
  }

  // 3. Fallback: download from Telegram API
  if (photo.telegramFileId) {
    try {
      const config = (await import('../config/environment.js')).default;
      const token = config.clientBot.token;
      const fileRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${photo.telegramFileId}`);
      const fileData = await fileRes.json();
      if (fileData.ok) {
        const fileUrl = `https://api.telegram.org/file/bot${token}/${fileData.result.file_path}`;
        const imgRes = await fetch(fileUrl);
        return Buffer.from(await imgRes.arrayBuffer());
      }
    } catch (error) {
      console.error(`[PHOTOS] Telegram download failed for photo ${photo.id}:`, error.message);
    }
  }

  return null;
}

export async function getApplicationPhotoCount(applicationId) {
  return prisma.photo.count({
    where: { applicationId }
  });
}
