import { verifyToken } from '../utils/security.js';
import userRepository from '../repositories/user.repository.js';

/**
 * Authentication Middleware: Validates session JWT from HttpOnly cookie or Authorization header
 */
export async function authenticate(req, res, next) {
  try {
    let token = req.cookies?.gg_session;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        code: 'UNAUTHENTICATED',
        message: 'Authentication is required to access this endpoint.',
      });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        status: 'fail',
        code: 'SESSION_EXPIRED',
        message: 'Session has expired or is invalid. Please sign in again.',
      });
    }

    const user = await userRepository.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        code: 'USER_NOT_FOUND',
        message: 'The account associated with this session no longer exists.',
      });
    }

    if (user.status === 'SUSPENDED' || user.status === 'BLOCKED') {
      return res.status(403).json({
        status: 'fail',
        code: 'ACCOUNT_SUSPENDED',
        message: `Your account has been ${user.status.toLowerCase()}. Access is denied.`,
      });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * RBAC Middleware: Enforces allowed roles
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'fail',
        code: 'UNAUTHENTICATED',
        message: 'Authentication required.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        code: 'FORBIDDEN',
        message: `Forbidden: This resource requires one of [${allowedRoles.join(', ')}] permissions.`,
      });
    }

    next();
  };
}

/**
 * Multi-Vendor Tenant Ownership Guard: Ensures sellers can only mutate their own assets
 */
export function requireSellerOwnership(resourceSellerIdGetter) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ status: 'fail', message: 'Authentication required.' });
    }

    // Admins have platform-wide oversight
    if (req.user.role === 'ADMIN') {
      return next();
    }

    if (req.user.role !== 'SELLER' || !req.user.sellerProfile) {
      return res.status(403).json({
        status: 'fail',
        code: 'NOT_A_SELLER',
        message: 'Only registered sellers can perform this action.',
      });
    }

    const targetSellerId = typeof resourceSellerIdGetter === 'function'
      ? resourceSellerIdGetter(req)
      : req.params.sellerId;

    if (req.user.sellerProfile.id !== targetSellerId) {
      return res.status(403).json({
        status: 'fail',
        code: 'OWNERSHIP_VIOLATION',
        message: 'Access denied: You do not have permission to modify another vendor’s resources.',
      });
    }

    next();
  };
}
