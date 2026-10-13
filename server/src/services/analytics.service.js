import defaultAnalyticsRepo from '../repositories/analytics.repository.js';

export class AnalyticsService {
  constructor(analyticsRepo = defaultAnalyticsRepo) {
    this.analyticsRepo = analyticsRepo;
  }

  async getSellerDashboardMetrics(sellerId) {
    if (!sellerId) {
      const err = new Error('Seller profile required to access seller analytics.');
      err.statusCode = 403;
      throw err;
    }
    return await this.analyticsRepo.getSellerAnalytics(sellerId);
  }

  async getAdminPlatformMetrics() {
    return await this.analyticsRepo.getAdminAnalytics();
  }

  async logAuditEvent(userId, action, entityType, entityId, details, ip) {
    return await this.analyticsRepo.recordAudit(userId, action, entityType, entityId, details, ip);
  }
}

export default new AnalyticsService();
