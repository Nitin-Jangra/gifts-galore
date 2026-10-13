import defaultBespokeRepository from '../repositories/bespoke.repository.js';
import defaultOrderRepository from '../repositories/order.repository.js';

export class BespokeService {
  constructor(
    bespokeRepo = defaultBespokeRepository,
    orderRepo = defaultOrderRepository
  ) {
    this.bespokeRepo = bespokeRepo;
    this.orderRepo = orderRepo;
  }

  async submitRequest(customerId, data) {
    return await this.bespokeRepo.create({
      customerId,
      sellerId: data.sellerId,
      occasion: data.occasion,
      recipientNotes: data.recipientNotes || null,
      budgetRange: data.budgetRange,
      targetDate: data.targetDate ? new Date(data.targetDate) : null,
      description: data.description,
      referenceImages: data.referenceImages || [],
      status: 'SUBMITTED',
    });
  }

  async getRequestById(requestId, user) {
    const request = await this.bespokeRepo.findById(requestId);
    if (!request) {
      const err = new Error('Bespoke request not found.');
      err.statusCode = 404;
      throw err;
    }

    if (user.role === 'CUSTOMER' && request.customerId !== user.id) {
      const err = new Error('Access denied: You cannot view another customer’s bespoke request.');
      err.statusCode = 403;
      throw err;
    }

    if (user.role === 'SELLER' && request.sellerId !== user.sellerProfile?.id) {
      const err = new Error('Access denied: You cannot view another vendor’s bespoke request.');
      err.statusCode = 403;
      throw err;
    }

    return request;
  }

  async provideQuote(requestId, user, { quotedPrice, sellerNotes }) {
    const req = await this.bespokeRepo.findById(requestId);
    if (!req) {
      const err = new Error('Bespoke request not found.');
      err.statusCode = 404;
      throw err;
    }

    if (user.role !== 'ADMIN' && req.sellerId !== user.sellerProfile?.id) {
      const err = new Error('Access denied: Only the assigned seller can provide a quotation.');
      err.statusCode = 403;
      throw err;
    }

    if (req.status === 'REJECTED' || req.status === 'CANCELLED' || req.status === 'ORDER_CREATED') {
      const err = new Error(`Cannot quote a request that is currently ${req.status}.`);
      err.statusCode = 400;
      throw err;
    }

    return await this.bespokeRepo.update(requestId, {
      quotedPrice,
      sellerNotes,
      status: 'QUOTED',
    });
  }

  async approveQuoteAndCreateOrder(requestId, user) {
    const req = await this.bespokeRepo.findById(requestId);
    if (!req) {
      const err = new Error('Bespoke request not found.');
      err.statusCode = 404;
      throw err;
    }

    if (req.customerId !== user.id) {
      const err = new Error('Access denied: Only the requesting customer can approve a quotation.');
      err.statusCode = 403;
      throw err;
    }

    if (req.status !== 'QUOTED' || !req.quotedPrice) {
      const err = new Error('This bespoke request is not yet quoted or has already been converted.');
      err.statusCode = 400;
      throw err;
    }

    // Update bespoke request status to CUSTOMER_APPROVED then ORDER_CREATED
    await this.bespokeRepo.update(requestId, {
      status: 'CUSTOMER_APPROVED',
    });

    const orderNumber = `GG-BESPOKE-${Date.now().toString().slice(-6)}`;
    const priceNum = Number(req.quotedPrice);

    const order = await this.orderRepo.createOrder({
      orderData: {
        orderNumber,
        customerId: user.id,
        status: 'CONFIRMED',
        grossAmount: priceNum,
        discountAmount: 0,
        taxAmount: 0,
        shippingAmount: 0,
        netAmount: priceNum,
        isGift: true,
        recipientName: req.recipientNotes || user.fullName,
        recipientAddress: 'As agreed in bespoke quotation specification',
        giftMessage: `Bespoke Order: ${req.occasion}`,
        deliveryDateRequested: req.targetDate,
      },
      items: [
        {
          productId: 'bespoke-custom-line-item',
          sellerId: req.sellerId,
          quantity: 1,
          unitPrice: priceNum,
          customizationSnapshot: {
            bespokeRequestId: req.id,
            occasion: req.occasion,
            description: req.description,
            sellerNotes: req.sellerNotes,
            referenceImages: req.referenceImages,
          },
        },
      ],
    });

    await this.bespokeRepo.update(requestId, {
      status: 'ORDER_CREATED',
    });

    return {
      bespokeRequest: req,
      order,
    };
  }

  async getCustomerRequests(customerId) {
    return await this.bespokeRepo.findByCustomerId(customerId);
  }

  async getSellerRequests(sellerId) {
    return await this.bespokeRepo.findBySellerId(sellerId);
  }
}

export default new BespokeService();
