import prisma from '../config/prisma.js';

class BespokeRepository {
  async create(data) {
    return await prisma.bespokeRequest.create({
      data,
      include: {
        seller: { select: { id: true, storeName: true, city: true } },
        customer: { select: { id: true, fullName: true, email: true, phone: true } },
      },
    });
  }

  async findById(id) {
    return await prisma.bespokeRequest.findUnique({
      where: { id },
      include: {
        seller: { select: { id: true, storeName: true, city: true } },
        customer: { select: { id: true, fullName: true, email: true, phone: true } },
      },
    });
  }

  async findByCustomerId(customerId) {
    return await prisma.bespokeRequest.findMany({
      where: { customerId },
      include: {
        seller: { select: { id: true, storeName: true, city: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySellerId(sellerId) {
    return await prisma.bespokeRequest.findMany({
      where: { sellerId },
      include: {
        customer: { select: { id: true, fullName: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id, data) {
    return await prisma.bespokeRequest.update({
      where: { id },
      data,
      include: {
        seller: { select: { id: true, storeName: true } },
        customer: { select: { id: true, fullName: true, email: true } },
      },
    });
  }
}

export default new BespokeRepository();
