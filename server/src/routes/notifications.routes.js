import { Router } from 'express';
import {
  sendDeadlineWhatsAppRemindersForRequest,
  handleWhatsAppReply,
  previewWhatsAppNudges,
  sendWeeklyWhatsAppManagerReportsForRequest,
  sendWeeklyWhatsAppWinsForRequest,
  sendWhatsAppNudgesForRequest,
} from '../controllers/notifications.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/whatsapp/reply', handleWhatsAppReply);

router.use(authenticate);

router.get('/whatsapp/preview', authorize('admin', 'hr'), previewWhatsAppNudges);
router.post('/whatsapp', authorize('admin', 'hr'), sendWhatsAppNudgesForRequest);
router.post('/whatsapp/deadlines', authorize('admin', 'hr', 'manager'), sendDeadlineWhatsAppRemindersForRequest);
router.post('/whatsapp/weekly-wins', authorize('admin', 'hr'), sendWeeklyWhatsAppWinsForRequest);
router.post('/whatsapp/weekly-report', authorize('admin', 'hr', 'manager'), sendWeeklyWhatsAppManagerReportsForRequest);

export default router;
