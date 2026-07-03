import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import morgan from 'morgan';
import cron from 'node-cron';

// Import Routes
import authRoutes from './routes/auth.routes.js';
import employeeRoutes from './routes/employee.routes.js';
import taskRoutes from './routes/task.routes.js';
import adminRoutes from './routes/admin.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import aiRoutes from './routes/ai.routes.js';
import focusRoutes from './routes/focus.routes.js';
import checkinRoutes from './routes/checkin.routes.js';
import deepworkRoutes from './routes/deepwork.routes.js';
import reportRoutes from './routes/report.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import contactRoutes from './routes/contact.routes.js';
import nudgeSpaceRoutes from './routes/nudgespace.routes.js';
import notificationRoutes from './routes/notifications.routes.js';
import {
  sendDeadlineWhatsAppReminders,
  sendPendingWhatsAppNudges,
  sendWeeklyWhatsAppManagerReports,
  sendWeeklyWhatsAppWins,
} from './controllers/notifications.controller.js';
import {
  aiRateLimiter,
  apiCors,
  apiSecurityHeaders,
  authRateLimiter,
  contactRateLimiter,
  generalApiLimiter,
  notificationRateLimiter,
  requestBodyLimit,
} from './middleware/security.js';

const app = express();
const PORT = process.env.PORT || 5000;
const TRUST_PROXY = process.env.TRUST_PROXY;

// Global Middleware
app.disable('x-powered-by');
if (TRUST_PROXY && TRUST_PROXY !== '0' && TRUST_PROXY !== 'false') {
  app.set('trust proxy', TRUST_PROXY === 'true' ? 1 : TRUST_PROXY);
}
app.use(apiSecurityHeaders);
app.use(apiCors);
app.use(express.json({ limit: requestBodyLimit }));
app.use(express.urlencoded({ extended: false, limit: requestBodyLimit }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/api', generalApiLimiter);

// API Routing Mountpoints
app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRateLimiter, aiRoutes);
app.use('/api/focus', focusRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/deepwork', deepworkRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/contact', contactRateLimiter, contactRoutes);
app.use('/api/nudgespace', nudgeSpaceRoutes);
app.use('/api/notify', notificationRateLimiter, notificationRoutes);

// Base Health Check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Root route handler
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the NudgeHQ workforce progress SaaS platform API.',
    docs: 'Endpoints are scoped under /api'
  });
});

// Fallback Route Handler (404 Not Found)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: [${req.method}] ${req.originalUrl}`
  });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  if (err?.message === 'Origin not allowed by CORS policy.') {
    return res.status(403).json({
      success: false,
      message: err.message,
    });
  }
  res.status(err.status || 500).json({
    success: false,
    message: 'An internal server error occurred.',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// Start listening for traffic
const server = app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(` NudgeHQ Backend running on port ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Health: http://localhost:${PORT}/health`);
  console.log(`========================================`);
});

server.headersTimeout = 65 * 1000;
server.requestTimeout = 60 * 1000;

cron.schedule('0 17 * * *', async () => {
  try {
    const result = await sendPendingWhatsAppNudges();
    console.log(`WhatsApp daily nudge cron completed: ${result.sent} sent, ${result.skipped} skipped, ${result.failed} failed.`);
  } catch (error) {
    console.error('WhatsApp daily nudge cron failed:', error.message);
  }
}, {
  timezone: 'Asia/Kolkata',
});

cron.schedule('0 10 * * *', async () => {
  try {
    const result = await sendDeadlineWhatsAppReminders();
    console.log(`WhatsApp deadline reminder cron completed: ${result.sent} sent, ${result.skipped} skipped, ${result.failed} failed.`);
  } catch (error) {
    console.error('WhatsApp deadline reminder cron failed:', error.message);
  }
}, {
  timezone: 'Asia/Kolkata',
});

cron.schedule('0 18 * * 5', async () => {
  try {
    const result = await sendWeeklyWhatsAppWins();
    console.log(`WhatsApp weekly wins cron completed: ${result.sent} sent, ${result.failed} failed.`);
  } catch (error) {
    console.error('WhatsApp weekly wins cron failed:', error.message);
  }
}, {
  timezone: 'Asia/Kolkata',
});

cron.schedule('30 18 * * 5', async () => {
  try {
    const result = await sendWeeklyWhatsAppManagerReports();
    console.log(`WhatsApp weekly manager report cron completed: ${result.sent} sent, ${result.skipped} skipped, ${result.failed} failed.`);
  } catch (error) {
    console.error('WhatsApp weekly manager report cron failed:', error.message);
  }
}, {
  timezone: 'Asia/Kolkata',
});

export default app;
