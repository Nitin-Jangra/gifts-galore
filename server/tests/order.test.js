import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import orderRepository from '../src/repositories/order.repository.js';
import productRepository from '../src/repositories/product.repository.js';
import userRepository from '../src/repositories/user.repository.js';
import { signToken } from '../src/utils/security.js';

describe('Order & Direct Gifting Management API', () => {
  const mockOrders = new Map();
  const mockProducts = new Map();

  const customer1 = {
    id: 'usr_cust_1',
    email: 'ananya@customer.com',
    fullName: 'Ananya Sharma',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    sellerProfile: null,
  };

  const customer2 = {
    id: 'usr_cust_2',
    email: 'rohan@customer.com',
    fullName: 'Rohan Verma',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    sellerProfile: null,
  };

  const seller1 = {
    id: 'usr_seller_1',
    email: 'loharu@seller.com',
    fullName: 'Gifts Galore Manager',
    role: 'SELLER',
    status: 'ACTIVE',
    sellerProfile: { id: 'seller_loharu_101', storeName: 'Gifts Galore, Loharu' },
  };

  const seller2 = {
    id: 'usr_seller_2',
    email: 'jaipur@seller.com',
    fullName: 'Jaipur Crafts Manager',
    role: 'SELLER',
    status: 'ACTIVE',
    sellerProfile: { id: 'seller_jaipur_202', storeName: 'Jaipur Handicrafts' },
  };

  const admin = {
    id: 'usr_admin',
    email: 'admin@giftsgalore.com',
    fullName: 'Admin User',
    role: 'ADMIN',
    status: 'ACTIVE',
    sellerProfile: null,
  };

  const customer1Token = signToken({ id: customer1.id, email: customer1.email, role: customer1.role });
  const customer2Token = signToken({ id: customer2.id, email: customer2.email, role: customer2.role });
  const seller1Token = signToken({ id: seller1.id, email: seller1.email, role: seller1.role });
  const adminToken = signToken({ id: admin.id, email: admin.email, role: admin.role });

  beforeEach(() => {
    mockOrders.clear();
    mockProducts.clear();

    vi.spyOn(userRepository, 'findById').mockImplementation(async (id) => {
      if (id === customer1.id) return customer1;
      if (id === customer2.id) return customer2;
      if (id === seller1.id) return seller1;
      if (id === seller2.id) return seller2;
      if (id === admin.id) return admin;
      return null;
    });

    vi.spyOn(productRepository, 'findById').mockImplementation(async (id) => {
      return mockProducts.get(id) || null;
    });

    vi.spyOn(orderRepository, 'createOrder').mockImplementation(async ({ orderData, items }) => {
      const order = {
        id: `ord_${Date.now()}_${Math.random()}`,
        ...orderData,
        createdAt: new Date(),
        updatedAt: new Date(),
        customer: { id: orderData.customerId, fullName: 'Ananya Sharma', email: 'ananya@customer.com' },
        items: items.map((it, idx) => ({
          id: `item_${Date.now()}_${idx}`,
          ...it,
          product: { id: it.productId, name: 'Product Name', slug: 'product-slug' },
          seller: { id: it.sellerId, storeName: 'Store Name' },
        })),
      };
      mockOrders.set(order.id, order);
      return order;
    });

    vi.spyOn(orderRepository, 'findById').mockImplementation(async (orderId) => {
      return mockOrders.get(orderId) || null;
    });

    vi.spyOn(orderRepository, 'findByCustomerId').mockImplementation(async (customerId) => {
      return Array.from(mockOrders.values()).filter((o) => o.customerId === customerId);
    });

    vi.spyOn(orderRepository, 'findBySellerId').mockImplementation(async (sellerId) => {
      const results = [];
      for (const order of mockOrders.values()) {
        const matches = order.items.filter((i) => i.sellerId === sellerId);
        for (const item of matches) {
          results.push({ ...item, order });
        }
      }
      return results;
    });
  });

  const getCsrf = async () => {
    const res = await request(app).get('/api/v1/auth/csrf-token');
    return { token: res.body.csrfToken, cookie: res.headers['set-cookie'] };
  };

  describe('Direct Gifting & Checkout Validation', () => {
    beforeEach(() => {
      mockProducts.set('prod_1', {
        id: 'prod_1',
        sellerId: 'seller_loharu_101',
        name: 'Brass Diya Box',
        price: 500,
        discountPrice: 450,
        stockQuantity: 10,
        availability: 'IN_STOCK',
        status: 'ACTIVE',
      });
    });

    it('should reject Direct Gifting order if recipient details are missing (400)', async () => {
      const { token, cookie } = await getCsrf();

      const res = await request(app)
        .post('/api/v1/orders/checkout')
        .set('Cookie', [...cookie, `gg_session=${customer1Token}`])
        .set('x-csrf-token', token)
        .send({
          items: [{ productId: 'prod_1', quantity: 1 }],
          isGift: true,
          // Missing recipientName, recipientPhone, recipientAddress!
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should successfully place Direct Gifting order with recipient details & gift message', async () => {
      const { token, cookie } = await getCsrf();

      const res = await request(app)
        .post('/api/v1/orders/checkout')
        .set('Cookie', [...cookie, `gg_session=${customer1Token}`])
        .set('x-csrf-token', token)
        .send({
          items: [
            {
              productId: 'prod_1',
              quantity: 2,
              customizationSnapshot: { fields: [{ label: 'Engraved Name', value: 'Aditya' }] },
            },
          ],
          isGift: true,
          recipientName: 'Vikram Malhotra',
          recipientPhone: '+919876543210',
          recipientAddress: 'House 42, Civil Lines, Loharu, Haryana 127201',
          giftMessage: 'Happy Anniversary Vikram and Priya! Wishing you endless joy.',
          deliveryDateRequested: new Date(Date.now() + 86400000 * 3).toISOString(),
          discreetPricingRequested: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.order.isGift).toBe(true);
      expect(res.body.data.order.recipientName).toBe('Vikram Malhotra');
      expect(res.body.data.order.giftMessage).toContain('Happy Anniversary');
      expect(res.body.data.order.discreetPricingRequested).toBe(true);
      expect(res.body.data.order.items[0].customizationSnapshot).toBeDefined();
    });

    it('should reject checkout if requested quantity exceeds product stock (400)', async () => {
      const { token, cookie } = await getCsrf();

      const res = await request(app)
        .post('/api/v1/orders/checkout')
        .set('Cookie', [...cookie, `gg_session=${customer1Token}`])
        .set('x-csrf-token', token)
        .send({
          items: [{ productId: 'prod_1', quantity: 20 }], // Available is 10!
          isGift: false,
          shippingAddress: 'Direct to Customer Address',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Insufficient stock');
    });
  });

  describe('Multi-Vendor Order Isolation & Authorization', () => {
    let testOrderId;

    beforeEach(() => {
      testOrderId = 'ord_multivendor_test';
      mockOrders.set(testOrderId, {
        id: testOrderId,
        orderNumber: 'GG-123456-789',
        customerId: customer1.id,
        isGift: true,
        recipientName: 'Recipient User',
        status: 'CONFIRMED',
        items: [
          { id: 'item_1', sellerId: 'seller_loharu_101', productId: 'p1', quantity: 1, unitPrice: 450 },
          { id: 'item_2', sellerId: 'seller_jaipur_202', productId: 'p2', quantity: 1, unitPrice: 900 },
        ],
      });
    });

    it('customer 1 can view their own order', async () => {
      const res = await request(app)
        .get(`/api/v1/orders/${testOrderId}`)
        .set('Cookie', [`gg_session=${customer1Token}`]);

      expect(res.status).toBe(200);
      expect(res.body.data.order.id).toBe(testOrderId);
    });

    it('customer 2 is forbidden from viewing customer 1 order (403)', async () => {
      const res = await request(app)
        .get(`/api/v1/orders/${testOrderId}`)
        .set('Cookie', [`gg_session=${customer2Token}`]);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Access denied');
    });

    it('seller 1 querying order only sees items belonging to seller 1', async () => {
      const res = await request(app)
        .get(`/api/v1/orders/${testOrderId}`)
        .set('Cookie', [`gg_session=${seller1Token}`]);

      expect(res.status).toBe(200);
      // Items filtered to only seller 1's items!
      expect(res.body.data.order.items).toHaveLength(1);
      expect(res.body.data.order.items[0].sellerId).toBe('seller_loharu_101');
    });

    it('admin can view full order across all vendors', async () => {
      const res = await request(app)
        .get(`/api/v1/orders/${testOrderId}`)
        .set('Cookie', [`gg_session=${adminToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.data.order.items).toHaveLength(2);
    });
  });
});
