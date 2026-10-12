import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import productRepository from '../src/repositories/product.repository.js';
import userRepository from '../src/repositories/user.repository.js';
import { signToken } from '../src/utils/security.js';

describe('Multi-Vendor Catalog & Product Management API', () => {
  const mockProducts = new Map();

  const seller1 = {
    id: 'usr_seller_1',
    email: 'seller1@giftsgalore.com',
    fullName: 'Loharu Crafts Owner',
    role: 'SELLER',
    status: 'ACTIVE',
    sellerProfile: { id: 'seller_loharu_1', storeName: 'Gifts Galore Loharu' },
  };

  const seller2 = {
    id: 'usr_seller_2',
    email: 'seller2@competitor.com',
    fullName: 'Other Vendor',
    role: 'SELLER',
    status: 'ACTIVE',
    sellerProfile: { id: 'seller_other_2', storeName: 'Other Vendor Store' },
  };

  const admin = {
    id: 'usr_admin_1',
    email: 'admin@giftsgalore.com',
    fullName: 'Platform Admin',
    role: 'ADMIN',
    status: 'ACTIVE',
    sellerProfile: null,
  };

  const seller1Token = signToken({ id: seller1.id, email: seller1.email, role: seller1.role });
  const seller2Token = signToken({ id: seller2.id, email: seller2.email, role: seller2.role });
  const adminToken = signToken({ id: admin.id, email: admin.email, role: admin.role });

  beforeEach(() => {
    mockProducts.clear();

    vi.spyOn(userRepository, 'findById').mockImplementation(async (id) => {
      if (id === seller1.id) return seller1;
      if (id === seller2.id) return seller2;
      if (id === admin.id) return admin;
      return null;
    });

    vi.spyOn(productRepository, 'findAll').mockImplementation(async (filters, { skip, take }) => {
      let list = Array.from(mockProducts.values()).filter((p) => p.status !== 'DELETED');
      if (filters.productType) {
        list = list.filter((p) => p.productType === filters.productType);
      }
      return {
        total: list.length,
        products: list.slice(skip, skip + take),
      };
    });

    vi.spyOn(productRepository, 'findBySlug').mockImplementation(async (slug) => {
      for (const p of mockProducts.values()) {
        if (p.slug === slug && p.status !== 'DELETED') return p;
      }
      return null;
    });

    vi.spyOn(productRepository, 'findById').mockImplementation(async (id) => {
      return mockProducts.get(id) || null;
    });

    vi.spyOn(productRepository, 'create').mockImplementation(async (data) => {
      const product = {
        id: `prod_${Date.now()}_${Math.random()}`,
        ...data,
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockProducts.set(product.id, product);
      return product;
    });

    vi.spyOn(productRepository, 'update').mockImplementation(async (id, data) => {
      const existing = mockProducts.get(id);
      if (!existing) return null;
      const updated = { ...existing, ...data, updatedAt: new Date() };
      mockProducts.set(id, updated);
      return updated;
    });

    vi.spyOn(productRepository, 'softDelete').mockImplementation(async (id) => {
      const existing = mockProducts.get(id);
      if (existing) {
        existing.status = 'DELETED';
      }
      return existing;
    });

    vi.spyOn(productRepository, 'addImage').mockImplementation(async (productId, imageUrl, isPrimary, displayOrder) => {
      const img = {
        id: `img_${Date.now()}`,
        productId,
        imageUrl,
        isPrimary,
        displayOrder,
      };
      const p = mockProducts.get(productId);
      if (p) p.images.push(img);
      return img;
    });
  });

  // Helper to obtain CSRF tokens
  const getCsrf = async () => {
    const res = await request(app).get('/api/v1/auth/csrf-token');
    return { token: res.body.csrfToken, cookie: res.headers['set-cookie'] };
  };

  describe('Public Catalog Exploration', () => {
    it('GET /api/v1/products should return list of active products with pagination', async () => {
      mockProducts.set('p1', {
        id: 'p1',
        name: 'Handcrafted Terracotta Mug',
        slug: 'handcrafted-terracotta-mug',
        description: 'Traditional earthen mug with smooth glazed lip.',
        productType: 'READY_MADE',
        price: 499.0,
        stockQuantity: 15,
        availability: 'IN_STOCK',
        status: 'ACTIVE',
        images: [],
      });

      const res = await request(app).get('/api/v1/products');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.products).toHaveLength(1);
      expect(res.body.data.pagination.total).toBe(1);
    });

    it('GET /api/v1/products/:slug should return product details', async () => {
      mockProducts.set('p2', {
        id: 'p2',
        name: 'Personalized Wooden Photo Frame',
        slug: 'personalized-wooden-photo-frame',
        description: 'Engraved teak wood photo frame.',
        productType: 'CUSTOMIZABLE',
        price: 899.0,
        stockQuantity: 5,
        availability: 'IN_STOCK',
        status: 'ACTIVE',
        images: [],
      });

      const res = await request(app).get('/api/v1/products/personalized-wooden-photo-frame');
      expect(res.status).toBe(200);
      expect(res.body.data.product.name).toBe('Personalized Wooden Photo Frame');
    });

    it('GET /api/v1/products/non-existent-slug should return 404', async () => {
      const res = await request(app).get('/api/v1/products/non-existent-slug');
      expect(res.status).toBe(404);
      expect(res.body.message).toContain('not found');
    });
  });

  describe('Product Creation & Inventory Rules', () => {
    it('should reject product creation when stock is 0 and availability is IN_STOCK (400)', async () => {
      const { token, cookie } = await getCsrf();

      const res = await request(app)
        .post('/api/v1/products')
        .set('Cookie', [...cookie, `gg_session=${seller1Token}`])
        .set('x-csrf-token', token)
        .send({
          name: 'Zero Stock Item',
          description: 'A product that has no stock on hand.',
          productType: 'READY_MADE',
          price: 199.0,
          stockQuantity: 0,
          availability: 'IN_STOCK', // Invalid combination!
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should permit product creation when stock is 0 but availability is MADE_TO_ORDER', async () => {
      const { token, cookie } = await getCsrf();

      const res = await request(app)
        .post('/api/v1/products')
        .set('Cookie', [...cookie, `gg_session=${seller1Token}`])
        .set('x-csrf-token', token)
        .send({
          name: 'Hand-carved Temple Miniature',
          description: 'Bespoke hand-carved sculpture created upon confirmed order.',
          productType: 'ON_DEMAND',
          price: 3499.0,
          stockQuantity: 0,
          availability: 'MADE_TO_ORDER',
          status: 'ACTIVE',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.product.name).toBe('Hand-carved Temple Miniature');
      expect(res.body.data.product.sellerId).toBe('seller_loharu_1');
    });
  });

  describe('Multi-Vendor Ownership Enforcement', () => {
    let ownedProductId;

    beforeEach(() => {
      ownedProductId = 'prod_owned_by_seller1';
      mockProducts.set(ownedProductId, {
        id: ownedProductId,
        sellerId: 'seller_loharu_1',
        name: 'Gifts Galore Exclusive Gift Box',
        slug: 'gifts-galore-exclusive-gift-box',
        description: 'Curated premium dry fruit and bronze diya hamper.',
        productType: 'READY_MADE',
        price: 1299.0,
        stockQuantity: 20,
        availability: 'IN_STOCK',
        status: 'ACTIVE',
        images: [],
      });
    });

    it('should permit owner seller to update their own product', async () => {
      const { token, cookie } = await getCsrf();

      const res = await request(app)
        .put(`/api/v1/products/${ownedProductId}`)
        .set('Cookie', [...cookie, `gg_session=${seller1Token}`])
        .set('x-csrf-token', token)
        .send({
          price: 1399.0,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.product.price).toBe(1399.0);
    });

    it('should reject rogue seller trying to modify another vendor’s product with 403 Forbidden', async () => {
      const { token, cookie } = await getCsrf();

      const res = await request(app)
        .put(`/api/v1/products/${ownedProductId}`)
        .set('Cookie', [...cookie, `gg_session=${seller2Token}`]) // Seller 2
        .set('x-csrf-token', token)
        .send({
          price: 9.99,
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('another vendor');
    });

    it('should permit platform ADMIN to update any product for governance', async () => {
      const { token, cookie } = await getCsrf();

      const res = await request(app)
        .put(`/api/v1/products/${ownedProductId}`)
        .set('Cookie', [...cookie, `gg_session=${adminToken}`]) // Admin
        .set('x-csrf-token', token)
        .send({
          name: 'Platform Moderated Gift Box',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.product.name).toBe('Platform Moderated Gift Box');
    });

    it('should soft delete product when removed by seller', async () => {
      const { token, cookie } = await getCsrf();

      const res = await request(app)
        .delete(`/api/v1/products/${ownedProductId}`)
        .set('Cookie', [...cookie, `gg_session=${seller1Token}`])
        .set('x-csrf-token', token);

      expect(res.status).toBe(200);
      const productInDb = mockProducts.get(ownedProductId);
      expect(productInDb.status).toBe('DELETED');
    });
  });

  describe('Media Upload Validation', () => {
    it('should reject non-image file uploads with 400 Bad Request', async () => {
      const { token, cookie } = await getCsrf();

      const res = await request(app)
        .post('/api/v1/products/p1/images')
        .set('Cookie', [...cookie, `gg_session=${seller1Token}`])
        .set('x-csrf-token', token)
        .attach('image', Buffer.from('malicious content'), 'malware.exe');

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Invalid file type');
    });

    it('should upload valid image buffer and return secure randomized image record', async () => {
      const productId = 'prod_for_upload';
      mockProducts.set(productId, {
        id: productId,
        sellerId: 'seller_loharu_1',
        name: 'Product with Image',
        slug: 'product-with-image',
        images: [],
      });

      const { token, cookie } = await getCsrf();

      // Send 1x1 dummy PNG buffer
      const pngBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        'base64'
      );

      const res = await request(app)
        .post(`/api/v1/products/${productId}/images`)
        .set('Cookie', [...cookie, `gg_session=${seller1Token}`])
        .set('x-csrf-token', token)
        .attach('image', pngBuffer, 'test-gift.png');

      expect(res.status).toBe(201);
      expect(res.body.data.image.imageUrl).toContain('products/');
      expect(res.body.data.image.imageUrl).toMatch(/\.(png|webp|jpg)$/);
    });
  });
});
