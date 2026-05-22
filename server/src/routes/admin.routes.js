import { Router } from 'express';
import {
  getAllEmployeeUpdates,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  exportReportData,
} from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

// Apply authentication to all admin routes
router.use(authenticate);

// Department directory (readable by all users, writable only by admins)
router.get('/departments', getDepartments);
router.post('/departments', authorize('admin'), validateBody(['name']), createDepartment);
router.put('/departments/:id', authorize('admin'), updateDepartment);
router.delete('/departments/:id', authorize('admin'), deleteDepartment);

// Admin queries and logs (Admin only)
router.get('/updates', authorize('admin'), getAllEmployeeUpdates);
router.get('/reports/export', authorize('admin'), exportReportData);

export default router;
