import Router from 'express';
import {
  signup,
  companySignup,
  login,
  getProfile,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getInviteStatus,
  acceptInvite,
  getInviteLinkStatus,
  joinByInviteCode,
  completeOnboarding,
  googleOAuthUrl,
  googleOAuthCallback
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

const router = Router();

// Public onboarding routes
router.post('/signup', validateBody(['name', 'email', 'password']), signup);
router.post('/company-signup', validateBody(['company_name', 'admin_name', 'email', 'password']), companySignup);
router.post('/login', validateBody(['email', 'password']), login);
router.get('/oauth/google/url', googleOAuthUrl);
router.post('/oauth/google/callback', validateBody(['code']), googleOAuthCallback);

// Email verification & reset password routes
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', validateBody(['email']), resendVerification);
router.post('/forgot-password', validateBody(['email']), forgotPassword);
router.post('/reset-password', validateBody(['token', 'newPassword']), resetPassword);

// Employee invitation acceptance routes
router.get('/invite-status', getInviteStatus);
router.post('/accept-invite', validateBody(['token', 'name', 'password']), acceptInvite);
router.post('/set-password', validateBody(['token', 'name', 'password']), acceptInvite);
router.get('/join-status', getInviteLinkStatus);
router.post('/join', validateBody(['code', 'name', 'email', 'password']), joinByInviteCode);
router.post('/onboarding/complete', authenticate, completeOnboarding);

// Protected profile routes
router.get('/me', authenticate, getProfile);

export default router;
