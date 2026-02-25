import express from 'express';
import multer from 'multer';
import { createClient } from '../../db/clients.js';
import { createApplication } from '../../db/applications.js';
import { addPhotoToApplication } from '../../db/photos.js';
import { notifyAdminsNewApplication } from '../../services/notifications.js';
import { getSkinProblems, getAdditionalProducts } from '../../db/settings.js';
import { createPayment, processPayment, createGiftPayment, checkGiftCertificateStatus } from '../../services/payment.js';
import { getProductById, trackClick } from '../../db/doctorProducts.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 6
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

const VALID_SKIN_TYPES = ['DRY', 'OILY', 'COMBINATION', 'NORMAL'];
const VALID_PRICE_RANGES = ['UP_TO_5000', 'UP_TO_10000', 'UP_TO_20000', 'OVER_20000'];
const VALID_CONSULTATION_GOALS = ['FULL_CARE', 'REVIEW_CARE', 'ADDITIONAL_PRODUCTS'];

/**
 * GET /api/web/skin-problems
 * Public endpoint — returns list of skin problems
 */
router.get('/skin-problems', async (req, res) => {
  try {
    const problems = await getSkinProblems();
    res.json({ problems });
  } catch (error) {
    console.error('[WEB] Error getting skin problems:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/web/additional-products
 * Public endpoint — returns list of additional products
 */
router.get('/additional-products', async (req, res) => {
  try {
    const products = await getAdditionalProducts();
    res.json({ products });
  } catch (error) {
    console.error('[WEB] Error getting additional products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/web/applications
 * Create application from website form
 */
router.post('/applications', upload.array('photos', 6), async (req, res) => {
  try {
    const { age, skinType, priceRange, mainProblems, additionalComment, email, fullName, consentToDataProcessing, consultationGoal, additionalProducts } = req.body;
    const files = req.files;

    // Validation
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ error: 'Имя обязательно' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email обязателен' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Некорректный email' });
    }

    if (consentToDataProcessing !== 'true' && consentToDataProcessing !== true) {
      return res.status(400).json({ error: 'Необходимо согласие на обработку персональных данных' });
    }

    if (!age || !skinType) {
      return res.status(400).json({
        error: 'Missing required fields: age, skinType'
      });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({
        error: 'At least one photo is required'
      });
    }

    if (files.length > 6) {
      return res.status(400).json({
        error: 'Maximum 6 photos allowed'
      });
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 12 || ageNum > 120) {
      return res.status(400).json({
        error: 'Invalid age (must be between 12 and 120)'
      });
    }

    if (!VALID_SKIN_TYPES.includes(skinType)) {
      return res.status(400).json({ error: 'Invalid skinType' });
    }

    if (priceRange && !VALID_PRICE_RANGES.includes(priceRange)) {
      return res.status(400).json({ error: 'Invalid priceRange' });
    }

    if (consultationGoal && !VALID_CONSULTATION_GOALS.includes(consultationGoal)) {
      return res.status(400).json({ error: 'Invalid consultationGoal' });
    }

    // Create client (without telegramId for web users)
    const client = await createClient({
      telegramId: null,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: null
    });

    // Create application with PENDING_PAYMENT status
    const application = await createApplication({
      clientId: client.id,
      age: ageNum,
      skinType,
      consultationGoal: consultationGoal || null,
      additionalProducts: additionalProducts || null,
      priceRange: priceRange || null,
      mainProblems,
      additionalComment: additionalComment || null,
      consentToDataProcessing: true,
      source: 'WEB',
      status: 'PENDING_PAYMENT'
    });

    // Save photos
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      await addPhotoToApplication(application.id, {
        fileName: file.originalname || `photo_${i + 1}.jpg`,
        mimeType: file.mimetype,
        fileSize: file.size,
        data: file.buffer,
        telegramFileId: null
      });
    }

    // Create pending payment
    await createPayment(application.id);

    res.status(201).json({
      success: true,
      applicationId: application.id,
      displayNumber: application.displayNumber || application.id,
      message: 'Application created, awaiting payment'
    });

  } catch (error) {
    console.error('[WEB] Error creating application:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/web/validate-promo
 * Validate a promo code (public)
 */
router.post('/validate-promo', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code || !code.trim()) {
      return res.status(400).json({ valid: false, error: 'Введите промокод' });
    }

    const { validatePromoCode } = await import('../../db/promoCodes.js');
    const { PAYMENT_AMOUNT } = await import('../../services/payment.js');
    const { valid, promoCode, error } = await validatePromoCode(code);

    if (!valid) {
      return res.json({ valid: false, error });
    }

    const discountAmount = Math.round(PAYMENT_AMOUNT * promoCode.discount / 100);
    const finalAmount = PAYMENT_AMOUNT - discountAmount;

    res.json({
      valid: true,
      discount: promoCode.discount,
      discountAmount,
      finalAmount,
      originalAmount: PAYMENT_AMOUNT
    });
  } catch (error) {
    console.error('[WEB] Error validating promo:', error);
    res.status(500).json({ valid: false, error: 'Internal server error' });
  }
});

/**
 * POST /api/web/applications/:id/pay
 * Process payment for web application (optionally with promo code)
 */
router.post('/applications/:id/pay', async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);
    if (isNaN(applicationId)) {
      return res.status(400).json({ error: 'Invalid application ID' });
    }

    const { getApplicationById } = await import('../../db/applications.js');
    const application = await getApplicationById(applicationId);

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (application.status !== 'PENDING_PAYMENT') {
      return res.status(400).json({ error: 'Application is not awaiting payment' });
    }

    const promoCode = req.body?.promoCode || null;
    const result = await processPayment(applicationId, promoCode);

    if (result.alreadyPaid) {
      return res.json({ success: true, alreadyPaid: true });
    }

    if (result.freeWithPromo) {
      return res.json({ success: true, freeWithPromo: true });
    }

    res.json({
      success: true,
      confirmationUrl: result.confirmationUrl
    });
  } catch (error) {
    console.error('[WEB] Error processing payment:', error);
    // Promo validation errors are user-facing; mask internal errors
    const isPromoError = error.message && !error.message.includes('Payment not found');
    res.status(isPromoError ? 400 : 500).json({
      error: isPromoError ? error.message : 'Ошибка обработки платежа'
    });
  }
});

/**
 * GET /api/web/application/:id/status
 * Check application status (public, but limited info)
 */
router.get('/application/:id/status', async (req, res) => {
  try {
    const { getApplicationById } = await import('../../db/applications.js');
    const application = await getApplicationById(parseInt(req.params.id));

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const statusMessages = {
      PENDING_PAYMENT: 'Заявка ожидает оплаты',
      NEW: 'Заявка получена и ожидает назначения специалиста',
      ASSIGNED: 'Заявка на рассмотрении у специалиста',
      RESPONSE_GIVEN: 'Рекомендации подготовлены и проверяются',
      APPROVED: 'Рекомендации одобрены',
      SENT_TO_CLIENT: 'Рекомендации отправлены',
      DECLINED: 'Заявка отклонена'
    };

    res.json({
      id: application.id,
      displayNumber: application.displayNumber || application.id,
      status: application.status,
      statusMessage: statusMessages[application.status] || application.status,
      createdAt: application.createdAt,
      hasDoctor: !!application.doctorId
    });

  } catch (error) {
    console.error('[WEB] Error getting status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/web/reviews
 * Get random approved reviews for landing page (public)
 */
router.get('/reviews', async (req, res) => {
  try {
    const { getApprovedReviews } = await import('../../db/reviews.js');
    const reviews = await getApprovedReviews(6);

    res.json({ reviews });
  } catch (error) {
    console.error('[WEB] Error getting reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/web/reviews/:id/image
 * Serve review image publicly (only for approved reviews)
 */
router.get('/reviews/:id/image', async (req, res) => {
  try {
    const { getReviewById } = await import('../../db/reviews.js');
    const { downloadPhoto } = await import('../../services/s3.js');

    const review = await getReviewById(parseInt(req.params.id));
    if (!review || !review.imageS3Key || !review.isApproved) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const buffer = await downloadPhoto(review.imageS3Key);
    const ext = review.imageS3Key.split('.').pop().toLowerCase();
    const mimeTypes = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' };
    res.set('Content-Type', mimeTypes[ext] || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(buffer);
  } catch (error) {
    console.error('[WEB] Error serving review image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/web/gift
 * Create a gift certificate payment (public, requires email)
 */
router.post('/gift', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email обязателен' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Некорректный email' });
    }

    const result = await createGiftPayment({ buyerEmail: email.trim() });

    res.json({
      success: true,
      giftCertificateId: result.giftCertificateId,
      confirmationUrl: result.confirmationUrl
    });
  } catch (error) {
    console.error('[WEB] Error creating gift payment:', error);
    res.status(500).json({ error: 'Ошибка при создании платежа' });
  }
});

/**
 * GET /api/web/gift/:id/check
 * Check gift certificate status & return promo code if ready
 */
router.get('/gift/:id/check', async (req, res) => {
  try {
    const giftId = parseInt(req.params.id);
    if (isNaN(giftId)) {
      return res.status(400).json({ error: 'Invalid gift certificate ID' });
    }

    const result = await checkGiftCertificateStatus(giftId);
    res.json(result);
  } catch (error) {
    console.error('[WEB] Error checking gift status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/web/product/:id/redirect
 * Public endpoint — track click and redirect to affiliate link
 */
router.get('/product/:id/redirect', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    // Get product
    const product = await getProductById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Determine redirect URL (prefer affiliate link, fallback to shopUrl or url)
    const redirectUrl = product.affiliateLink || product.shopUrl || product.url;
    if (!redirectUrl) {
      return res.status(400).json({ error: 'No link available for this product' });
    }

    // Track click (async, don't wait)
    trackClick(productId).catch(err => {
      console.error('[WEB] Error tracking click:', err);
    });

    // Redirect to product link
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('[WEB] Error redirecting to product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
