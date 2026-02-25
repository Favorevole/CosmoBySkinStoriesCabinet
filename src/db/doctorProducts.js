import prisma from './prisma.js';

export async function createProduct(doctorId, data) {
  return prisma.doctorProduct.create({
    data: {
      doctorId,
      name: data.name,
      brand: data.brand || null,
      category: data.category || null,
      url: data.url || null,
      notes: data.notes || null,
      // Affiliate fields
      shopUrl: data.shopUrl || null,
      affiliateLink: data.affiliateLink || null,
      shopName: data.shopName || null,
      commission: data.commission ? parseFloat(data.commission) : null,
      isAffiliate: data.isAffiliate || false
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
      notes: data.notes,
      // Affiliate fields
      shopUrl: data.shopUrl,
      affiliateLink: data.affiliateLink,
      shopName: data.shopName,
      commission: data.commission ? parseFloat(data.commission) : null,
      isAffiliate: data.isAffiliate
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

// Track click on affiliate link
export async function trackClick(id) {
  return prisma.doctorProduct.update({
    where: { id },
    data: {
      clicks: {
        increment: 1
      }
    }
  });
}

// Track conversion (purchase)
export async function trackConversion(id) {
  return prisma.doctorProduct.update({
    where: { id },
    data: {
      conversions: {
        increment: 1
      }
    }
  });
}

// Get product by ID (for tracking)
export async function getProductById(id) {
  return prisma.doctorProduct.findUnique({
    where: { id }
  });
}
