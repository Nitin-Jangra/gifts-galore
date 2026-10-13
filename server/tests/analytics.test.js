import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import analyticsRepository from '../src/repositories/analytics.repository.js';
import userRepository from '../src/repositories/user.repository.js';
import { signToken } from '../src/utils/security.js';

describe('Analytics & Real-Data Dashboard API', () => {
  const seller = {
    id: 'usr_seller_10',
    email: 'seller@giftsgalore.com',
    fullName: 'Loharu Store Manager',
    role: 'SELLER',
    status: 'ACTIVE',
    sellerProfile: { id: 'seller_10', storeName: 'Gifts Galore, Loharu' },
  };

  const customer = {
    id: 'usr_cust_10',
    email: 'customer@gmail.com',
    fullName: 'Customer User',
    role: 'CUSTOMER',
    status: 'ACTIVE',
  };

  const admin = {
    id: 'usr_admin_10',
    email: 'admin@giftsgalore.com',
    fullName: 'Admin Auditor',
    role: 'ADMIN',
    status: 'ACTIVE',
  };

  const sellerToken = signToken({ id: seller.id, email: seller.email, role: seller.role });
  const customerToken = signToken({ id: customer.id, email: customer.email, role: customer.role });
  const adminToken = signToken({ id: admin.id, email: admin.email, role: admin.role });

  beforeEach(() => {
    vi.spyOn(userRepository, 'findById').mockImplementation(async (id) => {
      if (id === seller.id) return seller;
      if (id === customer.id) return customer;
      if (id === admin.id) return admin;
      return null;
    });

    vi.spyOn(analyticsRepository, 'getSellerAnalytics').mockImplementation(async (sellerId) => {
      return {
        summary: {
          totalOrders: 24,
          totalItemsSold: 38,
          grossSales: 45600,
          netRevenue: 45600,
          pendingFulfillmentCount: 5,
          pendingBespokeCount: 2,
        },
        inventoryAlerts: {
          lowStockCount: 3,
          outOfStockCount: 1,
          lowStockList: [{ id: 'p1', name: 'Terracotta Lamp', stockQuantity: 2 }],
          outOfStockList: [{ id: 'p2', name: 'Brass Bell', stockQuantity: 0 }],
        },
        bestPerformingProducts: [
          { productId: 'p1', name: 'Terracotta Lamp', unitsSold: 15, revenue: 18000 },
        ],
      };
    });

    vi.spyOn(analyticsRepository, 'getAdminAnalytics').mockImplementation(async () => {
      return {
        overview: {
          totalCustomers: 120,
          totalSellers: 3,
          totalProducts: 45,
          totalOrders: 68,
        },
        accounts: {
          ACTIVE: 122,
          PENDING: 1,
          SUSPENDED: 0,
          BLOCKED: 0,
        },
        financials: {
          grossOrderValue: 98500,
          discounts: 4500,
          taxes: 0,
          shippingCollected: 1200,
          netRevenue: 95200,
        },
        catalog: {
          totalActive: 42,
          totalDraft: 3,
          byType: { READY_MADE: 25, CUSTOMIZABLE: 15, ON_DEMAND: 5 },
        },
        recentAuditLogs: [],
      };
    });
  });

  it('Seller should fetch seller dashboard analytics with real metrics', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/seller')
      .set('Cookie', [`gg_session=${sellerToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.metrics.summary.totalOrders).toBe(24);
    expect(res.body.data.metrics.summary.grossSales).toBe(45600);
    expect(res.body.data.metrics.inventoryAlerts.lowStockCount).toBe(3);
  });

  it('Customer should be forbidden from accessing seller analytics (403)', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/seller')
      .set('Cookie', [`gg_session=${customerToken}`]);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  it('Admin should fetch platform overview and separated financials', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/admin')
      .set('Cookie', [`gg_session=${adminToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.data.metrics.financials.grossOrderValue).toBe(98500);
    expect(res.body.data.metrics.financials.discounts).toBe(4500);
    expect(res.body.data.metrics.financials.netRevenue).toBe(95200);
    expect(res.body.data.metrics.overview.totalCustomers).toBe(120);
  });

  it('Seller should be forbidden from accessing platform admin analytics (403)', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/admin')
      .set('Cookie', [`gg_session=${sellerToken}`]);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });
});
