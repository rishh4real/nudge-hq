import { Router } from 'express';
import { createOrder, verifyPayment, activateTrial } from '../controllers/payment.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.use(authorize('admin'));

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.post('/activate-trial', activateTrial);

export default router;
