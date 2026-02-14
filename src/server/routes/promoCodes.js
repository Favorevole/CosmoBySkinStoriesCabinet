import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import {
  getAllPromoCodes,
  getPromoCodeById,
  createPromoCode,
  updatePromoCode,
  deletePromoCode
} from '../../db/promoCodes.js';

const router = express.Router();

router.use(authenticateToken);
router.use(requireAdmin);

/**
 * GET /api/promo-codes
 * List all promo codes
 */
router.get('/', async (req, res) => {
  try {
    const promoCodes = await getAllPromoCodes();
    res.json(promoCodes);
  } catch (error) {
    console.error('[PROMO] Error listing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/promo-codes
 * Create a new promo code
 */
router.post('/', async (req, res) => {
  try {
    const { code, discount, maxUses, expiresAt } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ error: 'Код обязателен' });
    }

    if (discount === undefined || discount < 0 || discount > 100) {
      return res.status(400).json({ error: 'Скидка должна быть от 0 до 100%' });
    }

    const promoCode = await createPromoCode({
      code: code.trim(),
      discount: parseInt(discount),
      maxUses: maxUses ? parseInt(maxUses) : null,
      expiresAt: expiresAt || null
    });

    res.status(201).json(promoCode);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Промокод с таким кодом уже существует' });
    }
    console.error('[PROMO] Error creating:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/promo-codes/:id
 * Update a promo code
 */
router.patch('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const promoCode = await updatePromoCode(id, req.body);
    res.json(promoCode);
  } catch (error) {
    console.error('[PROMO] Error updating:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/promo-codes/:id
 * Delete a promo code
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await deletePromoCode(id);
    res.json({ success: true });
  } catch (error) {
    console.error('[PROMO] Error deleting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
