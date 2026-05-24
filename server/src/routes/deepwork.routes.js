import { Router } from 'express';
import { startDeepWork, endDeepWork, getDeepWorkTeam } from '../controllers/deepwork.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.post('/start', authorize('employee', 'admin'), startDeepWork);
router.post('/end', authorize('employee', 'admin'), endDeepWork);
router.get('/team', authorize('admin'), getDeepWorkTeam);

export default router;
