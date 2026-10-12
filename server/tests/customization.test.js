import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import productRepository from '../src/repositories/product.repository.js';
import customizationRepository from '../src/repositories/customization.repository.js';
import userRepository from '../src/repositories/user.repository.js';
import { signToken } from '../src/utils/security.js';

describe('Product Customization Engine & Personalization Snapshot', () => {
  const mockProducts = new Map();
  const mockFields = new Map();

  const seller1 = {
    id: 'usr_seller_1',
    email: 'seller1@giftsgalore.com',
    fullName: 'Loharu Artisan',
    role: 'SELLER',
    status: 'ACTIVE',
    sellerProfile: { id: 'seller_101', storeName: 'Gifts Galore Loharu' },
  };

  const seller2 = {
    id: 'usr_seller_2',
    email: 'seller2@competitor.com',
    fullName: 'Other Artisan',
    role: 'SELLER',
    status: 'ACTIVE',
    sellerProfile: { id: 'seller_202', storeName: 'Other Vendor' },
  };

  const seller1Token = signToken({ id: seller1.id, email: seller1.email, role: seller1.role });
  const seller2Token = signToken({ id: seller2.id, email: seller2.email, role: seller2.role });

  beforeEach(() => {
    mockProducts.clear();
    mockFields.clear();

    vi.spyOn(userRepository, 'findById').mockImplementation(async (id) => {
      if (id === seller1.id) return seller1;
      if (id === seller2.id) return seller2;
      return null;
    });

    vi.spyOn(productRepository, 'findById').mockImplementation(async (id) => {
      return mockProducts.get(id) || null;
    });

    vi.spyOn(customizationRepository, 'findByProductId').mockImplementation(async (productId) => {
      return Array.from(mockFields.values()).filter((f) => f.productId === productId);
    });

    vi.spyOn(customizationRepository, 'findById').mockImplementation(async (fieldId) => {
      const field = mockFields.get(fieldId);
      if (!field) return null;
      return { ...field, product: mockProducts.get(field.productId) };
    });

    vi.spyOn(customizationRepository, 'create').mockImplementation(async (productId, data) => {
      const field = {
        id: `fld_${Date.now()}_${Math.random()}`,
        productId,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockFields.set(field.id, field);
      return field;
    });

    vi.spyOn(customizationRepository, 'update').mockImplementation(async (fieldId, data) => {
      const existing = mockFields.get(fieldId);
      if (!existing) return null;
      const updated = { ...existing, ...data, updatedAt: new Date() };
      mockFields.set(fieldId, updated);
      return updated;
    });

    vi.spyOn(customizationRepository, 'delete').mockImplementation(async (fieldId) => {
      const existing = mockFields.get(fieldId);
      if (existing) mockFields.delete(fieldId);
      return existing;
    });
  });

  const getCsrf = async () => {
    const res = await request(app).get('/api/v1/auth/csrf-token');
    return { token: res.body.csrfToken, cookie: res.headers['set-cookie'] };
  };

  describe('Seller Configuration of Custom Fields', () => {
    beforeEach(() => {
      mockProducts.set('prod_custom_1', {
        id: 'prod_custom_1',
        sellerId: 'seller_101',
        name: 'Personalized Wooden Plaque',
        productType: 'CUSTOMIZABLE',
      });

      mockProducts.set('prod_readymade_1', {
        id: 'prod_readymade_1',
        sellerId: 'seller_101',
        name: 'Ready-Made Coffee Mug',
        productType: 'READY_MADE',
      });
    });

    it('should allow seller to define custom text field for customizable product', async () => {
      const { token, cookie } = await getCsrf();

      const res = await request(app)
        .post('/api/v1/products/prod_custom_1/custom-fields')
        .set('Cookie', [...cookie, `gg_session=${seller1Token}`])
        .set('x-csrf-token', token)
        .send({
          label: 'Recipient Name to Engrave',
          instructions: 'Enter name (max 25 characters)',
          fieldType: 'TEXT',
          isRequired: true,
          maxLength: 25,
          displayOrder: 1,
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.field.label).toBe('Recipient Name to Engrave');
      expect(res.body.data.field.isRequired).toBe(true);
      expect(res.body.data.field.maxLength).toBe(25);
    });

    it('should reject adding customization fields to non-customizable products (400)', async () => {
      const { token, cookie } = await getCsrf();

      const res = await request(app)
        .post('/api/v1/products/prod_readymade_1/custom-fields')
        .set('Cookie', [...cookie, `gg_session=${seller1Token}`])
        .set('x-csrf-token', token)
        .send({
          label: 'Custom Text',
          fieldType: 'TEXT',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('only be configured for CUSTOMIZABLE');
    });

    it('should reject another vendor trying to configure fields on foreign product (403)', async () => {
      const { token, cookie } = await getCsrf();

      const res = await request(app)
        .post('/api/v1/products/prod_custom_1/custom-fields')
        .set('Cookie', [...cookie, `gg_session=${seller2Token}`]) // Seller 2
        .set('x-csrf-token', token)
        .send({
          label: 'Rogue Custom Field',
          fieldType: 'TEXT',
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('another vendor');
    });
  });

  describe('Customer Personalization Validation & Snapshot Generation', () => {
    beforeEach(() => {
      const productId = 'prod_custom_box';
      mockProducts.set(productId, {
        id: productId,
        sellerId: 'seller_101',
        name: 'Monogrammed Jewelry Box',
        productType: 'CUSTOMIZABLE',
      });

      mockFields.set('fld_name', {
        id: 'fld_name',
        productId,
        label: 'Monogram Initials',
        fieldType: 'TEXT',
        isRequired: true,
        maxLength: 3,
      });

      mockFields.set('fld_font', {
        id: 'fld_font',
        productId,
        label: 'Engraving Font Style',
        fieldType: 'SELECT',
        isRequired: false,
        optionsJson: ['Classic Serif', 'Modern Sans', 'Royal Script'],
      });
    });

    it('should reject submission when required personalization field is missing (400)', async () => {
      const res = await request(app)
        .post('/api/v1/products/prod_custom_box/validate-customization')
        .send({
          personalization: {
            fld_font: 'Classic Serif',
            // Missing fld_name!
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Monogram Initials');
      expect(res.body.message).toContain('is required');
    });

    it('should reject input when length exceeds maxLength constraint (400)', async () => {
      const res = await request(app)
        .post('/api/v1/products/prod_custom_box/validate-customization')
        .send({
          personalization: {
            fld_name: 'ABCD', // max is 3!
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('exceeds maximum allowable length');
    });

    it('should reject input when SELECT option is not in allowed choices (400)', async () => {
      const res = await request(app)
        .post('/api/v1/products/prod_custom_box/validate-customization')
        .send({
          personalization: {
            fld_name: 'AJ',
            fld_font: 'Comic Sans', // Not allowed!
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('not a valid option');
    });

    it('should generate an immutable personalization snapshot upon valid submission', async () => {
      const res = await request(app)
        .post('/api/v1/products/prod_custom_box/validate-customization')
        .send({
          personalization: {
            fld_name: 'NJ',
            fld_font: 'Royal Script',
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.snapshot).toHaveProperty('capturedAt');
      expect(res.body.data.snapshot.productName).toBe('Monogrammed Jewelry Box');
      expect(res.body.data.snapshot.fields).toHaveLength(2);
      expect(res.body.data.snapshot.fields[0]).toMatchObject({
        label: 'Monogram Initials',
        value: 'NJ',
      });
      expect(res.body.data.snapshot.fields[1]).toMatchObject({
        label: 'Engraving Font Style',
        value: 'Royal Script',
      });
    });
  });
});
