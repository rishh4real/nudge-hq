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

router.get('/summary/daily', authorize('admin', 'manager'), generateDailySummary);
router.get('/delays', authorize('admin', 'manager'), detectDelayedTasks);
router.get('/inactivity', authorize('admin', 'hr'), identifyInactiveEmployees);
router.post('/burnout-check', authorize('admin', 'hr'), burnoutCheck);
router.post('/sprint-forecast', authorize('admin', 'manager'), sprintForecast);
router.post('/standup-brief', authorize('admin', 'manager'), standupBrief);
router.post('/anomaly-check', authorize('admin', 'hr'), anomalyCheck);
router.post('/appreciation', authorize('admin', 'manager'), appreciation);
router.get('/skill-gap-analysis', authorize('admin', 'hr'), skillGapAnalysis);
router.post('/skill-gap-analysis', authorize('admin', 'hr'), skillGapAnalysis);

export default router;
