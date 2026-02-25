import { getDoctorActiveSubscription, getClientActiveSubscription } from '../../db/subscriptions.js';

/**
 * Middleware to check if doctor has active subscription
 * Use this for doctor routes that require active subscription
 */
export async function requireDoctorSubscription(req, res, next) {
  try {
    if (!req.doctor || !req.doctor.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const subscription = await getDoctorActiveSubscription(req.doctor.id);

    if (!subscription) {
      return res.status(403).json({
        error: 'Требуется активная подписка',
        message: 'Для доступа к этой функции необходима активная подписка на платформу',
        subscriptionRequired: true
      });
    }

    // Check if subscription is expired
    if (new Date() > new Date(subscription.endDate)) {
      return res.status(403).json({
        error: 'Подписка истекла',
        message: 'Ваша подписка истекла. Пожалуйста, продлите подписку для продолжения работы',
        subscriptionRequired: true
      });
    }

    // Attach subscription to request for use in route handlers
    req.subscription = subscription;
    next();
  } catch (error) {
    console.error('[SUBSCRIPTION_CHECK] Doctor subscription check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Middleware to check if client can use consultation (subscription limits)
 * Use this when creating new consultations
 */
export async function checkClientConsultationLimit(req, res, next) {
  try {
    if (!req.client || !req.client.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const subscription = await getClientActiveSubscription(req.client.id);

    // If no subscription, allow consultation (pay-per-consultation model)
    if (!subscription) {
      req.hasSubscription = false;
      return next();
    }

    // Check if subscription is active
    if (subscription.status !== 'ACTIVE' || new Date() > new Date(subscription.endDate)) {
      req.hasSubscription = false;
      return next();
    }

    // Check consultation limit
    if (subscription.plan.consultationsPerMonth !== null) {
      if (subscription.consultationsUsed >= subscription.plan.consultationsPerMonth) {
        return res.status(403).json({
          error: 'Лимит консультаций исчерпан',
          message: `Вы использовали все ${subscription.plan.consultationsPerMonth} консультаций в рамках вашей подписки за этот месяц`,
          limitExceeded: true
        });
      }
    }

    // Attach subscription to request
    req.subscription = subscription;
    req.hasSubscription = true;
    next();
  } catch (error) {
    console.error('[SUBSCRIPTION_CHECK] Client consultation limit check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Optional middleware to check subscription but don't block access
 * Just attaches subscription info to request
 */
export async function attachDoctorSubscription(req, res, next) {
  try {
    if (req.doctor && req.doctor.id) {
      const subscription = await getDoctorActiveSubscription(req.doctor.id);
      req.subscription = subscription || null;
      req.hasActiveSubscription = !!subscription && new Date() <= new Date(subscription.endDate);
    }
    next();
  } catch (error) {
    console.error('[SUBSCRIPTION_CHECK] Attach doctor subscription error:', error);
    // Don't block - just continue without subscription info
    next();
  }
}

/**
 * Optional middleware to check client subscription but don't block access
 */
export async function attachClientSubscription(req, res, next) {
  try {
    if (req.client && req.client.id) {
      const subscription = await getClientActiveSubscription(req.client.id);
      req.subscription = subscription || null;
      req.hasActiveSubscription = !!subscription && new Date() <= new Date(subscription.endDate);
    }
    next();
  } catch (error) {
    console.error('[SUBSCRIPTION_CHECK] Attach client subscription error:', error);
    // Don't block - just continue without subscription info
    next();
  }
}
