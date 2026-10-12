import productService from '../services/product.service.js';

export async function listProducts(req, res, next) {
  try {
    const result = await productService.listProducts(req.query);
    return res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function getProductBySlug(req, res, next) {
  try {
    const product = await productService.getProductBySlug(req.params.slug);
    return res.status(200).json({
      status: 'success',
      data: { product },
    });
  } catch (err) {
    next(err);
  }
}

export async function listCategories(req, res, next) {
  try {
    const categories = await productService.listCategories();
    return res.status(200).json({
      status: 'success',
      data: { categories },
    });
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    const sellerId = req.user.sellerProfile?.id;
    const product = await productService.createProduct(sellerId, req.body);
    return res.status(201).json({
      status: 'success',
      message: 'Product created successfully.',
      data: { product },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const product = await productService.updateProduct(req.params.id, req.user, req.body);
    return res.status(200).json({
      status: 'success',
      message: 'Product updated successfully.',
      data: { product },
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    await productService.deleteProduct(req.params.id, req.user);
    return res.status(200).json({
      status: 'success',
      message: 'Product deactivated/removed successfully.',
    });
  } catch (err) {
    next(err);
  }
}

export async function uploadProductImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'No image file uploaded.',
      });
    }

    const isPrimary = req.body.isPrimary === 'true' || req.body.isPrimary === true;
    const displayOrder = parseInt(req.body.displayOrder, 10) || 0;

    const image = await productService.addProductImage(
      req.params.id,
      req.user,
      req.file,
      isPrimary,
      displayOrder
    );

    return res.status(201).json({
      status: 'success',
      message: 'Image uploaded successfully.',
      data: { image },
    });
  } catch (err) {
    next(err);
  }
}
