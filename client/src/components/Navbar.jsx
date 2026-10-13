import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemsCount } = useCart();
  const { wishlist } = useWishlist();
  const location = useLocation();

  return (
    <>
      {/* Stitch Heritage Top Announcement Bar */}
      <div className="py-1 px-3 text-center text-white small" style={{ backgroundColor: 'var(--gg-on-surface)', fontSize: '0.78rem', letterSpacing: '0.02em' }}>
        <span>
          <i className="bi bi-stars me-1 text-warning"></i>
          Handcrafted in Loharu, Haryana &bull; 100% Verified Artisan Collective &bull; Direct Gifting & Scheduled Delivery Available
        </span>
      </div>

      <nav className="navbar navbar-expand-lg navbar-gg sticky-top py-2 shadow-xs">
        <div className="container">
          {/* Brand Identity & Location Geotag from Stitch */}
          <Link className="navbar-brand d-flex align-items-center gap-2 text-decoration-none" to="/">
            <span className="fs-3 d-flex align-items-center justify-content-center rounded-circle" style={{ width: '42px', height: '42px', backgroundColor: 'var(--gg-primary-fixed)', color: 'var(--gg-primary)' }}>
              <i className="bi bi-gift-fill"></i>
            </span>
            <div className="d-flex flex-column">
              <span className="brand-font fs-3 fw-bold text-dark lh-1">Gifts Galore</span>
              <div className="d-flex align-items-center gap-1 mt-1" style={{ fontSize: '0.72rem', color: 'var(--gg-on-surface-variant)' }}>
                <i className="bi bi-geo-alt-fill text-danger"></i>
                <span className="fw-semibold">Loharu, Haryana</span>
                <span className="badge rounded-pill bg-light text-dark border ms-1" style={{ fontSize: '0.65rem' }}>
                  <i className="bi bi-patch-check-fill text-success me-1"></i> Artisan Collective
                </span>
              </div>
            </div>
          </Link>

          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarContent"
            aria-controls="navbarContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarContent">
            {/* Center Navigation Links */}
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link
                  className={`nav-link px-3 fw-semibold rounded-pill ${location.pathname === '/' ? 'text-primary' : 'text-dark'}`}
                  to="/"
                >
                  <i className="bi bi-grid me-1"></i> Storefront
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link px-3 fw-semibold rounded-pill ${location.pathname === '/customizable' ? 'text-primary' : 'text-dark'}`}
                  to="/customizable"
                >
                  <i className="bi bi-brush me-1"></i> Customizable Gifts
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link px-3 fw-semibold rounded-pill ${location.pathname === '/bespoke-request' ? 'text-primary' : 'text-dark'}`}
                  to="/bespoke-request"
                >
                  <i className="bi bi-stars me-1"></i> On-Demand Bespoke
                </Link>
              </li>
            </ul>

            {/* Right Action Icons & Auth */}
            <div className="d-flex align-items-center gap-2">
              <Link
                to="/account"
                className="btn btn-outline-secondary position-relative rounded-pill px-3 py-1.5 d-flex align-items-center gap-1.5"
                title="Saved Gifts Wishlist"
              >
                <i className="bi bi-heart text-danger"></i>
                <span className="small d-none d-md-inline font-semibold">Wishlist</span>
                {wishlist.length > 0 && (
                  <span className="badge rounded-pill bg-danger ms-1" style={{ fontSize: '0.65rem' }}>
                    {wishlist.length}
                  </span>
                )}
              </Link>

              <Link
                to="/cart"
                className="btn btn-outline-secondary position-relative rounded-pill px-3 py-1.5 d-flex align-items-center gap-1.5"
                title="Curated Gift Bag"
              >
                <i className="bi bi-bag" style={{ color: 'var(--gg-primary)' }}></i>
                <span className="small d-none d-md-inline font-semibold">Parcel</span>
                {itemsCount > 0 && (
                  <span className="badge rounded-pill text-white ms-1" style={{ backgroundColor: 'var(--gg-primary)', fontSize: '0.65rem' }}>
                    {itemsCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="dropdown ms-1">
                  <button
                    className="btn btn-outline-terracotta dropdown-toggle d-flex align-items-center gap-2 py-1 px-3 rounded-pill"
                    type="button"
                    id="userDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="bi bi-person-circle"></i>
                    <span className="small fw-semibold">{user.fullName.split(' ')[0]}</span>
                    <span className="badge bg-secondary ms-1 small" style={{ fontSize: '0.65rem' }}>{user.role}</span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow-md border-0 rounded-3 mt-2" aria-labelledby="userDropdown">
                    <li><span className="dropdown-item-text small text-muted">{user.email}</span></li>
                    <li><hr className="dropdown-divider" /></li>
                    {user.role === 'SELLER' && (
                      <li>
                        <Link className="dropdown-item" to="/seller/dashboard">
                          <i className="bi bi-shop me-2 text-warning"></i>Seller Portal
                        </Link>
                      </li>
                    )}
                    {user.role === 'ADMIN' && (
                      <li>
                        <Link className="dropdown-item" to="/admin/dashboard">
                          <i className="bi bi-speedometer2 me-2 text-danger"></i>Admin Dashboard
                        </Link>
                      </li>
                    )}
                    <li>
                      <Link className="dropdown-item" to="/account">
                        <i className="bi bi-person me-2 text-primary"></i>My Account & Orders
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item text-danger" onClick={logout}>
                        <i className="bi bi-box-arrow-right me-2"></i>Sign Out
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="d-flex align-items-center gap-2 ms-1">
                  <Link to="/login" className="btn btn-outline-terracotta btn-sm px-3">Sign In</Link>
                  <Link to="/register" className="btn btn-terracotta btn-sm px-3">Join</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
