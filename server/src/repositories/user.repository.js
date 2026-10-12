import prisma from '../config/prisma.js';

class UserRepository {
  async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { sellerProfile: true },
    });
  }

  async findById(id) {
    return await prisma.user.findUnique({
      where: { id },
      include: { sellerProfile: true },
    });
  }

  async createCustomer({ email, passwordHash, fullName, phone }) {
    return await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        fullName,
        phone,
        role: 'CUSTOMER',
        status: 'ACTIVE',
      },
    });
  }

  async createSeller({ email, passwordHash, fullName, phone, storeName, slug, description, city, state }) {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          fullName,
          phone,
          role: 'SELLER',
          status: 'ACTIVE',
        },
      });

      const seller = await tx.seller.create({
        data: {
          userId: user.id,
          storeName,
          slug,
          description,
          city: city || 'Loharu',
          state: state || 'Haryana',
          contactPhone: phone,
          contactEmail: email,
          status: 'ACTIVE',
        },
      });

      return { ...user, sellerProfile: seller };
    });
  }

  async updateStatus(userId, status) {
    return await prisma.user.update({
      where: { id: userId },
      data: { status },
    });
  }
}

export default new UserRepository();
