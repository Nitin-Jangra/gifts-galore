import bespokeService from '../services/bespoke.service.js';

export async function submitRequest(req, res, next) {
  try {
    const request = await bespokeService.submitRequest(req.user.id, req.body);
    return res.status(201).json({
      status: 'success',
      message: 'Bespoke gift request submitted successfully. The artisan will review and provide a quotation.',
      data: { request },
    });
  } catch (err) {
    next(err);
  }
}

export async function getRequestById(req, res, next) {
  try {
    const request = await bespokeService.getRequestById(req.params.id, req.user);
    return res.status(200).json({
      status: 'success',
      data: { request },
    });
  } catch (err) {
    next(err);
  }
}

export async function provideQuote(req, res, next) {
  try {
    const updated = await bespokeService.provideQuote(req.params.id, req.user, req.body);
    return res.status(200).json({
      status: 'success',
      message: 'Quotation provided to customer successfully.',
      data: { request: updated },
    });
  } catch (err) {
    next(err);
  }
}

export async function approveQuote(req, res, next) {
  try {
    const result = await bespokeService.approveQuoteAndCreateOrder(req.params.id, req.user);
    return res.status(200).json({
      status: 'success',
      message: 'Quotation approved! Bespoke order successfully created.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function getCustomerRequests(req, res, next) {
  try {
    const requests = await bespokeService.getCustomerRequests(req.user.id);
    return res.status(200).json({
      status: 'success',
      data: { requests },
    });
  } catch (err) {
    next(err);
  }
}

export async function getSellerRequests(req, res, next) {
  try {
    const sellerId = req.user.sellerProfile?.id;
    if (!sellerId) {
      return res.status(403).json({ status: 'fail', message: 'Only registered sellers can view bespoke queue.' });
    }
    const requests = await bespokeService.getSellerRequests(sellerId);
    return res.status(200).json({
      status: 'success',
      data: { requests },
    });
  } catch (err) {
    next(err);
  }
}
