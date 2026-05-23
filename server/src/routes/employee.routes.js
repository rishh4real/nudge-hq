import { Router } from 'express';
import {
  submitProgressUpdate,
  getMyProgressHistory,
  getMyDashboardStats,
  getMyNotifications,
} from '../controllers/employee.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

// Apply auth middleware to all employee routes
router.use(authenticate);

// Submit update (either Employee or Admin acting as Employee)
router.post('/updates', authorize('employee', 'admin'), validateBody(['progress_text']), submitProgressUpdate);

// Get my personal update history
router.get('/updates', authorize('employee', 'admin'), getMyProgressHistory);

// Get employee dashboard quick stats
router.get('/dashboard', authorize('employee'), getMyDashboardStats);
router.get('/notifications', authorize('employee'), getMyNotifications);

export default router;
