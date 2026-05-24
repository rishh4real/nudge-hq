import { Router } from 'express';
import { generateBoardPack } from '../controllers/report.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.post('/board-pack', authorize('admin'), generateBoardPack);

export default router;
