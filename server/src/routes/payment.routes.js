import { Router } from 'express';
import { createOrder, verifyPayment } from '../controllers/payment.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.use(authorize('admin'));

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);

export default router;
