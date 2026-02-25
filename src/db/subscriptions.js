import prisma from './prisma.js';

// ==================== SUBSCRIPTION PLANS ====================

/**
 * Get all active subscription plans
 * @param {string} type - Optional: filter by type (CLIENT_MONTHLY, DOCTOR_MONTHLY, etc.)
 */
export async function getSubscriptionPlans(type = null) {
  const where = { isActive: true };
  if (type) where.type = type;

  return prisma.subscriptionPlan.findMany({
    where,
    orderBy: { price: 'asc' }
  });
}

/**
 * Get subscription plan by ID
 */
export async function getSubscriptionPlanById(id) {
  return prisma.subscriptionPlan.findUnique({
    where: { id }
  });
}

/**
 * Create subscription plan (admin only)
 */
export async function createSubscriptionPlan(data) {
  return prisma.subscriptionPlan.create({
    data: {
      name: data.name,
      description: data.description,
      type: data.type,
      price: data.price,
      currency: data.currency || 'RUB',
      consultationsPerMonth: data.consultationsPerMonth,
      features: data.features || [],
      isActive: data.isActive !== undefined ? data.isActive : true
    }
  });
}

/**
 * Update subscription plan
 */
export async function updateSubscriptionPlan(id, data) {
  return prisma.subscriptionPlan.update({
    where: { id },
    data
  });
}

// ==================== SUBSCRIPTIONS ====================

/**
 * Get active subscription for client
 */
export async function getClientActiveSubscription(clientId) {
  return prisma.subscription.findFirst({
    where: {
      clientId,
      status: 'ACTIVE',
      endDate: { gte: new Date() }
    },
    include: {
      plan: true
    },
    orderBy: { endDate: 'desc' }
  });
}

/**
 * Get active subscription for doctor
 */
export async function getDoctorActiveSubscription(doctorId) {
  return prisma.subscription.findFirst({
    where: {
      doctorId,
      status: 'ACTIVE',
      endDate: { gte: new Date() }
    },
    include: {
      plan: true
    },
    orderBy: { endDate: 'desc' }
  });
}

/**
 * Get all subscriptions for client
 */
export async function getClientSubscriptions(clientId) {
  return prisma.subscription.findMany({
    where: { clientId },
    include: {
      plan: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * Get all subscriptions for doctor
 */
export async function getDoctorSubscriptions(doctorId) {
  return prisma.subscription.findMany({
    where: { doctorId },
    include: {
      plan: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * Create subscription
 */
export async function createSubscription(data) {
  const plan = await getSubscriptionPlanById(data.planId);
  if (!plan) {
    throw new Error('Subscription plan not found');
  }

  const now = new Date();
  const endDate = new Date(now);

  // Calculate end date based on plan type
  if (plan.type.includes('MONTHLY')) {
    endDate.setMonth(endDate.getMonth() + 1);
  } else if (plan.type.includes('YEARLY')) {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }

  return prisma.subscription.create({
    data: {
      clientId: data.clientId || null,
      doctorId: data.doctorId || null,
      planId: data.planId,
      status: data.status || 'PENDING',
      startDate: data.startDate || now,
      endDate,
      amount: plan.price,
      currency: plan.currency,
      paymentId: data.paymentId || null,
      autoRenew: data.autoRenew !== undefined ? data.autoRenew : true,
      consultationsUsed: 0
    },
    include: {
      plan: true
    }
  });
}

/**
 * Activate subscription (after payment)
 */
export async function activateSubscription(id, paymentId) {
  return prisma.subscription.update({
    where: { id },
    data: {
      status: 'ACTIVE',
      paymentId
    },
    include: {
      plan: true
    }
  });
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(id, userId, userType) {
  const subscription = await prisma.subscription.findUnique({
    where: { id }
  });

  if (!subscription) {
    throw new Error('Subscription not found');
  }

  // Check ownership
  if (userType === 'client' && subscription.clientId !== userId) {
    throw new Error('Unauthorized');
  }
  if (userType === 'doctor' && subscription.doctorId !== userId) {
    throw new Error('Unauthorized');
  }

  return prisma.subscription.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      autoRenew: false
    }
  });
}

/**
 * Renew subscription
 */
export async function renewSubscription(oldSubscriptionId) {
  const oldSub = await prisma.subscription.findUnique({
    where: { id: oldSubscriptionId },
    include: { plan: true }
  });

  if (!oldSub) {
    throw new Error('Subscription not found');
  }

  // Create new subscription
  const startDate = new Date(oldSub.endDate);
  const endDate = new Date(startDate);

  if (oldSub.plan.type.includes('MONTHLY')) {
    endDate.setMonth(endDate.getMonth() + 1);
  } else if (oldSub.plan.type.includes('YEARLY')) {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }

  return prisma.subscription.create({
    data: {
      clientId: oldSub.clientId,
      doctorId: oldSub.doctorId,
      planId: oldSub.planId,
      status: 'PENDING',
      startDate,
      endDate,
      amount: oldSub.plan.price,
      currency: oldSub.plan.currency,
      autoRenew: oldSub.autoRenew,
      consultationsUsed: 0
    },
    include: {
      plan: true
    }
  });
}

/**
 * Increment consultation usage
 */
export async function incrementConsultationUsage(subscriptionId) {
  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      consultationsUsed: { increment: 1 }
    }
  });
}

/**
 * Check if subscription allows consultation
 */
export async function canUseConsultation(subscriptionId) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { plan: true }
  });

  if (!subscription || subscription.status !== 'ACTIVE') {
    return false;
  }

  // Check expiry
  if (new Date() > subscription.endDate) {
    return false;
  }

  // Check usage limit
  if (subscription.plan.consultationsPerMonth !== null) {
    return subscription.consultationsUsed < subscription.plan.consultationsPerMonth;
  }

  // Unlimited
  return true;
}

/**
 * Expire old subscriptions (run as cron job)
 */
export async function expireOldSubscriptions() {
  return prisma.subscription.updateMany({
    where: {
      status: 'ACTIVE',
      endDate: { lt: new Date() }
    },
    data: {
      status: 'EXPIRED'
    }
  });
}

/**
 * Get subscriptions pending renewal (for auto-renewal)
 */
export async function getSubscriptionsPendingRenewal() {
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  return prisma.subscription.findMany({
    where: {
      status: 'ACTIVE',
      autoRenew: true,
      endDate: {
        lte: threeDaysFromNow,
        gte: new Date()
      }
    },
    include: {
      plan: true,
      client: true,
      doctor: true
    }
  });
}
