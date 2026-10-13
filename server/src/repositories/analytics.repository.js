import prisma from '../config/prisma.js';

class AnalyticsRepository {
  /**
   * Derive real-time analytics for a specific seller
   */
  async getSellerAnalytics(sellerId) {
    const [
      orderItems,
      products,
      pendingBespokeCount,
    ] = await Promise.all([
      prisma.orderItem.findMany({
        where: { sellerId },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              createdAt: true,
            },
          },
          product: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      prisma.product.findMany({
        where: { sellerId, status: { not: 'DELETED' } },
        select: {
          id: true,
          name: true,
          stockQuantity: true,
          availability: true,
          status: true,
          price: true,
        },
      }),
      prisma.bespokeRequest.count({
        where: {
          sellerId,
          status: { in: ['SUBMITTED', 'UNDER_REVIEW'] },
        },
      }),
    ]);

    // Financial totals derived from order line items
    let grossSales = 0;
    const orderIds = new Set();
    let pendingFulfillmentCount = 0;
    const productSalesMap = {};

    for (const item of orderItems) {
      orderIds.add(item.orderId);
      const itemTotal = Number(item.unitPrice) * item.quantity;
      grossSales += itemTotal;

      if (['CONFIRMED', 'PROCESSING'].includes(item.order.status)) {
        pendingFulfillmentCount++;
      }

      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = {
          productId: item.productId,
          name: item.product.name,
          unitsSold: 0,
          revenue: 0,
        };
      }
      productSalesMap[item.productId].unitsSold += item.quantity;
      productSalesMap[item.productId].revenue += itemTotal;
    }

    const lowStockThreshold = 5;
    const lowStockProducts = products.filter(
      (p) => p.availability !== 'MADE_TO_ORDER' && p.stockQuantity > 0 && p.stockQuantity <= lowStockThreshold
    );
    const outOfStockProducts = products.filter(
      (p) => p.availability !== 'MADE_TO_ORDER' && p.stockQuantity === 0
    );

    const bestPerformingProducts = Object.values(productSalesMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      summary: {
        totalOrders: orderIds.size,
        totalItemsSold: orderItems.reduce((acc, i) => acc + i.quantity, 0),
        grossSales,
        netRevenue: grossSales, // Seller net after platform policy
        pendingFulfillmentCount,
        pendingBespokeCount,
      },
      inventoryAlerts: {
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
        lowStockList: lowStockProducts.slice(0, 5),
        outOfStockList: outOfStockProducts.slice(0, 5),
      },
      bestPerformingProducts,
    };
  }

  /**
   * Derive real-time analytics for Platform Administrators
   */
  async getAdminAnalytics() {
    const [
      users,
      sellers,
      products,
      orders,
      auditLogs,
    ] = await Promise.all([
      prisma.user.findMany({
        select: { id: true, role: true, status: true },
      }),
      prisma.seller.findMany({
        select: { id: true, storeName: true, status: true, city: true },
      }),
      prisma.product.findMany({
        where: { status: { not: 'DELETED' } },
        select: { id: true, status: true, productType: true, sellerId: true },
      }),
      prisma.order.findMany({
        select: {
          id: true,
          grossAmount: true,
          discountAmount: true,
          taxAmount: true,
          shippingAmount: true,
          netAmount: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true, role: true } } },
      }),
    ]);

    // Account distribution
    const accountStatusCounts = {
      ACTIVE: 0,
      PENDING: 0,
      SUSPENDED: 0,
      BLOCKED: 0,
    };
    for (const u of users) {
      if (accountStatusCounts[u.status] !== undefined) {
        accountStatusCounts[u.status]++;
      }
    }

    // Financial breakdown: separate gross, discounts, taxes, shipping, net revenue
    let totalGrossValue = 0;
    let totalDiscounts = 0;
    let totalTaxes = 0;
    let totalShipping = 0;
    let totalNetRevenue = 0;

    for (const o of orders) {
      totalGrossValue += Number(o.grossAmount);
      totalDiscounts += Number(o.discountAmount);
      totalTaxes += Number(o.taxAmount);
      totalShipping += Number(o.shippingAmount);
      totalNetRevenue += Number(o.netAmount);
    }

    // Product breakdown
    const productTypeCounts = { READY_MADE: 0, CUSTOMIZABLE: 0, ON_DEMAND: 0 };
    for (const p of products) {
      if (productTypeCounts[p.productType] !== undefined) {
        productTypeCounts[p.productType]++;
      }
    }

    return {
      overview: {
        totalCustomers: users.filter((u) => u.role === 'CUSTOMER').length,
        totalSellers: sellers.length,
        totalProducts: products.length,
        totalOrders: orders.length,
      },
      accounts: accountStatusCounts,
      financials: {
        grossOrderValue: totalGrossValue,
        discounts: totalDiscounts,
        taxes: totalTaxes,
        shippingCollected: totalShipping,
        netRevenue: totalNetRevenue,
      },
      catalog: {
        totalActive: products.filter((p) => p.status === 'ACTIVE').length,
        totalDraft: products.filter((p) => p.status === 'DRAFT').length,
        byType: productTypeCounts,
      },
      recentAuditLogs: auditLogs,
    };
  }

  async recordAudit(userId, action, entityType, entityId = null, details = null, ipAddress = null) {
    return await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        details,
        ipAddress,
      },
    });
  }
}

export default new AnalyticsRepository();
