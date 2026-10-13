import { Router } from 'express';
import {
  submitRequest,
  getRequestById,
  provideQuote,
  approveQuote,
  getCustomerRequests,
  getSellerRequests,
} from '../controllers/bespoke.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { verifyCsrf } from '../middleware/csrf.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createBespokeRequestSchema,
  provideQuoteSchema,
} from '../validations/bespoke.validation.js';

const router = Router();

// ==========================================
// BESPOKE GIFT REQUEST ROUTES
// ==========================================
router.post(
  '/',
  authenticate,
  verifyCsrf,
  validate(createBespokeRequestSchema),
  submitRequest
);

router.get('/my-requests', authenticate, getCustomerRequests);
router.get('/seller-requests', authenticate, requireRole('SELLER', 'ADMIN'), getSellerRequests);
router.get('/:id', authenticate, getRequestById);

router.post(
  '/:id/quote',
  authenticate,
  requireRole('SELLER', 'ADMIN'),
  verifyCsrf,
  validate(provideQuoteSchema),
  provideQuote
);

router.post(
  '/:id/approve',
  authenticate,
  verifyCsrf,
  approveQuote
);

export default router;
