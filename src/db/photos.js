import prisma from './prisma.js';

export async function addPhotoToApplication(applicationId, photoData) {
  const photoCount = await prisma.photo.count({
    where: { applicationId }
  });

  return prisma.photo.create({
    data: {
      applicationId,
      fileName: photoData.fileName,
      mimeType: photoData.mimeType,
      fileSize: photoData.fileSize,
      data: photoData.data,
      sortOrder: photoCount,
      telegramFileId: photoData.telegramFileId
    }
  });
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
  return prisma.photo.delete({
    where: { id }
  });
}

export async function getApplicationPhotoCount(applicationId) {
  return prisma.photo.count({
    where: { applicationId }
  });
}
