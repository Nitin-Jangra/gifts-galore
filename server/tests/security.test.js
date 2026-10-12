import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  generateCsrfToken,
  hashCsrfToken,
} from '../src/utils/security.js';

describe('Security Utilities', () => {
  it('should hash and verify passwords using Argon2id', async () => {
    const rawPassword = 'SecurePassword!2026';
    const hash = await hashPassword(rawPassword);

    expect(hash).toBeDefined();
    expect(hash).toContain('$argon2id$');

    const isValid = await verifyPassword(hash, rawPassword);
    expect(isValid).toBe(true);

    const isInvalid = await verifyPassword(hash, 'WrongPassword!2026');
    expect(isInvalid).toBe(false);
  });

  it('should sign and verify valid JWT session tokens', () => {
    const payload = { id: 'user-uuid-123', email: 'test@giftsgalore.com', role: 'CUSTOMER' };
    const token = signToken(payload);

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    const decoded = verifyToken(token);
    expect(decoded).toMatchObject(payload);
  });

  it('should return null when verifying invalid tokens', () => {
    const decoded = verifyToken('corrupted.jwt.token');
    expect(decoded).toBeNull();
  });

  it('should generate CSRF token and verify hash signature', () => {
    const token = generateCsrfToken();
    expect(token).toHaveLength(64); // 32 bytes hex = 64 chars

    const sig = hashCsrfToken(token);
    expect(sig).toBeDefined();
    expect(hashCsrfToken(token)).toBe(sig);

    // Mismatched token generates different signature
    expect(hashCsrfToken('different-token')).not.toBe(sig);
  });
});
