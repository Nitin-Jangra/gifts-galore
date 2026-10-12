import React from 'react';
import { useLocation, Link, useParams } from 'react-router-dom';

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const order = location.state?.order;

  return (
    <div className="container py-5 flex-grow-1 d-flex justify-content-center">
      <div className="card card-luxury p-4 p-md-5 border text-center shadow-sm" style={{ maxWidth: '640px', width: '100%' }}>
        <div className="mb-4">
          <span className="d-inline-flex p-3 rounded-circle bg-success-subtle text-success fs-1">
            <i className="bi bi-check-circle-fill"></i>
          </span>
        </div>

        <h2 className="brand-font fw-bold mb-2">Order Confirmed!</h2>
        <p className="text-secondary small mb-3">
          Thank you for choosing Gifts Galore. Your order has been placed into artisan fulfillment.
        </p>

        <div className="p-3 bg-light rounded-3 mb-4 d-inline-block mx-auto">
          <span className="text-muted small d-block">Order Reference Number</span>
          <strong className="fs-5 text-dark">{order?.orderNumber || orderId}</strong>
        </div>

        {/* Direct Gifting Summary Box */}
        {order?.isGift && (
          <div className="card border-warning mb-4 text-start p-3 bg-white" style={{ backgroundColor: '#FFFDF9' }}>
            <h6 className="fw-bold mb-2 text-dark d-flex align-items-center gap-2">
              <i className="bi bi-gift-fill" style={{ color: 'var(--gg-terracotta)' }}></i>
              Direct Recipient Gifting Summary
            </h6>
            <div className="small text-secondary mb-1">
              <strong>Recipient:</strong> {order.recipientName} ({order.recipientPhone})
            </div>
            <div className="small text-secondary mb-1">
              <strong>Delivery Destination:</strong> {order.recipientAddress}
            </div>
            {order.giftMessage && (
              <div className="small text-secondary mb-1 p-2 rounded bg-light border mt-2">
                <strong>Gift Note Printed:</strong> "{order.giftMessage}"
              </div>
            )}
            {order.discreetPricingRequested && (
              <div className="badge bg-light text-success border mt-2">
                <i className="bi bi-shield-check me-1"></i> Discreet Packaging Confirmed (Prices Omitted)
              </div>
            )}
          </div>
        )}

        <div className="d-flex justify-content-center gap-3">
          <Link to="/" className="btn btn-terracotta">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
