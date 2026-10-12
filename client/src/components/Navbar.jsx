import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-gg sticky-top py-3">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2 text-decoration-none" to="/">
          <span className="fs-3" style={{ color: 'var(--gg-terracotta)' }}>
            <i className="bi bi-gift-fill"></i>
          </span>
          <span className="brand-font fs-3 fw-bold text-dark">Gifts Galore</span>
        </Link>
        <button
          className="navbar-toggler"
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
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
            <li className="nav-item">
              <Link className="nav-link fw-semibold px-3" to="/">Storefront</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-semibold px-3" to="/customizable">Customizable Gifts</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-semibold px-3" to="/bespoke-request">On-Demand Bespoke</Link>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3">
            <Link to="/cart" className="btn btn-outline-secondary position-relative rounded-pill px-3 py-1">
              <i className="bi bi-bag me-1"></i> Cart
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                0
              </span>
            </Link>

            {user ? (
              <div className="dropdown">
                <button
                  className="btn btn-outline-terracotta dropdown-toggle d-flex align-items-center gap-2"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle"></i>
                  <span>{user.fullName.split(' ')[0]}</span>
                  <span className="badge bg-secondary ms-1 small" style={{ fontSize: '0.65rem' }}>{user.role}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow-sm" aria-labelledby="userDropdown">
                  <li><span className="dropdown-item-text small text-muted">{user.email}</span></li>
                  <li><hr className="dropdown-divider" /></li>
                  {user.role === 'SELLER' && (
                    <li><Link className="dropdown-item" to="/seller/dashboard"><i className="bi bi-shop me-2"></i>Seller Portal</Link></li>
                  )}
                  {user.role === 'ADMIN' && (
                    <li><Link className="dropdown-item" to="/admin/dashboard"><i className="bi bi-speedometer2 me-2"></i>Admin Dashboard</Link></li>
                  )}
                  <li><Link className="dropdown-item" to="/account"><i className="bi bi-person me-2"></i>My Profile</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={logout}>
                      <i className="bi bi-box-arrow-right me-2"></i>Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-outline-terracotta">Sign In</Link>
                <Link to="/register" className="btn btn-terracotta">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
