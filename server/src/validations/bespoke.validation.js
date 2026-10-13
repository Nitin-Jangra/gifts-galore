import { z } from 'zod';

export const createBespokeRequestSchema = z.object({
  sellerId: z.string().min(1, 'Target seller ID is required'),
  occasion: z.string().min(2, 'Occasion is required (e.g. Wedding, Birthday, Corporate)').max(100).trim(),
  recipientNotes: z.string().max(500).optional().nullable(),
  budgetRange: z.string().min(2, 'Budget range is required (e.g. ₹2,000 - ₹5,000)').max(100),
  targetDate: z.string().datetime().optional().nullable(),
  description: z.string().min(15, 'Please describe your bespoke vision in at least 15 characters').max(2000).trim(),
  referenceImages: z.array(z.string().url().or(z.string().startsWith('/'))).optional().default([]),
  contactPreference: z.enum(['EMAIL', 'PHONE', 'WHATSAPP']).default('EMAIL'),
});

export const provideQuoteSchema = z.object({
  quotedPrice: z.coerce.number().positive('Quoted price must be positive'),
  sellerNotes: z.string().min(5, 'Artisan feasibility notes and lead-time terms are required').max(1000).trim(),
});

export const updateBespokeStatusSchema = z.object({
  status: z.enum(['UNDER_REVIEW', 'REJECTED', 'CANCELLED']),
  sellerNotes: z.string().max(1000).optional(),
});
