import { z } from 'zod';

const fieldTypeEnum = z.enum(['TEXT', 'TEXTAREA', 'IMAGE_UPLOAD', 'SELECT', 'COLOR']);

export const createCustomFieldSchema = z.object({
  label: z.string().min(2, 'Field label must be at least 2 characters').max(100).trim(),
  instructions: z.string().max(500).optional(),
  fieldType: fieldTypeEnum.default('TEXT'),
  isRequired: z.boolean().default(false),
  maxLength: z.coerce.number().int().positive().optional().nullable(),
  maxFileSizeMb: z.coerce.number().int().min(1).max(15).default(5),
  allowedFileTypes: z.string().optional().default('image/jpeg,image/png,image/webp'),
  optionsJson: z.array(z.string().min(1)).optional().nullable(),
  displayOrder: z.coerce.number().int().default(0),
});

export const updateCustomFieldSchema = createCustomFieldSchema.partial();
