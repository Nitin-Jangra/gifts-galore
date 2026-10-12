import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, subtotal, shipping, grandTotal, itemsCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="container py-5 text-center flex-grow-1">
        <div className="card card-luxury p-5 max-w-md mx-auto" style={{ maxWidth: '500px' }}>
          <i className="bi bi-bag-x fs-1 text-muted mb-3"></i>
          <h3 className="brand-font fw-bold">Your Cart is Empty</h3>
          <p className="text-secondary small mb-4">
            Explore ready-made artisan treasures or personalize gifts for someone special.
          </p>
          <Link to="/" className="btn btn-terracotta">
            Explore Gifts Galore
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 flex-grow-1">
      <h1 className="brand-font fw-bold mb-4">Shopping Cart ({itemsCount})</h1>

      <div className="row g-4">
        {/* Cart Items List */}
        <div className="col-lg-8">
          <div className="card card-luxury border overflow-hidden">
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Item Details</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const effectivePrice = item.discountPrice || item.price;
                    return (
                      <tr key={item.itemKey}>
                        <td>
                          <div className="d-flex align-items-center gap-3 py-2">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="rounded object-fit-cover"
                                style={{ width: '64px', height: '64px' }}
                              />
                            ) : (
                              <div
                                className="rounded d-flex align-items-center justify-content-center bg-light text-muted"
                                style={{ width: '64px', height: '64px' }}
                              >
                                <i className="bi bi-gift fs-4"></i>
                              </div>
                            )}
                            <div>
                              <Link to={`/products/${item.slug}`} className="text-dark fw-bold text-decoration-none small">
                                {item.name}
                              </Link>
                              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                Seller: {item.sellerName}
                              </div>

                              {/* Customization Details Snapshot Badge */}
                              {item.customizationSnapshot?.fields && (
                                <div className="mt-2 p-2 rounded bg-light border" style={{ fontSize: '0.75rem' }}>
                                  <strong className="text-primary d-block mb-1">
                                    <i className="bi bi-brush me-1"></i> Personalized Specifications:
                                  </strong>
                                  <ul className="mb-0 ps-3">
                                    {item.customizationSnapshot.fields.map((f, i) => (
                                      <li key={i}>
                                        <span className="text-muted">{f.label}:</span>{' '}
                                        <span className="fw-semibold text-dark">{f.value}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="small fw-semibold">₹{effectivePrice.toLocaleString('en-IN')}</td>
                        <td>
                          <div className="d-flex align-items-center border rounded" style={{ width: '90px' }}>
                            <button
                              className="btn btn-sm btn-link text-dark text-decoration-none px-2"
                              onClick={() => updateQuantity(item.itemKey, item.quantity - 1)}
                            >
                              -
                            </button>
                            <span className="flex-grow-1 text-center small fw-bold">{item.quantity}</span>
                            <button
                              className="btn btn-sm btn-link text-dark text-decoration-none px-2"
                              onClick={() => updateQuantity(item.itemKey, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="small fw-bold text-end" style={{ color: 'var(--gg-terracotta)' }}>
                          ₹{(effectivePrice * item.quantity).toLocaleString('en-IN')}
                        </td>
                        <td className="text-end">
                          <button
                            className="btn btn-sm text-danger"
                            onClick={() => removeFromCart(item.itemKey)}
                            title="Remove item"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Order Summary & Direct Gifting Teaser */}
        <div className="col-lg-4">
          <div className="card card-luxury p-4 border">
            <h5 className="brand-font fw-bold mb-3">Order Summary</h5>

            <div className="d-flex justify-content-between mb-2 small">
              <span className="text-secondary">Subtotal</span>
              <span className="fw-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>

            <div className="d-flex justify-content-between mb-3 small">
              <span className="text-secondary">Shipping</span>
              <span className="fw-semibold">
                {shipping === 0 ? <span className="text-success">FREE</span> : `₹${shipping}`}
              </span>
            </div>

            {subtotal < 999 && (
              <div className="alert alert-warning py-2 px-3 small mb-3" style={{ fontSize: '0.75rem' }}>
                Add ₹{(999 - subtotal).toLocaleString('en-IN')} more to unlock <strong>FREE delivery</strong>.
              </div>
            )}

            <hr className="my-3" />

            <div className="d-flex justify-content-between mb-4">
              <span className="fw-bold">Total</span>
              <span className="fs-5 fw-bold" style={{ color: 'var(--gg-terracotta)' }}>
                ₹{grandTotal.toLocaleString('en-IN')}
              </span>
            </div>

            <Link to="/checkout" className="btn btn-terracotta w-100 py-2 d-flex align-items-center justify-content-center gap-2">
              <i className="bi bi-gift me-1"></i> Proceed to Checkout
            </Link>

            <div className="mt-3 text-center">
              <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                <i className="bi bi-shield-check text-success me-1"></i>
                Direct recipient delivery available at checkout
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
