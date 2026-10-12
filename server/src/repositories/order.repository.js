import prisma from '../config/prisma.js';

class OrderRepository {
  async createOrder({ orderData, items }) {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          ...orderData,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              sellerId: item.sellerId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              customizationSnapshot: item.customizationSnapshot || null,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, slug: true, productType: true } },
              seller: { select: { id: true, storeName: true, city: true } },
            },
          },
          customer: { select: { id: true, fullName: true, email: true } },
        },
      });

      // Decrement stock for products that are not MADE_TO_ORDER
      for (const item of items) {
        await tx.product.updateMany({
          where: {
            id: item.productId,
            availability: { not: 'MADE_TO_ORDER' },
          },
          data: {
            stockQuantity: { decrement: item.quantity },
          },
        });
      }

      return order;
    });
  }

  async findById(orderId) {
    return await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, slug: true, productType: true } },
            seller: { select: { id: true, storeName: true, city: true } },
          },
        },
        customer: { select: { id: true, fullName: true, email: true } },
      },
    });
  }

  async findByCustomerId(customerId) {
    return await prisma.order.findMany({
      where: { customerId },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, slug: true } },
            seller: { select: { id: true, storeName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySellerId(sellerId) {
    return await prisma.orderItem.findMany({
      where: { sellerId },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            createdAt: true,
            isGift: true,
            recipientName: true,
            recipientAddress: true,
            giftMessage: true,
            deliveryDateRequested: true,
            discreetPricingRequested: true,
          },
        },
        product: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(orderId, status) {
    return await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { items: true },
    });
  }
}

export default new OrderRepository();
