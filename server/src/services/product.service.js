import defaultProductRepository from '../repositories/product.repository.js';
import storageService from '../utils/storage.js';

export class ProductService {
  constructor(productRepo = defaultProductRepository) {
    this.productRepo = productRepo;
  }

  generateSlug(name) {
    const base = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    return `${base}-${randomSuffix}`;
  }

  async listProducts(filters = {}) {
    const page = Math.max(1, parseInt(filters.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(filters.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const { total, products } = await this.productRepo.findAll(filters, { skip, take: limit });

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getProductBySlug(slug) {
    const product = await this.productRepo.findBySlug(slug);
    if (!product) {
      const err = new Error('Product not found.');
      err.statusCode = 404;
      throw err;
    }
    return product;
  }

  async getProductById(id) {
    const product = await this.productRepo.findById(id);
    if (!product) {
      const err = new Error('Product not found.');
      err.statusCode = 404;
      throw err;
    }
    return product;
  }

  async createProduct(sellerId, data) {
    if (!sellerId) {
      const err = new Error('A valid seller profile is required to list products.');
      err.statusCode = 403;
      throw err;
    }

    // Inventory rule: cannot be IN_STOCK if stockQuantity is 0 unless MADE_TO_ORDER
    if (data.stockQuantity === 0 && data.availability === 'IN_STOCK') {
      const err = new Error('Products with 0 stock quantity cannot be marked IN_STOCK. Select OUT_OF_STOCK or MADE_TO_ORDER.');
      err.statusCode = 400;
      throw err;
    }

    const slug = this.generateSlug(data.name);

    return await this.productRepo.create({
      ...data,
      sellerId,
      slug,
    });
  }

  async updateProduct(productId, user, updateData) {
    const existing = await this.getProductById(productId);

    // Strict multi-vendor ownership check
    if (user.role !== 'ADMIN' && existing.sellerId !== user.sellerProfile?.id) {
      const err = new Error('Access denied: You do not have permission to modify another vendor’s product.');
      err.statusCode = 403;
      throw err;
    }

    const targetStock = updateData.stockQuantity !== undefined ? updateData.stockQuantity : existing.stockQuantity;
    const targetAvailability = updateData.availability !== undefined ? updateData.availability : existing.availability;

    if (targetStock === 0 && targetAvailability === 'IN_STOCK') {
      const err = new Error('Products with 0 stock quantity cannot be marked IN_STOCK.');
      err.statusCode = 400;
      throw err;
    }

    return await this.productRepo.update(productId, updateData);
  }

  async deleteProduct(productId, user) {
    const existing = await this.getProductById(productId);

    // Multi-vendor ownership check
    if (user.role !== 'ADMIN' && existing.sellerId !== user.sellerProfile?.id) {
      const err = new Error('Access denied: You do not have permission to delete another vendor’s product.');
      err.statusCode = 403;
      throw err;
    }

    return await this.productRepo.softDelete(productId);
  }

  async addProductImage(productId, user, file, isPrimary = false, displayOrder = 0) {
    const existing = await this.getProductById(productId);

    if (user.role !== 'ADMIN' && existing.sellerId !== user.sellerProfile?.id) {
      const err = new Error('Access denied: You do not have permission to upload images for another vendor’s product.');
      err.statusCode = 403;
      throw err;
    }

    const uploadResult = await storageService.uploadImage(file.buffer, file.originalname, file.mimetype);

    return await this.productRepo.addImage(productId, uploadResult.url, isPrimary, displayOrder);
  }

  async listCategories() {
    return await this.productRepo.listCategories();
  }
}

export default new ProductService();
