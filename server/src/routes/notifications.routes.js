import { Router } from 'express';
import {
  handleWhatsAppReply,
  previewWhatsAppNudges,
  sendWeeklyWhatsAppWinsForRequest,
  sendWhatsAppNudgesForRequest,
} from '../controllers/notifications.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.post('/whatsapp/reply', handleWhatsAppReply);

router.use(authenticate);

router.get('/whatsapp/preview', authorize('admin', 'hr'), previewWhatsAppNudges);
router.post('/whatsapp', authorize('admin', 'hr'), sendWhatsAppNudgesForRequest);
router.post('/whatsapp/weekly-wins', authorize('admin', 'hr'), sendWeeklyWhatsAppWinsForRequest);

export default router;
