import express from 'express';
import { authenticateClient } from '../middleware/clientAuth.js';
import { authenticateDoctor } from '../middleware/doctorAuth.js';
import {
  getSubscriptionPlans,
  getSubscriptionPlanById,
  getClientActiveSubscription,
  getDoctorActiveSubscription,
  getClientSubscriptions,
  getDoctorSubscriptions,
  createSubscription,
  cancelSubscription
} from '../../db/subscriptions.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

/**
 * GET /api/subscriptions/plans
 * Get all subscription plans
 */
router.get('/plans', async (req, res) => {
  try {
    const { type } = req.query;
    const plans = await getSubscriptionPlans(type || null);

    res.json({ plans });
  } catch (error) {
    console.error('[SUBSCRIPTIONS] Get plans error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/subscriptions/plans/:id
 * Get subscription plan by ID
 */
router.get('/plans/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const plan = await getSubscriptionPlanById(id);

    if (!plan) {
      return res.status(404).json({ error: 'План не найден' });
    }

    res.json({ plan });
  } catch (error) {
    console.error('[SUBSCRIPTIONS] Get plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== CLIENT ROUTES ====================

/**
 * GET /api/subscriptions/client/current
 * Get client's active subscription
 */
router.get('/client/current', authenticateClient, async (req, res) => {
  try {
    const subscription = await getClientActiveSubscription(req.client.id);

    res.json({ subscription });
  } catch (error) {
    console.error('[SUBSCRIPTIONS] Get client subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/subscriptions/client/history
 * Get client's subscription history
 */
router.get('/client/history', authenticateClient, async (req, res) => {
  try {
    const subscriptions = await getClientSubscriptions(req.client.id);

    res.json({ subscriptions });
  } catch (error) {
    console.error('[SUBSCRIPTIONS] Get client history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/subscriptions/client/subscribe
 * Create new client subscription
 */
router.post('/client/subscribe', authenticateClient, async (req, res) => {
  try {
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({ error: 'planId обязателен' });
    }

    // Check if plan exists and is for clients
    const plan = await getSubscriptionPlanById(parseInt(planId));
    if (!plan) {
      return res.status(404).json({ error: 'План не найден' });
    }

    if (!plan.type.startsWith('CLIENT_')) {
      return res.status(400).json({ error: 'Этот план не для клиентов' });
    }

    // Check if client already has active subscription
    const activeSubscription = await getClientActiveSubscription(req.client.id);
    if (activeSubscription) {
      return res.status(400).json({ error: 'У вас уже есть активная подписка' });
    }

    // Create subscription with PENDING status (will be activated after payment)
    const subscription = await createSubscription({
      clientId: req.client.id,
      planId: parseInt(planId),
      status: 'PENDING'
    });

    // Create payment URL
    const { getSubscriptionPaymentUrl } = await import('../../services/subscriptionPayment.js');
    const paymentUrl = await getSubscriptionPaymentUrl(subscription.id, 'client');

    res.json({
      subscription,
      paymentUrl,
      message: 'Подписка создана. Перейдите к оплате.'
    });
  } catch (error) {
    console.error('[SUBSCRIPTIONS] Create client subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/subscriptions/client/cancel/:id
 * Cancel client subscription
 */
router.post('/client/cancel/:id', authenticateClient, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const subscription = await cancelSubscription(id, req.client.id, 'client');

    res.json({
      subscription,
      message: 'Подписка отменена'
    });
  } catch (error) {
    if (error.message === 'Subscription not found') {
      return res.status(404).json({ error: 'Подписка не найдена' });
    }
    if (error.message === 'Unauthorized') {
      return res.status(403).json({ error: 'Нет доступа' });
    }
    console.error('[SUBSCRIPTIONS] Cancel client subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== DOCTOR ROUTES ====================

/**
 * GET /api/subscriptions/doctor/current
 * Get doctor's active subscription
 */
router.get('/doctor/current', authenticateDoctor, async (req, res) => {
  try {
    const subscription = await getDoctorActiveSubscription(req.doctor.id);

    res.json({ subscription });
  } catch (error) {
    console.error('[SUBSCRIPTIONS] Get doctor subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/subscriptions/doctor/history
 * Get doctor's subscription history
 */
router.get('/doctor/history', authenticateDoctor, async (req, res) => {
  try {
    const subscriptions = await getDoctorSubscriptions(req.doctor.id);

    res.json({ subscriptions });
  } catch (error) {
    console.error('[SUBSCRIPTIONS] Get doctor history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/subscriptions/doctor/subscribe
 * Create new doctor subscription
 */
router.post('/doctor/subscribe', authenticateDoctor, async (req, res) => {
  try {
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({ error: 'planId обязателен' });
    }

    // Check if plan exists and is for doctors
    const plan = await getSubscriptionPlanById(parseInt(planId));
    if (!plan) {
      return res.status(404).json({ error: 'План не найден' });
    }

    if (!plan.type.startsWith('DOCTOR_')) {
      return res.status(400).json({ error: 'Этот план не для врачей' });
    }

    // Check if doctor already has active subscription
    const activeSubscription = await getDoctorActiveSubscription(req.doctor.id);
    if (activeSubscription) {
      return res.status(400).json({ error: 'У вас уже есть активная подписка' });
    }

    // Create subscription with PENDING status
    const subscription = await createSubscription({
      doctorId: req.doctor.id,
      planId: parseInt(planId),
      status: 'PENDING'
    });

    // Create payment URL
    const { getSubscriptionPaymentUrl } = await import('../../services/subscriptionPayment.js');
    const paymentUrl = await getSubscriptionPaymentUrl(subscription.id, 'doctor');

    res.json({
      subscription,
      paymentUrl,
      message: 'Подписка создана. Перейдите к оплате.'
    });
  } catch (error) {
    console.error('[SUBSCRIPTIONS] Create doctor subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/subscriptions/doctor/cancel/:id
 * Cancel doctor subscription
 */
router.post('/doctor/cancel/:id', authenticateDoctor, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const subscription = await cancelSubscription(id, req.doctor.id, 'doctor');

    res.json({
      subscription,
      message: 'Подписка отменена'
    });
  } catch (error) {
    if (error.message === 'Subscription not found') {
      return res.status(404).json({ error: 'Подписка не найдена' });
    }
    if (error.message === 'Unauthorized') {
      return res.status(403).json({ error: 'Нет доступа' });
    }
    console.error('[SUBSCRIPTIONS] Cancel doctor subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
