import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';

export default function CustomerAccountPage() {
  const { user, logout } = useAuth();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [bespokeRequests, setBespokeRequests] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingBespoke, setLoadingBespoke] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const [approvingId, setApprovingId] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    async function loadAccountData() {
      // Fetch Orders
      try {
        const orderRes = await api.get('/orders/my-orders');
        setOrders(orderRes.data?.orders || []);
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setLoadingOrders(false);
      }

      // Fetch Bespoke
      try {
        const bespokeRes = await api.get('/bespoke/my-requests');
        setBespokeRequests(bespokeRes.data?.requests || []);
      } catch (err) {
        console.error('Failed to load bespoke requests', err);
      } finally {
        setLoadingBespoke(false);
      }
    }

    loadAccountData();
  }, [user, navigate]);

  const handleApproveQuote = async (requestId) => {
    setApprovingId(requestId);
    setActionError('');
    setActionSuccess('');
    try {
      const res = await api.post(`/bespoke/${requestId}/approve`);
      setActionSuccess('Quote approved successfully! An order has been placed with the artisan.');
      // Refresh list
      const updated = await api.get('/bespoke/my-requests');
      setBespokeRequests(updated.data?.requests || []);
      const updatedOrders = await api.get('/orders/my-orders');
      setOrders(updatedOrders.data?.orders || []);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to approve quote. Please try again.');
    } finally {
      setApprovingId(null);
    }
  };

  const handleAddToCartFromWishlist = (item) => {
    addToCart(item, 1, {});
    setActionSuccess(`Added "${item.name}" to your shopping cart!`);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  if (!user) return null;

  return (
    <div className="container py-5 flex-grow-1">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <div>
          <span className="badge bg-secondary mb-1">Gifting Customer Portal</span>
          <h1 className="brand-font fw-bold mb-0">Welcome, {user.fullName}</h1>
          <p className="text-muted small mb-0">{user.email} &bull; Account Tier: {user.role}</p>
        </div>
        <div className="d-flex gap-2 mt-3 mt-md-0">
          <Link to="/" className="btn btn-outline-terracotta">
            <i className="bi bi-gift me-1"></i> Browse Gifts
          </Link>
          <button onClick={logout} className="btn btn-outline-danger">
            <i className="bi bi-box-arrow-right me-1"></i> Sign Out
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>
          {actionSuccess}
          <button type="button" className="btn-close" onClick={() => setActionSuccess('')}></button>
        </div>
      )}

      {actionError && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {actionError}
          <button type="button" className="btn-close" onClick={() => setActionError('')}></button>
        </div>
      )}

      {/* Portal Navigation Tabs */}
      <ul className="nav nav-pills mb-4 gap-2">
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill px-4 ${activeTab === 'orders' ? 'active bg-terracotta' : 'text-dark bg-light'}`}
            onClick={() => setActiveTab('orders')}
          >
            <i className="bi bi-bag-check me-2"></i>
            Orders & Direct Gifting ({orders.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill px-4 ${activeTab === 'bespoke' ? 'active bg-terracotta' : 'text-dark bg-light'}`}
            onClick={() => setActiveTab('bespoke')}
          >
            <i className="bi bi-palette me-2"></i>
            Bespoke Commissions ({bespokeRequests.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill px-4 ${activeTab === 'wishlist' ? 'active bg-terracotta' : 'text-dark bg-light'}`}
            onClick={() => setActiveTab('wishlist')}
          >
            <i className="bi bi-heart me-2"></i>
            Wishlist ({wishlist.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-pill px-4 ${activeTab === 'profile' ? 'active bg-terracotta' : 'text-dark bg-light'}`}
            onClick={() => setActiveTab('profile')}
          >
            <i className="bi bi-shield-check me-2"></i>
            Security & Profile
          </button>
        </li>
      </ul>

      {/* Tab 1: Orders & Direct Gifting */}
      {activeTab === 'orders' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold mb-0">Your Gift Orders</h4>
            <span className="text-muted small">Tracking and gift delivery details</span>
          </div>

          {loadingOrders ? (
            <div className="text-center py-5">
              <div className="spinner-border text-terracotta" role="status"></div>
              <p className="mt-2 text-muted">Retrieving your order history...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="card card-luxury p-5 text-center">
              <div className="fs-1 text-muted mb-3"><i className="bi bi-gift"></i></div>
              <h5 className="fw-bold">No orders placed yet</h5>
              <p className="text-muted">Explore our curated collections of ready-made and handcrafted bespoke gifts.</p>
              <div className="mt-2">
                <Link to="/" className="btn btn-terracotta px-4">Find the Perfect Gift</Link>
              </div>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {orders.map((ord) => (
                <div key={ord.id} className="card card-luxury p-4 border">
                  <div className="d-flex flex-wrap justify-content-between align-items-center pb-3 border-bottom mb-3">
                    <div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-bold fs-6">Order #{ord.orderNumber || ord.id.slice(0, 8)}</span>
                        <span className={`badge ${
                          ord.status === 'DELIVERED' ? 'bg-success' :
                          ord.status === 'SHIPPED' ? 'bg-primary' :
                          ord.status === 'PROCESSING' ? 'bg-info text-dark' : 'bg-warning text-dark'
                        }`}>
                          {ord.status}
                        </span>
                        {ord.isGift && (
                          <span className="badge bg-danger-subtle text-danger border">
                            <i className="bi bi-gift-fill me-1"></i> Direct Gift Delivery
                          </span>
                        )}
                      </div>
                      <span className="text-muted small">
                        Placed on {new Date(ord.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                      </span>
                    </div>
                    <div className="text-end mt-2 mt-md-0">
                      <span className="text-muted small d-block">Total Paid</span>
                      <strong className="fs-5" style={{ color: 'var(--gg-terracotta)' }}>
                        ₹{Number(ord.totalAmount).toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>

                  {/* Direct Gifting Details Banner */}
                  {ord.isGift && (
                    <div className="p-3 mb-3 rounded-3" style={{ backgroundColor: '#FFF5F0', border: '1px dashed var(--gg-terracotta)' }}>
                      <div className="fw-bold text-dark small mb-1">
                        <i className="bi bi-envelope-heart-fill me-1" style={{ color: 'var(--gg-terracotta)' }}></i>
                        Direct Gift Recipient: {ord.recipientName} {ord.recipientPhone ? `(${ord.recipientPhone})` : ''}
                      </div>
                      {ord.giftMessage && (
                        <div className="fst-italic small text-secondary">
                          "{ord.giftMessage}"
                        </div>
                      )}
                      {ord.isDiscreet && (
                        <div className="small text-muted mt-1">
                          <i className="bi bi-shield-lock me-1"></i> Discreet Packaging Requested (Invoices omitted from parcel)
                        </div>
                      )}
                    </div>
                  )}

                  {/* Order Line Items */}
                  <div className="table-responsive">
                    <table className="table table-sm align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Item</th>
                          <th>Type</th>
                          <th>Qty</th>
                          <th className="text-end">Unit Price</th>
                          <th className="text-end">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ord.items?.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <span className="fw-semibold">{item.product?.name || item.productName || 'Handcrafted Gift'}</span>
                              {item.customizationSnapshot && (
                                <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                                  Customized: {Object.entries(item.customizationSnapshot.fields || item.customizationSnapshot)
                                    .map(([k, v]) => `${k}: ${v}`).join(' | ')}
                                </div>
                              )}
                            </td>
                            <td>
                              <span className="badge bg-light text-dark border">
                                {item.product?.type || 'GIFT'}
                              </span>
                            </td>
                            <td>{item.quantity}</td>
                            <td className="text-end">₹{Number(item.price).toLocaleString('en-IN')}</td>
                            <td className="text-end fw-semibold">₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Shipping Address */}
                  {ord.shippingAddress && (
                    <div className="mt-3 pt-2 border-top small text-muted">
                      <strong>Delivery To: </strong>
                      {typeof ord.shippingAddress === 'string'
                        ? ord.shippingAddress
                        : `${ord.shippingAddress.addressLine1 || ''}, ${ord.shippingAddress.city || ''}, ${ord.shippingAddress.state || ''} ${ord.shippingAddress.postalCode || ''}`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Bespoke Commissions */}
      {activeTab === 'bespoke' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h4 className="fw-bold mb-0">On-Demand Bespoke Commissions</h4>
              <p className="text-muted small mb-0">Handcrafted personalized requests reviewed and quoted by artisans</p>
            </div>
            <Link to="/bespoke-request" className="btn btn-outline-terracotta btn-sm">
              <i className="bi bi-plus-circle me-1"></i> Request New Custom Gift
            </Link>
          </div>

          {loadingBespoke ? (
            <div className="text-center py-5">
              <div className="spinner-border text-terracotta" role="status"></div>
              <p className="mt-2 text-muted">Loading your commissions...</p>
            </div>
          ) : bespokeRequests.length === 0 ? (
            <div className="card card-luxury p-5 text-center">
              <div className="fs-1 text-muted mb-3"><i className="bi bi-palette"></i></div>
              <h5 className="fw-bold">No bespoke requests submitted</h5>
              <p className="text-muted">Have a unique gifting concept? Submit your vision and receive direct quotes from our artisans.</p>
              <div className="mt-2">
                <Link to="/bespoke-request" className="btn btn-terracotta px-4">Commission a Bespoke Gift</Link>
              </div>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {bespokeRequests.map((req) => (
                <div key={req.id} className="card card-luxury p-4 border">
                  <div className="d-flex flex-wrap justify-content-between align-items-start mb-2">
                    <div>
                      <div className="d-flex align-items-center gap-2">
                        <h5 className="fw-bold mb-0">{req.title}</h5>
                        <span className={`badge ${
                          req.status === 'CUSTOMER_APPROVED' || req.status === 'ORDER_CREATED' ? 'bg-success' :
                          req.status === 'QUOTED' ? 'bg-warning text-dark' :
                          req.status === 'UNDER_REVIEW' ? 'bg-info text-dark' : 'bg-secondary'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <span className="text-muted small">
                        Submitted: {new Date(req.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      </span>
                    </div>

                    {/* Artisan Quote Highlights */}
                    {req.quoteAmount && (
                      <div className="text-end bg-light p-2 rounded-3 border">
                        <span className="text-muted small d-block">Artisan Quotation</span>
                        <strong className="fs-5" style={{ color: 'var(--gg-terracotta)' }}>
                          ₹{Number(req.quoteAmount).toLocaleString('en-IN')}
                        </strong>
                        <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                          Est. Crafting: {req.estimatedDays || 5} days
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-secondary small mb-3">{req.description}</p>

                  <div className="row g-2 small text-muted mb-3">
                    {req.targetBudget && (
                      <div className="col-auto">
                        <span className="badge bg-light text-dark border">
                          Target Budget: ₹{Number(req.targetBudget).toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                    {req.targetDeliveryDate && (
                      <div className="col-auto">
                        <span className="badge bg-light text-dark border">
                          Needed By: {new Date(req.targetDeliveryDate).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Artisan Quote Notes & Approval Action */}
                  {req.status === 'QUOTED' && (
                    <div className="p-3 rounded-3 bg-warning-subtle border border-warning d-flex flex-wrap justify-content-between align-items-center gap-2">
                      <div>
                        <div className="fw-bold text-dark small">
                          <i className="bi bi-bell-fill me-1"></i> Artisan Quote Ready for Review
                        </div>
                        {req.artisanNotes && (
                          <div className="small text-muted mt-1">Artisan note: {req.artisanNotes}</div>
                        )}
                      </div>
                      <button
                        className="btn btn-terracotta btn-sm px-4 fw-semibold"
                        onClick={() => handleApproveQuote(req.id)}
                        disabled={approvingId === req.id}
                      >
                        {approvingId === req.id ? 'Processing...' : 'Accept Quote & Order'}
                      </button>
                    </div>
                  )}

                  {req.status === 'CUSTOMER_APPROVED' && (
                    <div className="p-2 rounded-3 bg-success-subtle text-success small">
                      <i className="bi bi-check-circle-fill me-1"></i> Quote accepted! Our artisan is crafting this bespoke commission.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Saved Gifts (Wishlist) */}
      {activeTab === 'wishlist' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h4 className="fw-bold mb-0">Your Saved Gifts</h4>
              <p className="text-muted small mb-0">Keep track of thoughtful gift concepts for upcoming occasions</p>
            </div>
            <Link to="/" className="btn btn-outline-terracotta btn-sm">Explore More Gifts</Link>
          </div>

          {wishlist.length === 0 ? (
            <div className="card card-luxury p-5 text-center">
              <div className="fs-1 text-muted mb-3"><i className="bi bi-heart"></i></div>
              <h5 className="fw-bold">Your wishlist is empty</h5>
              <p className="text-muted">Browse our catalog and click the heart icon on any gift to save it here.</p>
              <div className="mt-2">
                <Link to="/" className="btn btn-terracotta px-4">Browse Catalog</Link>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {wishlist.map((item) => (
                <div key={item.id} className="col-md-6 col-lg-4">
                  <div className="card card-luxury h-100 border">
                    <div className="position-relative">
                      {item.primaryImageUrl ? (
                        <img
                          src={item.primaryImageUrl}
                          alt={item.name}
                          className="card-img-top"
                          style={{ height: '200px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          className="card-img-top d-flex align-items-center justify-content-center bg-light"
                          style={{ height: '200px' }}
                        >
                          <i className="bi bi-gift fs-1 text-secondary opacity-50"></i>
                        </div>
                      )}
                      <span className="position-absolute top-0 start-0 m-2 badge bg-dark bg-opacity-75">
                        {item.type}
                      </span>
                    </div>

                    <div className="card-body d-flex flex-column">
                      <h5 className="fw-bold mb-1">{item.name}</h5>
                      <div className="text-muted small mb-2">{item.sellerStoreName}</div>
                      <div className="fs-5 fw-bold mb-3" style={{ color: 'var(--gg-terracotta)' }}>
                        ₹{Number(item.price).toLocaleString('en-IN')}
                      </div>

                      <div className="mt-auto d-flex gap-2">
                        <button
                          className="btn btn-terracotta btn-sm flex-grow-1"
                          onClick={() => handleAddToCartFromWishlist(item)}
                        >
                          <i className="bi bi-bag-plus me-1"></i> Add to Cart
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeFromWishlist(item.id)}
                          title="Remove from wishlist"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Security & Profile */}
      {activeTab === 'profile' && (
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="card card-luxury p-4 border h-100">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-person-badge text-terracotta"></i>
                Account Credentials & Identity
              </h5>

              <div className="mb-3">
                <label className="text-muted small text-uppercase fw-semibold">Full Name</label>
                <div className="fs-6 fw-bold">{user.fullName}</div>
              </div>

              <div className="mb-3">
                <label className="text-muted small text-uppercase fw-semibold">Email Address</label>
                <div className="fs-6">{user.email}</div>
              </div>

              <div className="mb-3">
                <label className="text-muted small text-uppercase fw-semibold">Account Role</label>
                <div>
                  <span className="badge bg-secondary">{user.role}</span>
                </div>
              </div>

              <div className="mb-3">
                <label className="text-muted small text-uppercase fw-semibold">Account Status</label>
                <div>
                  <span className="badge bg-success">ACTIVE & SECURED</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card card-luxury p-4 border h-100">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-shield-lock-fill text-success"></i>
                Security & Privacy Architecture
              </h5>
              <ul className="list-group list-group-flush small">
                <li className="list-group-item px-0">
                  <div className="fw-semibold">Argon2id Key Derivation</div>
                  <div className="text-muted">Password credentials protected with memory-hard hashing resistant to GPU cracking.</div>
                </li>
                <li className="list-group-item px-0">
                  <div className="fw-semibold">HttpOnly SameSite Session Tokens</div>
                  <div className="text-muted">Sessions insulated against Cross-Site Scripting (XSS) credential theft.</div>
                </li>
                <li className="list-group-item px-0">
                  <div className="fw-semibold">CSRF Signature Verification</div>
                  <div className="text-muted">State-changing orders protected via cryptographic double-submit cookies.</div>
                </li>
                <li className="list-group-item px-0">
                  <div className="fw-semibold">Direct Gifting Privacy</div>
                  <div className="text-muted">Recipient data restricted to delivery carriers; discreet packaging option suppresses pricing slips.</div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
