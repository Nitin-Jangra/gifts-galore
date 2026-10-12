import prisma from '../config/prisma.js';

class ProductRepository {
  async findAll({ search, categoryId, productType, availability, sellerId, minPrice, maxPrice }, { skip, take }) {
    const where = {
      status: { not: 'DELETED' },
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (productType) where.productType = productType;
    if (availability) where.availability = availability;
    if (sellerId) where.sellerId = sellerId;
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take,
        include: {
          images: { orderBy: { displayOrder: 'asc' } },
          category: true,
          seller: { select: { id: true, storeName: true, city: true, state: true } },
          customFields: { orderBy: { displayOrder: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { total, products };
  }

  async findBySlug(slug) {
    return await prisma.product.findFirst({
      where: { slug, status: { not: 'DELETED' } },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        category: true,
        seller: { select: { id: true, storeName: true, city: true, state: true } },
        customFields: { orderBy: { displayOrder: 'asc' } },
      },
    });
  }

  async findById(id) {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        category: true,
        seller: true,
        customFields: { orderBy: { displayOrder: 'asc' } },
      },
    });
  }

  async create(data) {
    return await prisma.product.create({
      data,
      include: {
        images: true,
        category: true,
        seller: true,
      },
    });
  }

  async update(id, data) {
    return await prisma.product.update({
      where: { id },
      data,
      include: {
        images: true,
        category: true,
      },
    });
  }

  async softDelete(id) {
    return await prisma.product.update({
      where: { id },
      data: { status: 'DELETED' },
    });
  }

  async addImage(productId, imageUrl, isPrimary = false, displayOrder = 0) {
    return await prisma.productImage.create({
      data: {
        productId,
        imageUrl,
        isPrimary,
        displayOrder,
      },
    });
  }

  async deleteImage(imageId) {
    return await prisma.productImage.delete({
      where: { id: imageId },
    });
  }

  async listCategories() {
    return await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }
}

export default new ProductRepository();
