import { Router } from 'express';
import { updateFocus, getTeamFocus } from '../controllers/focus.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.post('/update', authorize('employee', 'admin'), updateFocus);
router.get('/team', authorize('admin'), getTeamFocus);

export default router;
