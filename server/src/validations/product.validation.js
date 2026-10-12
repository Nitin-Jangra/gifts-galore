import { z } from 'zod';

const productTypeEnum = z.enum(['READY_MADE', 'CUSTOMIZABLE', 'ON_DEMAND']);
const availabilityEnum = z.enum(['IN_STOCK', 'OUT_OF_STOCK', 'MADE_TO_ORDER']);
const productStatusEnum = z.enum(['DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'INACTIVE', 'DELETED']);

export const createProductSchema = z
  .object({
    name: z.string().min(2, 'Product name must be at least 2 characters').max(200).trim(),
    description: z.string().min(10, 'Product description must be at least 10 characters').trim(),
    categoryId: z.string().uuid().optional().nullable(),
    productType: productTypeEnum.default('READY_MADE'),
    price: z.coerce.number().positive('Price must be greater than zero'),
    discountPrice: z.coerce.number().positive().optional().nullable(),
    stockQuantity: z.coerce.number().int().min(0, 'Stock cannot be negative').default(0),
    availability: availabilityEnum.default('IN_STOCK'),
    status: productStatusEnum.default('DRAFT'),
  })
  .refine(
    (data) => {
      // Products must not be marked in stock if inventory is zero, unless explicitly made-to-order
      if (data.stockQuantity === 0 && data.availability === 'IN_STOCK') {
        return false;
      }
      return true;
    },
    {
      message: 'Products cannot be marked IN_STOCK when stock is 0. Choose OUT_OF_STOCK or MADE_TO_ORDER.',
      path: ['availability'],
    }
  );

export const updateProductSchema = z
  .object({
    name: z.string().min(2).max(200).trim().optional(),
    description: z.string().min(10).trim().optional(),
    categoryId: z.string().uuid().optional().nullable(),
    productType: productTypeEnum.optional(),
    price: z.coerce.number().positive().optional(),
    discountPrice: z.coerce.number().positive().optional().nullable(),
    stockQuantity: z.coerce.number().int().min(0).optional(),
    availability: availabilityEnum.optional(),
    status: productStatusEnum.optional(),
  })
  .refine(
    (data) => {
      if (data.stockQuantity === 0 && data.availability === 'IN_STOCK') {
        return false;
      }
      return true;
    },
    {
      message: 'Products cannot be marked IN_STOCK when stock is 0. Choose OUT_OF_STOCK or MADE_TO_ORDER.',
      path: ['availability'],
    }
  );

export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  category: z.string().optional(),
  productType: productTypeEnum.optional(),
  availability: availabilityEnum.optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sellerId: z.string().optional(),
});
