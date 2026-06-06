import { Router } from 'express';
import {
  createNudgeSpacePost,
  getNudgeSpacePosts,
} from '../controllers/nudgespace.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/posts', getNudgeSpacePosts);
router.post('/posts', createNudgeSpacePost);

export default router;
