import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { getAllReviews, approveReview, rejectReview, deleteReview } from '../../db/reviews.js';

const router = express.Router();

router.use(authenticateToken);
router.use(requireAdmin);

// GET / — list all reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await getAllReviews();
    res.json(reviews);
  } catch (error) {
    console.error('[REVIEWS] Error fetching reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /:id/approve
router.post('/:id/approve', async (req, res) => {
  try {
    const review = await approveReview(parseInt(req.params.id));
    res.json(review);
  } catch (error) {
    console.error('[REVIEWS] Error approving review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /:id/reject
router.post('/:id/reject', async (req, res) => {
  try {
    const review = await rejectReview(parseInt(req.params.id));
    res.json(review);
  } catch (error) {
    console.error('[REVIEWS] Error rejecting review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /:id
router.delete('/:id', async (req, res) => {
  try {
    await deleteReview(parseInt(req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('[REVIEWS] Error deleting review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
