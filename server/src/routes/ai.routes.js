import { Router } from 'express';
import {
  generateDailySummary,
  detectDelayedTasks,
  identifyInactiveEmployees,
} from '../controllers/ai.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Secure all AI paths to Admins only
router.use(authenticate, authorize('admin'));

router.get('/summary/daily', generateDailySummary);
router.get('/delays', detectDelayedTasks);
router.get('/inactivity', identifyInactiveEmployees);

export default router;
