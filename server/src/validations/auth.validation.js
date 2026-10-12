import { z } from 'zod';

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,72}$/;

export const registerCustomerSchema = z.object({
  email: z.string().email('Invalid email address').max(255).toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(72, 'Password cannot exceed 72 characters')
    .regex(
      passwordPattern,
      'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100).trim(),
  phone: z.string().max(20).optional(),
});

export const registerSellerSchema = registerCustomerSchema.extend({
  storeName: z.string().min(2, 'Store name must be at least 2 characters').max(100).trim(),
  description: z.string().max(1000).optional(),
  city: z.string().min(2).max(100).default('Loharu'),
  state: z.string().min(2).max(100).default('Haryana'),
  contactPhone: z.string().max(20).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).trim().optional(),
  phone: z.string().max(20).optional(),
});
