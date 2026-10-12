import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  registerCustomer,
  registerSeller,
  login,
  logout,
  getMe,
} from '../controllers/auth.controller.js';
import { provideCsrfToken, verifyCsrf } from '../middleware/csrf.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  registerCustomerSchema,
  registerSellerSchema,
  loginSchema,
} from '../validations/auth.validation.js';

const router = Router();

// Stricter rate limiter for authentication endpoints (prevent brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 30, // 30 attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
});

// CSRF Token Bootstrap Endpoint
router.get('/csrf-token', provideCsrfToken);

// Public Auth Endpoints (Protected by Rate Limiter & CSRF verification)
router.post(
  '/register',
  authLimiter,
  verifyCsrf,
  validate(registerCustomerSchema),
  registerCustomer
);

router.post(
  '/register-seller',
  authLimiter,
  verifyCsrf,
  validate(registerSellerSchema),
  registerSeller
);

router.post(
  '/login',
  authLimiter,
  verifyCsrf,
  validate(loginSchema),
  login
);

// Protected Auth Endpoints
router.post('/logout', verifyCsrf, logout);
router.get('/me', authenticate, getMe);

export default router;
