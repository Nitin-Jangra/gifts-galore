import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import { requireRole, requireSellerOwnership } from '../src/middleware/auth.middleware.js';

describe('RBAC & Multi-Vendor Ownership Middleware', () => {
  const app = express();
  app.use(express.json());

  // Dummy protected routes
  app.get('/api/admin-only', (req, res, next) => {
    // Inject simulated authenticated user from header
    const role = req.headers['x-simulated-role'] || 'CUSTOMER';
    req.user = { id: 'usr-1', role };
    next();
  }, requireRole('ADMIN'), (req, res) => {
    res.json({ message: 'Welcome Admin' });
  });

  app.put('/api/seller-resource/:sellerId', (req, res, next) => {
    const role = req.headers['x-simulated-role'] || 'CUSTOMER';
    const sellerId = req.headers['x-simulated-seller-id'];
    req.user = {
      id: 'usr-2',
      role,
      sellerProfile: sellerId ? { id: sellerId } : null,
    };
    next();
  }, requireSellerOwnership(), (req, res) => {
    res.json({ message: 'Resource updated' });
  });

  it('requireRole should permit ADMIN and reject CUSTOMER with 403', async () => {
    const adminRes = await request(app)
      .get('/api/admin-only')
      .set('x-simulated-role', 'ADMIN');
    expect(adminRes.status).toBe(200);
    expect(adminRes.body.message).toBe('Welcome Admin');

    const customerRes = await request(app)
      .get('/api/admin-only')
      .set('x-simulated-role', 'CUSTOMER');
    expect(customerRes.status).toBe(403);
    expect(customerRes.body.code).toBe('FORBIDDEN');
  });

  it('requireSellerOwnership should allow owner seller and reject cross-seller mutation', async () => {
    // Seller 1 accessing Seller 1's resource
    const ownerRes = await request(app)
      .put('/api/seller-resource/seller-123')
      .set('x-simulated-role', 'SELLER')
      .set('x-simulated-seller-id', 'seller-123');
    expect(ownerRes.status).toBe(200);

    // Seller 2 attempting to modify Seller 1's resource
    const rogueRes = await request(app)
      .put('/api/seller-resource/seller-123')
      .set('x-simulated-role', 'SELLER')
      .set('x-simulated-seller-id', 'seller-999');
    expect(rogueRes.status).toBe(403);
    expect(rogueRes.body.code).toBe('OWNERSHIP_VIOLATION');
  });

  it('requireSellerOwnership should permit ADMIN override for moderation', async () => {
    const adminRes = await request(app)
      .put('/api/seller-resource/seller-123')
      .set('x-simulated-role', 'ADMIN');
    expect(adminRes.status).toBe(200);
  });
});
