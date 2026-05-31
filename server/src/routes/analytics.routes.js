import { Router } from 'express';
import { getDashboardAnalytics } from '../controllers/analytics.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Only admin users should have access to high-level system analytics
router.get('/dashboard', authenticate, authorize('admin', 'hr'), getDashboardAnalytics);

export default router;
