import authService from '../services/auth.service.js';

const getSessionCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

export async function registerCustomer(req, res, next) {
  try {
    const result = await authService.registerCustomer(req.body);
    res.cookie('gg_session', result.token, getSessionCookieOptions());

    return res.status(201).json({
      status: 'success',
      message: 'Account registered successfully.',
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function registerSeller(req, res, next) {
  try {
    const result = await authService.registerSeller(req.body);
    res.cookie('gg_session', result.token, getSessionCookieOptions());

    return res.status(201).json({
      status: 'success',
      message: 'Seller store account registered successfully.',
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    res.cookie('gg_session', result.token, getSessionCookieOptions());

    return res.status(200).json({
      status: 'success',
      message: 'Signed in successfully.',
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  res.clearCookie('gg_session', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  });

  return res.status(200).json({
    status: 'success',
    message: 'Signed out successfully.',
  });
}

export async function getMe(req, res) {
  return res.status(200).json({
    status: 'success',
    data: {
      user: authService.sanitizeUser(req.user),
    },
  });
}
