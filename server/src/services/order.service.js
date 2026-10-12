import defaultOrderRepository from '../repositories/order.repository.js';
import defaultProductRepository from '../repositories/product.repository.js';

export class OrderService {
  constructor(
    orderRepo = defaultOrderRepository,
    productRepo = defaultProductRepository
  ) {
    this.orderRepo = orderRepo;
    this.productRepo = productRepo;
  }

  generateOrderNumber() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(100 + Math.random() * 900);
    return `GG-${timestamp}-${random}`;
  }

  async checkout(customerId, data) {
    if (!data.items || data.items.length === 0) {
      const err = new Error('Order must contain at least one item.');
      err.statusCode = 400;
      throw err;
    }

    const processedItems = [];
    let grossTotal = 0;
    let discountTotal = 0;

    for (const item of data.items) {
      const product = await this.productRepo.findById(item.productId);
      if (!product || product.status === 'DELETED' || product.status === 'INACTIVE') {
        const err = new Error(`Product '${item.productId}' is not available for purchase.`);
        err.statusCode = 400;
        throw err;
      }

      // Check inventory if not made to order
      if (product.availability !== 'MADE_TO_ORDER') {
        if (product.stockQuantity < item.quantity) {
          const err = new Error(`Insufficient stock for '${product.name}'. Available: ${product.stockQuantity}.`);
          err.statusCode = 400;
          throw err;
        }
      }

      const originalUnitPrice = Number(product.price);
      const effectiveUnitPrice = Number(product.discountPrice || product.price);
      const itemGross = originalUnitPrice * item.quantity;
      const itemNet = effectiveUnitPrice * item.quantity;
      const itemDiscount = itemGross - itemNet;

      grossTotal += itemGross;
      discountTotal += itemDiscount;

      processedItems.push({
        productId: product.id,
        sellerId: product.sellerId,
        quantity: item.quantity,
        unitPrice: effectiveUnitPrice,
        customizationSnapshot: item.customizationSnapshot || null,
      });
    }

    // Shipping calculation: Free shipping above ₹999, else ₹99
    const shippingAmount = (grossTotal - discountTotal) >= 999 ? 0 : 99;
    const netAmount = (grossTotal - discountTotal) + shippingAmount;

    const orderData = {
      orderNumber: this.generateOrderNumber(),
      customerId,
      status: 'CONFIRMED', // Set to confirmed for v1 dev workflow
      grossAmount: grossTotal,
      discountAmount: discountTotal,
      taxAmount: 0.00, // Included in unit prices
      shippingAmount,
      netAmount,
      isGift: Boolean(data.isGift),
      recipientName: data.isGift ? data.recipientName : null,
      recipientPhone: data.isGift ? data.recipientPhone : null,
      recipientAddress: data.isGift ? data.recipientAddress : (data.shippingAddress || null),
      giftMessage: data.isGift ? data.giftMessage : null,
      deliveryDateRequested: data.deliveryDateRequested ? new Date(data.deliveryDateRequested) : null,
      discreetPricingRequested: Boolean(data.discreetPricingRequested),
    };

    return await this.orderRepo.createOrder({
      orderData,
      items: processedItems,
    });
  }

  async getOrderById(orderId, user) {
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      const err = new Error('Order not found.');
      err.statusCode = 404;
      throw err;
    }

    // Customer can only view their own orders
    if (user.role === 'CUSTOMER' && order.customerId !== user.id) {
      const err = new Error('Access denied: You do not have permission to view this order.');
      err.statusCode = 403;
      throw err;
    }

    // Seller can only view line items belonging to their store (protect multi-vendor confidentiality)
    if (user.role === 'SELLER') {
      const sellerId = user.sellerProfile?.id;
      const sellerItems = order.items.filter((item) => item.sellerId === sellerId);
      if (sellerItems.length === 0) {
        const err = new Error('Access denied: You do not have items in this order.');
        err.statusCode = 403;
        throw err;
      }
      return {
        ...order,
        items: sellerItems,
      };
    }

    return order;
  }

  async getCustomerOrders(customerId) {
    return await this.orderRepo.findByCustomerId(customerId);
  }

  async getSellerOrders(sellerId) {
    return await this.orderRepo.findBySellerId(sellerId);
  }

  async updateOrderStatus(orderId, user, newStatus) {
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      const err = new Error('Order not found.');
      err.statusCode = 404;
      throw err;
    }

    if (user.role !== 'ADMIN') {
      const sellerId = user.sellerProfile?.id;
      const hasItem = order.items.some((item) => item.sellerId === sellerId);
      if (!hasItem) {
        const err = new Error('Access denied: You do not have permission to modify this order.');
        err.statusCode = 403;
        throw err;
      }
    }

    return await this.orderRepo.updateStatus(orderId, newStatus);
  }
}

export default new OrderService();
