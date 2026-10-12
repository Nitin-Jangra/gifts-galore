import orderService from '../services/order.service.js';

export async function checkout(req, res, next) {
  try {
    const customerId = req.user.id;
    const order = await orderService.checkout(customerId, req.body);
    return res.status(201).json({
      status: 'success',
      message: 'Order placed successfully.',
      data: { order },
    });
  } catch (err) {
    next(err);
  }
}

export async function getOrderById(req, res, next) {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user);
    return res.status(200).json({
      status: 'success',
      data: { order },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMyOrders(req, res, next) {
  try {
    const orders = await orderService.getCustomerOrders(req.user.id);
    return res.status(200).json({
      status: 'success',
      data: { orders },
    });
  } catch (err) {
    next(err);
  }
}

export async function getSellerOrders(req, res, next) {
  try {
    const sellerId = req.user.sellerProfile?.id;
    if (!sellerId) {
      return res.status(403).json({
        status: 'fail',
        message: 'Only registered sellers can view seller order items.',
      });
    }
    const orderItems = await orderService.getSellerOrders(sellerId);
    return res.status(200).json({
      status: 'success',
      data: { orderItems },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const updated = await orderService.updateOrderStatus(
      req.params.id,
      req.user,
      req.body.status
    );
    return res.status(200).json({
      status: 'success',
      message: 'Order status updated successfully.',
      data: { order: updated },
    });
  } catch (err) {
    next(err);
  }
}
