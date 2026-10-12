import { z } from 'zod';

const orderItemInputSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1').default(1),
  customizationSnapshot: z.any().optional().nullable(),
});

export const checkoutSchema = z
  .object({
    items: z.array(orderItemInputSchema).min(1, 'Cart must contain at least one item'),
    
    // Direct Gifting Options
    isGift: z.boolean().default(false),
    recipientName: z.string().max(100).optional().nullable(),
    recipientPhone: z.string().max(20).optional().nullable(),
    recipientAddress: z.string().max(500).optional().nullable(),
    giftMessage: z.string().max(500).optional().nullable(),
    deliveryDateRequested: z.string().datetime().optional().nullable(),
    discreetPricingRequested: z.boolean().default(false),

    // Purchaser delivery address if not a gift
    shippingAddress: z.string().max(500).optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.isGift) {
        if (!data.recipientName || data.recipientName.trim().length < 2) return false;
        if (!data.recipientPhone || data.recipientPhone.trim().length < 8) return false;
        if (!data.recipientAddress || data.recipientAddress.trim().length < 10) return false;
      }
      return true;
    },
    {
      message: 'When "Gift this order" is selected, recipient name, phone number, and address are required.',
      path: ['recipientName'],
    }
  );

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'PENDING_PAYMENT',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED',
  ]),
});
