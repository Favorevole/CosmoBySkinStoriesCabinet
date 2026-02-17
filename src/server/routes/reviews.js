import express from 'express';
import multer from 'multer';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { getAllReviews, approveReview, rejectReview, deleteReview, createAdminReview, getReviewById, updateReviewImageKey } from '../../db/reviews.js';
import { uploadPhoto, downloadPhoto, buildReviewImageKey, isS3Configured } from '../../services/s3.js';

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

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

// POST / — create review from admin panel
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { rating, text, clientName } = req.body;

    const ratingNum = parseInt(rating);
    if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    if (!text && !req.file) {
      return res.status(400).json({ error: 'Text or image is required' });
    }

    const review = await createAdminReview({
      rating: ratingNum,
      text: text || null,
      clientName: clientName || null
    });

    if (req.file && isS3Configured()) {
      const key = buildReviewImageKey(review.id, req.file.originalname || 'image.jpg');
      await uploadPhoto(key, req.file.buffer, req.file.mimetype);
      await updateReviewImageKey(review.id, key);
      review.imageS3Key = key;
    }

    res.status(201).json(review);
  } catch (error) {
    console.error('[REVIEWS] Error creating review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /:id/image — serve review image (admin, authenticated)
router.get('/:id/image', async (req, res) => {
  try {
    const review = await getReviewById(parseInt(req.params.id));
    if (!review || !review.imageS3Key) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const buffer = await downloadPhoto(review.imageS3Key);
    const ext = review.imageS3Key.split('.').pop().toLowerCase();
    const mimeTypes = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' };
    res.set('Content-Type', mimeTypes[ext] || 'image/jpeg');
    res.send(buffer);
  } catch (error) {
    console.error('[REVIEWS] Error serving image:', error);
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
