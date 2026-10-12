import { Router } from 'express';
import {
  listProducts,
  getProductBySlug,
  listCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} from '../controllers/product.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';
import { verifyCsrf } from '../middleware/csrf.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { uploadSingleImage } from '../middleware/upload.middleware.js';
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from '../validations/product.validation.js';

const router = Router();

// ==========================================
// PUBLIC STOREFRONT ENDPOINTS
// ==========================================
router.get('/', validate(productQuerySchema, 'query'), listProducts);
router.get('/categories', listCategories);
router.get('/:slug', getProductBySlug);

// ==========================================
// PROTECTED SELLER & ADMIN MUTATION ROUTES
// ==========================================
router.post(
  '/',
  authenticate,
  requireRole('SELLER', 'ADMIN'),
  verifyCsrf,
  validate(createProductSchema),
  createProduct
);

router.put(
  '/:id',
  authenticate,
  requireRole('SELLER', 'ADMIN'),
  verifyCsrf,
  validate(updateProductSchema),
  updateProduct
);

router.delete(
  '/:id',
  authenticate,
  requireRole('SELLER', 'ADMIN'),
  verifyCsrf,
  deleteProduct
);

router.post(
  '/:id/images',
  authenticate,
  requireRole('SELLER', 'ADMIN'),
  verifyCsrf,
  uploadSingleImage,
  uploadProductImage
);

export default router;
