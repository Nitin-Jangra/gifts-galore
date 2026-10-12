import defaultCustomizationRepository from '../repositories/customization.repository.js';
import defaultProductRepository from '../repositories/product.repository.js';

export class CustomizationService {
  constructor(
    customizationRepo = defaultCustomizationRepository,
    productRepo = defaultProductRepository
  ) {
    this.customizationRepo = customizationRepo;
    this.productRepo = productRepo;
  }

  async getFieldsForProduct(productId) {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      const err = new Error('Product not found.');
      err.statusCode = 404;
      throw err;
    }
    return await this.customizationRepo.findByProductId(productId);
  }

  async createCustomField(productId, user, data) {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      const err = new Error('Product not found.');
      err.statusCode = 404;
      throw err;
    }

    if (product.productType !== 'CUSTOMIZABLE') {
      const err = new Error('Customization fields can only be configured for CUSTOMIZABLE products.');
      err.statusCode = 400;
      throw err;
    }

    // Ownership verification
    if (user.role !== 'ADMIN' && product.sellerId !== user.sellerProfile?.id) {
      const err = new Error('Access denied: You do not have permission to modify another vendor’s customization options.');
      err.statusCode = 403;
      throw err;
    }

    return await this.customizationRepo.create(productId, data);
  }

  async updateCustomField(fieldId, user, data) {
    const field = await this.customizationRepo.findById(fieldId);
    if (!field) {
      const err = new Error('Customization field not found.');
      err.statusCode = 404;
      throw err;
    }

    if (user.role !== 'ADMIN' && field.product.sellerId !== user.sellerProfile?.id) {
      const err = new Error('Access denied: You do not have permission to modify another vendor’s customization options.');
      err.statusCode = 403;
      throw err;
    }

    return await this.customizationRepo.update(fieldId, data);
  }

  async deleteCustomField(fieldId, user) {
    const field = await this.customizationRepo.findById(fieldId);
    if (!field) {
      const err = new Error('Customization field not found.');
      err.statusCode = 404;
      throw err;
    }

    if (user.role !== 'ADMIN' && field.product.sellerId !== user.sellerProfile?.id) {
      const err = new Error('Access denied: You do not have permission to delete another vendor’s customization options.');
      err.statusCode = 403;
      throw err;
    }

    return await this.customizationRepo.delete(fieldId);
  }

  /**
   * Validate customer-submitted personalization entries against defined product schema
   * and build an immutable snapshot
   */
  async validateAndBuildSnapshot(productId, customerInputs = {}) {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      const err = new Error('Product not found.');
      err.statusCode = 404;
      throw err;
    }

    if (product.productType !== 'CUSTOMIZABLE') {
      return null;
    }

    const definedFields = await this.customizationRepo.findByProductId(productId);
    const snapshotItems = [];

    for (const field of definedFields) {
      const userValue = customerInputs[field.id];

      // Check required status
      if (field.isRequired && (userValue === undefined || userValue === null || String(userValue).trim() === '')) {
        const err = new Error(`Customization field '${field.label}' is required.`);
        err.statusCode = 400;
        err.fieldId = field.id;
        throw err;
      }

      if (userValue !== undefined && userValue !== null && String(userValue).trim() !== '') {
        const strVal = String(userValue).trim();

        // Check max length
        if (field.maxLength && strVal.length > field.maxLength) {
          const err = new Error(`'${field.label}' exceeds maximum allowable length of ${field.maxLength} characters.`);
          err.statusCode = 400;
          err.fieldId = field.id;
          throw err;
        }

        // Check select options
        if (field.fieldType === 'SELECT' && Array.isArray(field.optionsJson)) {
          if (!field.optionsJson.includes(strVal)) {
            const err = new Error(`'${strVal}' is not a valid option for '${field.label}'.`);
            err.statusCode = 400;
            err.fieldId = field.id;
            throw err;
          }
        }

        snapshotItems.push({
          fieldId: field.id,
          label: field.label,
          fieldType: field.fieldType,
          value: strVal,
        });
      }
    }

    return {
      capturedAt: new Date().toISOString(),
      productId: product.id,
      productName: product.name,
      fields: snapshotItems,
    };
  }
}

export default new CustomizationService();
