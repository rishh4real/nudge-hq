import { Router } from 'express';
import { signup, companySignup, login, getProfile } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

// Public routes
router.post('/signup', validateBody(['name', 'email', 'password']), signup);
router.post('/company-signup', validateBody(['company_name', 'admin_name', 'email', 'password']), companySignup);
router.post('/login', validateBody(['email', 'password']), login);

// Protected routes
router.get('/me', authenticate, getProfile);

export default router;
