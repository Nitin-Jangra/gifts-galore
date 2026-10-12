import { Router } from 'express';
import {
  checkout,
  getOrderById,
  getMyOrders,
  getSellerOrders,
  updateOrderStatus,
} from '../controllers/order.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { verifyCsrf } from '../middleware/csrf.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { checkoutSchema, updateOrderStatusSchema } from '../validations/order.validation.js';

const router = Router();

// ==========================================
// ORDER ENDPOINTS
// ==========================================
router.post('/checkout', authenticate, verifyCsrf, validate(checkoutSchema), checkout);
router.get('/my-orders', authenticate, getMyOrders);
router.get('/seller-orders', authenticate, requireRole('SELLER', 'ADMIN'), getSellerOrders);
router.get('/:id', authenticate, getOrderById);
router.patch(
  '/:id/status',
  authenticate,
  requireRole('SELLER', 'ADMIN'),
  verifyCsrf,
  validate(updateOrderStatusSchema),
  updateOrderStatus
);

export default router;
