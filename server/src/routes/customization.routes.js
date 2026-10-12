import { Router } from 'express';
import {
  getFieldsForProduct,
  createCustomField,
  updateCustomField,
  deleteCustomField,
  validatePersonalization,
} from '../controllers/customization.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { verifyCsrf } from '../middleware/csrf.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  createCustomFieldSchema,
  updateCustomFieldSchema,
} from '../validations/customization.validation.js';

const router = Router();

// ==========================================
// PUBLIC CUSTOMIZATION ENDPOINTS
// ==========================================
router.get('/products/:productId/custom-fields', getFieldsForProduct);
router.post('/products/:productId/validate-customization', validatePersonalization);

// ==========================================
// SELLER CUSTOM FIELD MANAGEMENT
// ==========================================
router.post(
  '/products/:productId/custom-fields',
  authenticate,
  requireRole('SELLER', 'ADMIN'),
  verifyCsrf,
  validate(createCustomFieldSchema),
  createCustomField
);

router.put(
  '/custom-fields/:fieldId',
  authenticate,
  requireRole('SELLER', 'ADMIN'),
  verifyCsrf,
  validate(updateCustomFieldSchema),
  updateCustomField
);

router.delete(
  '/custom-fields/:fieldId',
  authenticate,
  requireRole('SELLER', 'ADMIN'),
  verifyCsrf,
  deleteCustomField
);

export default router;
