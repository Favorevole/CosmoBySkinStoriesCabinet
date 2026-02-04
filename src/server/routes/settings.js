import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { getSkinProblems, updateSkinProblems, getAllSettings, setSetting } from '../../db/settings.js';

const router = Router();

// All routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// Get all settings
router.get('/', async (req, res, next) => {
  try {
    const settings = await getAllSettings();
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

// Get skin problems
router.get('/skin-problems', async (req, res, next) => {
  try {
    const problems = await getSkinProblems();
    res.json(problems);
  } catch (error) {
    next(error);
  }
});

// Update skin problems
router.put('/skin-problems', async (req, res, next) => {
  try {
    const { problems } = req.body;

    if (!Array.isArray(problems)) {
      return res.status(400).json({ error: 'Problems must be an array' });
    }

    if (problems.some(p => typeof p !== 'string' || p.trim() === '')) {
      return res.status(400).json({ error: 'All problems must be non-empty strings' });
    }

    await updateSkinProblems(problems);
    res.json({ success: true, problems });
  } catch (error) {
    next(error);
  }
});

// Generic setting update
router.put('/:key', async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({ error: 'Value is required' });
    }

    await setSetting(key, value);
    res.json({ success: true, key, value });
  } catch (error) {
    next(error);
  }
});

export default router;
