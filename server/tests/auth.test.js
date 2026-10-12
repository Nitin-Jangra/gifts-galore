import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import userRepository from '../src/repositories/user.repository.js';
import { hashPassword, signToken } from '../src/utils/security.js';

describe('Auth & Session API Integration', () => {
  // In-memory test store
  const mockUsers = new Map();

  beforeEach(() => {
    mockUsers.clear();

    vi.spyOn(userRepository, 'findByEmail').mockImplementation(async (email) => {
      return mockUsers.get(email.toLowerCase()) || null;
    });

    vi.spyOn(userRepository, 'findById').mockImplementation(async (id) => {
      for (const user of mockUsers.values()) {
        if (user.id === id) return user;
      }
      return null;
    });

    vi.spyOn(userRepository, 'createCustomer').mockImplementation(async (data) => {
      const user = {
        id: `usr_${Date.now()}_${Math.random()}`,
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        fullName: data.fullName,
        phone: data.phone || null,
        role: 'CUSTOMER',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        sellerProfile: null,
      };
      mockUsers.set(user.email, user);
      return user;
    });

    vi.spyOn(userRepository, 'createSeller').mockImplementation(async (data) => {
      const user = {
        id: `usr_seller_${Date.now()}`,
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        fullName: data.fullName,
        phone: data.phone || null,
        role: 'SELLER',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        sellerProfile: {
          id: `sel_${Date.now()}`,
          storeName: data.storeName,
          slug: data.slug,
          city: data.city || 'Loharu',
          state: data.state || 'Haryana',
        },
      };
      mockUsers.set(user.email, user);
      return user;
    });
  });

  describe('CSRF Token Protection', () => {
    it('GET /api/v1/auth/csrf-token should set gg_csrf_sig cookie and return csrfToken', async () => {
      const res = await request(app).get('/api/v1/auth/csrf-token');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('csrfToken');
      expect(res.headers['set-cookie']).toBeDefined();
      const cookieHeader = res.headers['set-cookie'].join(';');
      expect(cookieHeader).toContain('gg_csrf_sig=');
    });

    it('POST /api/v1/auth/register without CSRF token should return 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'customer@giftsgalore.com',
          password: 'Password123!',
          fullName: 'Ananya Sharma',
        });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('CSRF_MISSING');
    });
  });

  describe('Customer Registration & Validation', () => {
    it('should register a customer with valid CSRF and return 201 with HttpOnly session cookie', async () => {
      // 1. Fetch CSRF token
      const csrfRes = await request(app).get('/api/v1/auth/csrf-token');
      const csrfToken = csrfRes.body.csrfToken;
      const csrfCookie = csrfRes.headers['set-cookie'];

      // 2. Register
      const res = await request(app)
        .post('/api/v1/auth/register')
        .set('Cookie', csrfCookie)
        .set('x-csrf-token', csrfToken)
        .send({
          email: 'ananya@giftsgalore.com',
          password: 'SecurePassword123!',
          fullName: 'Ananya Sharma',
          phone: '+919876543210',
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user.email).toBe('ananya@giftsgalore.com');
      expect(res.body.data.user.role).toBe('CUSTOMER');
      expect(res.body.data.user).not.toHaveProperty('passwordHash');

      // Verify HttpOnly session cookie is set
      const cookies = res.headers['set-cookie'].join(';');
      expect(cookies).toContain('gg_session=');
    });

    it('should reject weak password with 400 validation error', async () => {
      const csrfRes = await request(app).get('/api/v1/auth/csrf-token');
      const csrfToken = csrfRes.body.csrfToken;
      const csrfCookie = csrfRes.headers['set-cookie'];

      const res = await request(app)
        .post('/api/v1/auth/register')
        .set('Cookie', csrfCookie)
        .set('x-csrf-token', csrfToken)
        .send({
          email: 'weak@giftsgalore.com',
          password: '123', // fails min 8 and complexity
          fullName: 'Test User',
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('should reject duplicate email registration with 409 Conflict', async () => {
      const csrfRes = await request(app).get('/api/v1/auth/csrf-token');
      const csrfToken = csrfRes.body.csrfToken;
      const csrfCookie = csrfRes.headers['set-cookie'];

      // First registration
      await request(app)
        .post('/api/v1/auth/register')
        .set('Cookie', csrfCookie)
        .set('x-csrf-token', csrfToken)
        .send({
          email: 'duplicate@giftsgalore.com',
          password: 'SecurePassword123!',
          fullName: 'Original User',
        });

      // Second registration with same email
      const res2 = await request(app)
        .post('/api/v1/auth/register')
        .set('Cookie', csrfCookie)
        .set('x-csrf-token', csrfToken)
        .send({
          email: 'duplicate@giftsgalore.com',
          password: 'SecurePassword123!',
          fullName: 'Copy User',
        });

      expect(res2.status).toBe(409);
      expect(res2.body.message).toContain('already exists');
    });
  });

  describe('Seller Public Registration Feature Flag', () => {
    it('should reject public seller registration when feature flag is disabled', async () => {
      process.env.ENABLE_PUBLIC_SELLER_REGISTRATION = 'false';

      const csrfRes = await request(app).get('/api/v1/auth/csrf-token');
      const csrfToken = csrfRes.body.csrfToken;
      const csrfCookie = csrfRes.headers['set-cookie'];

      const res = await request(app)
        .post('/api/v1/auth/register-seller')
        .set('Cookie', csrfCookie)
        .set('x-csrf-token', csrfToken)
        .send({
          email: 'seller@example.com',
          password: 'SecurePassword123!',
          fullName: 'Rohan Verma',
          storeName: 'Verma Handicrafts',
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('disabled');
    });

    it('should permit seller registration when feature flag is enabled', async () => {
      process.env.ENABLE_PUBLIC_SELLER_REGISTRATION = 'true';

      const csrfRes = await request(app).get('/api/v1/auth/csrf-token');
      const csrfToken = csrfRes.body.csrfToken;
      const csrfCookie = csrfRes.headers['set-cookie'];

      const res = await request(app)
        .post('/api/v1/auth/register-seller')
        .set('Cookie', csrfCookie)
        .set('x-csrf-token', csrfToken)
        .send({
          email: 'seller_enabled@example.com',
          password: 'SecurePassword123!',
          fullName: 'Rohan Verma',
          storeName: 'Verma Handicrafts',
          city: 'Loharu',
          state: 'Haryana',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.user.role).toBe('SELLER');
      expect(res.body.data.user.sellerProfile.storeName).toBe('Verma Handicrafts');

      // Reset flag
      process.env.ENABLE_PUBLIC_SELLER_REGISTRATION = 'false';
    });
  });

  describe('Login & Account Status Enforcement', () => {
    beforeEach(async () => {
      const passwordHash = await hashPassword('ValidPass123!');
      mockUsers.set('active@giftsgalore.com', {
        id: 'usr_active_1',
        email: 'active@giftsgalore.com',
        passwordHash,
        fullName: 'Active User',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        sellerProfile: null,
      });

      mockUsers.set('suspended@giftsgalore.com', {
        id: 'usr_suspended_2',
        email: 'suspended@giftsgalore.com',
        passwordHash,
        fullName: 'Suspended User',
        role: 'CUSTOMER',
        status: 'SUSPENDED',
        sellerProfile: null,
      });
    });

    it('should successfully login active user and issue session cookie', async () => {
      const csrfRes = await request(app).get('/api/v1/auth/csrf-token');
      const csrfToken = csrfRes.body.csrfToken;
      const csrfCookie = csrfRes.headers['set-cookie'];

      const res = await request(app)
        .post('/api/v1/auth/login')
        .set('Cookie', csrfCookie)
        .set('x-csrf-token', csrfToken)
        .send({
          email: 'active@giftsgalore.com',
          password: 'ValidPass123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('active@giftsgalore.com');
      const cookies = res.headers['set-cookie'].join(';');
      expect(cookies).toContain('gg_session=');
    });

    it('should reject login with invalid password (401)', async () => {
      const csrfRes = await request(app).get('/api/v1/auth/csrf-token');
      const csrfToken = csrfRes.body.csrfToken;
      const csrfCookie = csrfRes.headers['set-cookie'];

      const res = await request(app)
        .post('/api/v1/auth/login')
        .set('Cookie', csrfCookie)
        .set('x-csrf-token', csrfToken)
        .send({
          email: 'active@giftsgalore.com',
          password: 'IncorrectPassword999!',
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Invalid email or password');
    });

    it('should deny login for suspended accounts with 403 Forbidden', async () => {
      const csrfRes = await request(app).get('/api/v1/auth/csrf-token');
      const csrfToken = csrfRes.body.csrfToken;
      const csrfCookie = csrfRes.headers['set-cookie'];

      const res = await request(app)
        .post('/api/v1/auth/login')
        .set('Cookie', csrfCookie)
        .set('x-csrf-token', csrfToken)
        .send({
          email: 'suspended@giftsgalore.com',
          password: 'ValidPass123!',
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('suspended');
    });
  });

  describe('Session Validation & /me endpoint', () => {
    it('GET /api/v1/auth/me should return authenticated user profile', async () => {
      const user = {
        id: 'usr_me_1',
        email: 'me@giftsgalore.com',
        fullName: 'Self User',
        role: 'CUSTOMER',
        status: 'ACTIVE',
        sellerProfile: null,
      };
      mockUsers.set(user.email, user);

      const token = signToken({ id: user.id, email: user.email, role: user.role });

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Cookie', [`gg_session=${token}`]);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('me@giftsgalore.com');
    });

    it('GET /api/v1/auth/me without session should return 401 Unauthenticated', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.code).toBe('UNAUTHENTICATED');
    });
  });
});
