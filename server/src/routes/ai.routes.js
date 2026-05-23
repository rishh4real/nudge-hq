import { Router } from 'express';
import {
  generateDailySummary,
  detectDelayedTasks,
  identifyInactiveEmployees,
  burnoutCheck,
  sprintForecast,
  standupBrief,
  scoreUpdate,
  anomalyCheck,
  appreciation,
} from '../controllers/ai.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/score-update', scoreUpdate);

// Secure admin NudgeAI paths to Admins only
router.use(authorize('admin'));
router.get('/summary/daily', generateDailySummary);
router.get('/delays', detectDelayedTasks);
router.get('/inactivity', identifyInactiveEmployees);
router.post('/burnout-check', burnoutCheck);
router.post('/sprint-forecast', sprintForecast);
router.post('/standup-brief', standupBrief);
router.post('/anomaly-check', anomalyCheck);
router.post('/appreciation', appreciation);

export default router;
