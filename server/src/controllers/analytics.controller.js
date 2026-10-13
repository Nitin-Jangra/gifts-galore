import analyticsService from '../services/analytics.service.js';

export async function getSellerDashboard(req, res, next) {
  try {
    const sellerId = req.user.sellerProfile?.id;
    const metrics = await analyticsService.getSellerDashboardMetrics(sellerId);
    return res.status(200).json({
      status: 'success',
      data: { metrics },
    });
  } catch (err) {
    next(err);
  }
}

export async function getAdminDashboard(req, res, next) {
  try {
    const metrics = await analyticsService.getAdminPlatformMetrics();
    return res.status(200).json({
      status: 'success',
      data: { metrics },
    });
  } catch (err) {
    next(err);
  }
}
