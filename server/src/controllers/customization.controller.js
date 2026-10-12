import customizationService from '../services/customization.service.js';

export async function getFieldsForProduct(req, res, next) {
  try {
    const fields = await customizationService.getFieldsForProduct(req.params.productId);
    return res.status(200).json({
      status: 'success',
      data: { fields },
    });
  } catch (err) {
    next(err);
  }
}

export async function createCustomField(req, res, next) {
  try {
    const field = await customizationService.createCustomField(
      req.params.productId,
      req.user,
      req.body
    );
    return res.status(201).json({
      status: 'success',
      message: 'Customization field added successfully.',
      data: { field },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateCustomField(req, res, next) {
  try {
    const field = await customizationService.updateCustomField(
      req.params.fieldId,
      req.user,
      req.body
    );
    return res.status(200).json({
      status: 'success',
      message: 'Customization field updated successfully.',
      data: { field },
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteCustomField(req, res, next) {
  try {
    await customizationService.deleteCustomField(req.params.fieldId, req.user);
    return res.status(200).json({
      status: 'success',
      message: 'Customization field deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
}

export async function validatePersonalization(req, res, next) {
  try {
    const snapshot = await customizationService.validateAndBuildSnapshot(
      req.params.productId,
      req.body.personalization || {}
    );
    return res.status(200).json({
      status: 'success',
      message: 'Personalization validated successfully.',
      data: { snapshot },
    });
  } catch (err) {
    next(err);
  }
}
