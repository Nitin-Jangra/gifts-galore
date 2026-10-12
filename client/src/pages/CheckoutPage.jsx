import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function CheckoutPage() {
  const { items, subtotal, shipping, grandTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isGift, setIsGift] = useState(false);
  const [formData, setFormData] = useState({
    shippingAddress: 'House 14, Sector 7, Urban Estate, Loharu, Haryana 127201',
    recipientName: '',
    recipientPhone: '',
    recipientAddress: '',
    giftMessage: '',
    deliveryDateRequested: '',
    discreetPricingRequested: true,
  });

  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (items.length === 0) {
    return (
      <div className="container py-5 text-center flex-grow-1">
        <h3>No items to checkout</h3>
        <Link to="/" className="btn btn-terracotta mt-3">Back to Storefront</Link>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          customizationSnapshot: i.customizationSnapshot,
        })),
        isGift,
        shippingAddress: isGift ? null : formData.shippingAddress,
        recipientName: isGift ? formData.recipientName : null,
        recipientPhone: isGift ? formData.recipientPhone : null,
        recipientAddress: isGift ? formData.recipientAddress : null,
        giftMessage: isGift ? formData.giftMessage : null,
        deliveryDateRequested: isGift && formData.deliveryDateRequested ? new Date(formData.deliveryDateRequested).toISOString() : null,
        discreetPricingRequested: isGift ? formData.discreetPricingRequested : false,
      };

      const res = await api.post('/orders/checkout', payload);
      if (res.data?.order) {
        clearCart();
        navigate(`/order-confirmation/${res.data.order.id}`, { state: { order: res.data.order } });
      }
    } catch (err) {
      if (err.data?.errors) {
        setError(err.data.errors.map((e) => e.message).join(' | '));
      } else {
        setError(err.message || 'Checkout failed. Please check your address details.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-5 flex-grow-1">
      <h1 className="brand-font fw-bold mb-4">Secure Checkout</h1>

      {error && (
        <div className="alert alert-danger py-2 px-3 small mb-4">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          {/* Left Column: Delivery & Direct Gifting Details */}
          <div className="col-lg-7">
            {/* Direct Gifting Option Highlight */}
            <div className="card card-luxury p-4 border mb-4 shadow-sm" style={{ backgroundColor: isGift ? '#FFFDF9' : '#FFFFFF' }}>
              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="giftToggle"
                  checked={isGift}
                  onChange={(e) => setIsGift(e.target.checked)}
                  style={{ width: '2.8em', height: '1.4em', cursor: 'pointer' }}
                />
                <label className="form-check-label fw-bold ms-2 fs-5" htmlFor="giftToggle" style={{ cursor: 'pointer' }}>
                  <i className="bi bi-gift-fill me-2" style={{ color: 'var(--gg-terracotta)' }}></i>
                  Gift this order directly to someone else
                </label>
              </div>
              <p className="text-secondary small mb-0">
                When enabled, we deliver directly to your recipient. You can include a custom greeting card note, request a target delivery date, and ensure price tags are discreetly omitted.
              </p>
            </div>

            {/* Recipient Details Form (When isGift is Active) */}
            {isGift ? (
              <div className="card card-luxury p-4 border mb-4">
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <i className="bi bi-person-heart text-danger"></i>
                  Recipient Information
                </h5>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Recipient Full Name *</label>
                    <input
                      type="text"
                      name="recipientName"
                      className="form-control"
                      placeholder="e.g. Vikram Malhotra"
                      value={formData.recipientName}
                      onChange={handleChange}
                      required={isGift}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Recipient Phone Number *</label>
                    <input
                      type="tel"
                      name="recipientPhone"
                      className="form-control"
                      placeholder="+91 98765 43210"
                      value={formData.recipientPhone}
                      onChange={handleChange}
                      required={isGift}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold">Recipient Delivery Address *</label>
                    <textarea
                      rows="3"
                      name="recipientAddress"
                      className="form-control"
                      placeholder="Complete street address, landmark, city, state, pincode"
                      value={formData.recipientAddress}
                      onChange={handleChange}
                      required={isGift}
                    ></textarea>
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold">Personal Greeting Card Message</label>
                    <textarea
                      rows="3"
                      name="giftMessage"
                      className="form-control"
                      placeholder="Write your heartfelt note to be printed on our premium Gifts Galore greeting card..."
                      value={formData.giftMessage}
                      onChange={handleChange}
                      maxLength={500}
                    ></textarea>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Requested Delivery Date</label>
                    <input
                      type="date"
                      name="deliveryDateRequested"
                      className="form-control"
                      value={formData.deliveryDateRequested}
                      onChange={handleChange}
                    />
                    <div className="form-text small" style={{ fontSize: '0.75rem' }}>
                      Subject to artisan lead-time & courier scheduling.
                    </div>
                  </div>

                  <div className="col-md-6 d-flex align-items-center mt-4">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="discreetPriceCheck"
                        name="discreetPricingRequested"
                        checked={formData.discreetPricingRequested}
                        onChange={handleChange}
                      />
                      <label className="form-check-label small fw-semibold" htmlFor="discreetPriceCheck">
                        Discreet Packaging (Omit item prices on physical delivery invoice)
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card card-luxury p-4 border mb-4">
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <i className="bi bi-truck text-primary"></i>
                  Delivery Address (Self Delivery)
                </h5>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Shipping Address *</label>
                  <textarea
                    rows="3"
                    name="shippingAddress"
                    className="form-control"
                    value={formData.shippingAddress}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Review */}
          <div className="col-lg-5">
            <div className="card card-luxury p-4 border shadow-sm">
              <h5 className="brand-font fw-bold mb-3">Order Items ({items.length})</h5>

              <ul className="list-group list-group-flush mb-3">
                {items.map((item) => {
                  const effectivePrice = item.discountPrice || item.price;
                  return (
                    <li key={item.itemKey} className="list-group-item px-0 py-2 d-flex justify-content-between align-items-start">
                      <div>
                        <div className="fw-semibold small">{item.name}</div>
                        <div className="text-muted small">Qty: {item.quantity} × ₹{effectivePrice}</div>
                        {item.customizationSnapshot?.fields && (
                          <div className="text-primary small" style={{ fontSize: '0.75rem' }}>
                            <i className="bi bi-brush me-1"></i> Personalized
                          </div>
                        )}
                      </div>
                      <span className="fw-bold small">₹{(effectivePrice * item.quantity).toLocaleString('en-IN')}</span>
                    </li>
                  );
                })}
              </ul>

              <div className="d-flex justify-content-between mb-2 small">
                <span className="text-secondary">Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="d-flex justify-content-between mb-3 small">
                <span className="text-secondary">Shipping</span>
                <span>{shipping === 0 ? <strong className="text-success">FREE</strong> : `₹${shipping}`}</span>
              </div>

              <hr className="my-2" />

              <div className="d-flex justify-content-between mb-4">
                <span className="fw-bold">Payable Total</span>
                <span className="fs-5 fw-bold" style={{ color: 'var(--gg-terracotta)' }}>
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>

              <button
                type="submit"
                className="btn btn-terracotta w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting && <span className="spinner-border spinner-border-sm" role="status"></span>}
                <span>{isSubmitting ? 'Confirming Order...' : isGift ? 'Confirm & Send Gift Order' : 'Place Order'}</span>
              </button>

              <div className="mt-3 text-center small text-muted" style={{ fontSize: '0.75rem' }}>
                <i className="bi bi-lock-fill me-1 text-success"></i>
                PCI-Compliant Payment Gateway Tokenization (Raw card details never stored)
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
