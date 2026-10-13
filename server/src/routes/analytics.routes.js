import { Router } from 'express';
import {
  getSellerDashboard,
  getAdminDashboard,
} from '../controllers/analytics.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/seller', authenticate, requireRole('SELLER', 'ADMIN'), getSellerDashboard);
router.get('/admin', authenticate, requireRole('ADMIN'), getAdminDashboard);

export default router;
