import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import bespokeRepository from '../src/repositories/bespoke.repository.js';
import orderRepository from '../src/repositories/order.repository.js';
import userRepository from '../src/repositories/user.repository.js';
import { signToken } from '../src/utils/security.js';

describe('On-Demand Bespoke Gift Request Workflow', () => {
  const mockBespoke = new Map();

  const customer1 = {
    id: 'usr_cust_1',
    email: 'ananya@customer.com',
    fullName: 'Ananya Sharma',
    role: 'CUSTOMER',
    status: 'ACTIVE',
  };

  const customer2 = {
    id: 'usr_cust_2',
    email: 'rohan@customer.com',
    fullName: 'Rohan Verma',
    role: 'CUSTOMER',
    status: 'ACTIVE',
  };

  const seller1 = {
    id: 'usr_seller_1',
    email: 'loharu@artisan.com',
    fullName: 'Loharu Craft Master',
    role: 'SELLER',
    status: 'ACTIVE',
    sellerProfile: { id: 'seller_loharu_101', storeName: 'Gifts Galore Loharu' },
  };

  const seller2 = {
    id: 'usr_seller_2',
    email: 'other@vendor.com',
    fullName: 'Other Vendor',
    role: 'SELLER',
    status: 'ACTIVE',
    sellerProfile: { id: 'seller_other_999', storeName: 'Other Store' },
  };

  const customer1Token = signToken({ id: customer1.id, email: customer1.email, role: customer1.role });
  const customer2Token = signToken({ id: customer2.id, email: customer2.email, role: customer2.role });
  const seller1Token = signToken({ id: seller1.id, email: seller1.email, role: seller1.role });
  const seller2Token = signToken({ id: seller2.id, email: seller2.email, role: seller2.role });

  beforeEach(() => {
    mockBespoke.clear();

    vi.spyOn(userRepository, 'findById').mockImplementation(async (id) => {
      if (id === customer1.id) return customer1;
      if (id === customer2.id) return customer2;
      if (id === seller1.id) return seller1;
      if (id === seller2.id) return seller2;
      return null;
    });

    vi.spyOn(bespokeRepository, 'create').mockImplementation(async (data) => {
      const item = {
        id: `bespoke_${Date.now()}`,
        ...data,
        status: data.status || 'SUBMITTED',
        quotedPrice: null,
        sellerNotes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockBespoke.set(item.id, item);
      return item;
    });

    vi.spyOn(bespokeRepository, 'findById').mockImplementation(async (id) => {
      return mockBespoke.get(id) || null;
    });

    vi.spyOn(bespokeRepository, 'update').mockImplementation(async (id, data) => {
      const existing = mockBespoke.get(id);
      if (!existing) return null;
      const updated = { ...existing, ...data, updatedAt: new Date() };
      mockBespoke.set(id, updated);
      return updated;
    });

    vi.spyOn(orderRepository, 'createOrder').mockImplementation(async ({ orderData, items }) => {
      return {
        id: `ord_${Date.now()}`,
        ...orderData,
        items,
      };
    });
  });

  const getCsrf = async () => {
    const res = await request(app).get('/api/v1/auth/csrf-token');
    return { token: res.body.csrfToken, cookie: res.headers['set-cookie'] };
  };

  it('Customer should submit a bespoke request (SUBMITTED status)', async () => {
    const { token, cookie } = await getCsrf();

    const res = await request(app)
      .post('/api/v1/bespoke')
      .set('Cookie', [...cookie, `gg_session=${customer1Token}`])
      .set('x-csrf-token', token)
      .send({
        sellerId: 'seller_loharu_101',
        occasion: '25th Wedding Anniversary',
        budgetRange: '₹5,000 - ₹8,000',
        description: 'Need a customized bronze framed family tree with 12 engraved names.',
        recipientNotes: 'Mr. & Mrs. Sharma',
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.request.status).toBe('SUBMITTED');
    expect(res.body.data.request.occasion).toBe('25th Wedding Anniversary');
  });

  it('Assigned seller should provide a quotation (QUOTED status)', async () => {
    const requestId = 'req_quote_test';
    mockBespoke.set(requestId, {
      id: requestId,
      customerId: customer1.id,
      sellerId: 'seller_loharu_101',
      occasion: 'Anniversary',
      budgetRange: '₹5000',
      description: 'Bronze engraved plate.',
      status: 'SUBMITTED',
    });

    const { token, cookie } = await getCsrf();

    const res = await request(app)
      .post(`/api/v1/bespoke/${requestId}/quote`)
      .set('Cookie', [...cookie, `gg_session=${seller1Token}`])
      .set('x-csrf-token', token)
      .send({
        quotedPrice: 6200,
        sellerNotes: 'Feasible with antique bronze finish. Lead time: 5 business days for precision engraving.',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.request.status).toBe('QUOTED');
    expect(res.body.data.request.quotedPrice).toBe(6200);
  });

  it('Rogue seller should be denied from quoting another seller’s request (403)', async () => {
    const requestId = 'req_rogue_test';
    mockBespoke.set(requestId, {
      id: requestId,
      customerId: customer1.id,
      sellerId: 'seller_loharu_101', // Assigned to Seller 1
      status: 'SUBMITTED',
    });

    const { token, cookie } = await getCsrf();

    const res = await request(app)
      .post(`/api/v1/bespoke/${requestId}/quote`)
      .set('Cookie', [...cookie, `gg_session=${seller2Token}`]) // Seller 2
      .set('x-csrf-token', token)
      .send({
        quotedPrice: 3000,
        sellerNotes: 'I will do it cheaper.',
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Only the assigned seller');
  });

  it('Customer approval converts quotation to order (CUSTOMER_APPROVED -> ORDER_CREATED)', async () => {
    const requestId = 'req_approve_test';
    mockBespoke.set(requestId, {
      id: requestId,
      customerId: customer1.id,
      sellerId: 'seller_loharu_101',
      occasion: 'Anniversary',
      description: 'Bronze plate',
      sellerNotes: '5 business days lead time.',
      status: 'QUOTED',
      quotedPrice: 6200,
    });

    const { token, cookie } = await getCsrf();

    const res = await request(app)
      .post(`/api/v1/bespoke/${requestId}/approve`)
      .set('Cookie', [...cookie, `gg_session=${customer1Token}`])
      .set('x-csrf-token', token);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.order).toBeDefined();
    expect(res.body.data.order.netAmount).toBe(6200);
  });

  it('Another customer is forbidden from approving someone else’s quote (403)', async () => {
    const requestId = 'req_foreign_test';
    mockBespoke.set(requestId, {
      id: requestId,
      customerId: customer1.id,
      status: 'QUOTED',
      quotedPrice: 5000,
    });

    const { token, cookie } = await getCsrf();

    const res = await request(app)
      .post(`/api/v1/bespoke/${requestId}/approve`)
      .set('Cookie', [...cookie, `gg_session=${customer2Token}`]) // Customer 2
      .set('x-csrf-token', token);

    expect(res.status).toBe(403);
  });
});
