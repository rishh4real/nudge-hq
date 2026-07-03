import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';

const toPositiveNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const defaultAllowedOrigins = [
  'http://127.0.0.1:5173',
  'http://localhost:5173',
];

const getAllowedOrigins = () => {
  const configuredOrigins = String(process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const clientUrl = String(process.env.CLIENT_URL || '').trim();

  return [...new Set([
    ...defaultAllowedOrigins,
    ...(clientUrl ? [clientUrl] : []),
    ...configuredOrigins,
  ])];
};

export const apiSecurityHeaders = helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
});

export const apiCors = cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    const allowedOrigins = getAllowedOrigins();
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS policy.'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type'],
});

const createLimiter = ({ windowMs, max, message }) => rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message,
  },
});

export const generalApiLimiter = createLimiter({
  windowMs: toPositiveNumber(process.env.GENERAL_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  max: toPositiveNumber(process.env.GENERAL_RATE_LIMIT_MAX, 300),
  message: 'Too many API requests. Please slow down and try again shortly.',
});

export const authRateLimiter = createLimiter({
  windowMs: toPositiveNumber(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  max: toPositiveNumber(process.env.AUTH_RATE_LIMIT_MAX, 20),
  message: 'Too many authentication attempts. Please wait a few minutes and try again.',
});

export const aiRateLimiter = createLimiter({
  windowMs: toPositiveNumber(process.env.AI_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  max: toPositiveNumber(process.env.AI_RATE_LIMIT_MAX, 60),
  message: 'NudgeAI is receiving too many requests right now. Please try again in a moment.',
});

export const contactRateLimiter = createLimiter({
  windowMs: toPositiveNumber(process.env.CONTACT_RATE_LIMIT_WINDOW_MS, 60 * 60 * 1000),
  max: toPositiveNumber(process.env.CONTACT_RATE_LIMIT_MAX, 10),
  message: 'Too many contact requests sent from this connection. Please try again later.',
});

export const notificationRateLimiter = createLimiter({
  windowMs: toPositiveNumber(process.env.NOTIFY_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  max: toPositiveNumber(process.env.NOTIFY_RATE_LIMIT_MAX, 40),
  message: 'Too many notification actions triggered. Please wait and retry.',
});

export const requestBodyLimit = process.env.REQUEST_BODY_LIMIT || '200kb';

