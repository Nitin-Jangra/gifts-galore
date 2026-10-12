import { generateCsrfToken, hashCsrfToken } from '../utils/security.js';

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

/**
 * Middleware to generate and attach CSRF token to response
 */
export function provideCsrfToken(req, res) {
  const rawToken = generateCsrfToken();
  const signature = hashCsrfToken(rawToken);

  // Set CSRF verification cookie (HttpOnly for integrity)
  res.cookie('gg_csrf_sig', signature, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });

  return res.status(200).json({
    status: 'success',
    csrfToken: rawToken,
  });
}

/**
 * CSRF Protection Middleware for state-changing HTTP methods
 */
export function verifyCsrf(req, res, next) {
  if (SAFE_METHODS.includes(req.method)) {
    return next();
  }

  // Exempt auth bootstrap endpoints if needed (e.g. initial login/register if CSRF is retrieved beforehand)
  // But by standard practice, client requests GET /api/v1/auth/csrf-token first
  const submittedToken = req.headers['x-csrf-token'] || req.headers['x-xsrf-token'];
  const storedSignature = req.cookies?.gg_csrf_sig;

  if (!submittedToken || !storedSignature) {
    return res.status(403).json({
      status: 'fail',
      code: 'CSRF_MISSING',
      message: 'CSRF token or verification cookie missing.',
    });
  }

  const computedSignature = hashCsrfToken(submittedToken);
  if (computedSignature !== storedSignature) {
    return res.status(403).json({
      status: 'fail',
      code: 'CSRF_INVALID',
      message: 'Invalid CSRF token.',
    });
  }

  next();
}
