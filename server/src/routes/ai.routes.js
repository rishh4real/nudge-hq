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
  skillGapAnalysis,
  assistantChat,
} from '../controllers/ai.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/assistant', assistantChat);

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
router.get('/skill-gap-analysis', skillGapAnalysis);
router.post('/skill-gap-analysis', skillGapAnalysis);

export default router;
