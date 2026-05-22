import { Router } from 'express';
import {
  createTask,
  getTasks,
  updateTaskStatus,
  updateTask,
  deleteTask,
} from '../controllers/task.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

// Apply authentication to all task routes
router.use(authenticate);

// CRUD Tasks
router.post('/', authorize('admin'), validateBody(['title']), createTask);
router.get('/', getTasks);
router.put('/:id', authorize('admin'), updateTask);
router.delete('/:id', authorize('admin'), deleteTask);

// Status transition (Both employee and admin can update status)
router.put('/:id/status', validateBody(['status']), updateTaskStatus);

export default router;
