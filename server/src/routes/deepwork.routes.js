import { Router } from 'express';
import { startDeepWork, endDeepWork, getDeepWorkTeam } from '../controllers/deepwork.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.post('/start', authorize('employee', 'manager', 'hr', 'admin'), startDeepWork);
router.post('/end', authorize('employee', 'manager', 'hr', 'admin'), endDeepWork);
router.get('/team', authorize('manager', 'hr', 'admin'), getDeepWorkTeam);

export default router;
