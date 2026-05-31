import { Router } from 'express';
import { updateFocus, getTeamFocus } from '../controllers/focus.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.post('/update', authorize('employee', 'manager', 'hr', 'admin'), updateFocus);
router.get('/team', authorize('manager', 'hr', 'admin'), getTeamFocus);

export default router;
