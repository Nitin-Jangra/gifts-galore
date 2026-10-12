import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
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
            <Link to="/login" className="btn btn-outline-terracotta">Sign In</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
