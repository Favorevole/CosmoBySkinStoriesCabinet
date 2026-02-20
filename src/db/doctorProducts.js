import prisma from './prisma.js';

export async function createProduct(doctorId, data) {
  return prisma.doctorProduct.create({
    data: {
      doctorId,
      name: data.name,
      brand: data.brand || null,
      category: data.category || null,
      url: data.url || null,
      notes: data.notes || null
    }
  });
}

export async function getProducts(doctorId, category) {
  const where = { doctorId };
  if (category) where.category = category;

  return prisma.doctorProduct.findMany({
    where,
    orderBy: { updatedAt: 'desc' }
  });
}

export async function updateProduct(id, doctorId, data) {
  const existing = await prisma.doctorProduct.findFirst({
    where: { id, doctorId }
  });
  if (!existing) {
    throw new Error('Product not found');
  }
  return prisma.doctorProduct.update({
    where: { id },
    data: {
      name: data.name,
      brand: data.brand,
      category: data.category,
      url: data.url,
      notes: data.notes
    }
  });
}

export async function deleteProduct(id, doctorId) {
  const existing = await prisma.doctorProduct.findFirst({
    where: { id, doctorId }
  });
  if (!existing) {
    throw new Error('Product not found');
  }
  return prisma.doctorProduct.delete({
    where: { id }
  });
}
