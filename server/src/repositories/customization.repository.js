import prisma from '../config/prisma.js';

class CustomizationRepository {
  async findByProductId(productId) {
    return await prisma.customizationField.findMany({
      where: { productId },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findById(fieldId) {
    return await prisma.customizationField.findUnique({
      where: { id: fieldId },
      include: { product: true },
    });
  }

  async create(productId, data) {
    return await prisma.customizationField.create({
      data: {
        ...data,
        productId,
      },
    });
  }

  async update(fieldId, data) {
    return await prisma.customizationField.update({
      where: { id: fieldId },
      data,
    });
  }

  async delete(fieldId) {
    return await prisma.customizationField.delete({
      where: { id: fieldId },
    });
  }
}

export default new CustomizationRepository();
