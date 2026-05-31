import { Router } from 'express';
import { submitDailyCheckin, getTeamPresence } from '../controllers/checkin.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.post('/daily', authorize('employee', 'manager', 'hr', 'admin'), submitDailyCheckin);
router.get('/team', authorize('manager', 'hr', 'admin'), getTeamPresence);

export default router;
