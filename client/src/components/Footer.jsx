import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer-gg pt-5 pb-4 mt-auto">
      <div className="container">
        <div className="row g-4 mb-4">
          {/* Brand & Cultural Heritage */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="fs-3" style={{ color: 'var(--gg-primary)' }}>
                <i className="bi bi-gift-fill"></i>
              </span>
              <span className="brand-font fs-3 fw-bold text-white">Gifts Galore</span>
            </div>
            <p className="small text-secondary mb-3 leading-relaxed">
              Curated gift marketplace empowering verified generational artisans in Loharu, Haryana. 
              Celebrating handcrafted bell metal brassware, bespoke engraved woodwork, and authentic celebration keepsakes.
            </p>
            <div className="d-flex align-items-center gap-2 text-secondary small">
              <i className="bi bi-geo-alt-fill text-danger"></i>
              <span>Artisan Workshops: Loharu, Bhiwani District, Haryana, India</span>
            </div>
          </div>

          {/* Direct Gifting Capabilities */}
          <div className="col-lg-2 col-md-6">
            <h6 className="text-white fw-bold mb-3 font-title-sm text-uppercase small" style={{ letterSpacing: '0.05em' }}>
              Gifting Modalities
            </h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 mb-0">
              <li><Link to="/" className="text-secondary text-decoration-none hover-white">Ready-Made Gifts</Link></li>
              <li><Link to="/customizable" className="text-secondary text-decoration-none hover-white">Personalized Keepsakes</Link></li>
              <li><Link to="/bespoke-request" className="text-secondary text-decoration-none hover-white">On-Demand Bespoke</Link></li>
              <li><Link to="/cart" className="text-secondary text-decoration-none hover-white">Direct Gifting Delivery</Link></li>
              <li><Link to="/account" className="text-secondary text-decoration-none hover-white">Saved Wishlist</Link></li>
            </ul>
          </div>

          {/* Customer & Artisan Governance */}
          <div className="col-lg-3 col-md-6">
            <h6 className="text-white fw-bold mb-3 font-title-sm text-uppercase small" style={{ letterSpacing: '0.05em' }}>
              Security & Assurance
            </h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 text-secondary mb-0">
              <li><i className="bi bi-shield-check text-success me-2"></i>Argon2id Key Derivation</li>
              <li><i className="bi bi-cookie text-success me-2"></i>HttpOnly SameSite Sessions</li>
              <li><i className="bi bi-box-seam text-warning me-2"></i>Discreet Packaging Options</li>
              <li><i className="bi bi-patch-check text-info me-2"></i>Authentic Artisan Verifications</li>
            </ul>
          </div>

          {/* Artisan Collective Callout */}
          <div className="col-lg-3 col-md-6">
            <div className="p-3 rounded-3" style={{ backgroundColor: '#2E2725', border: '1px solid #433936' }}>
              <div className="d-flex align-items-center gap-2 mb-2">
                <i className="bi bi-shop text-warning fs-5"></i>
                <h6 className="fw-bold text-white mb-0">Artisan Sellers</h6>
              </div>
              <p className="small text-secondary mb-2">
                Are you a heritage artisan or workshop in Haryana? Join our closed curated collective.
              </p>
              <Link to="/register" className="btn btn-outline-light btn-sm rounded-pill w-100">
                Artisan Inquiries
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-3 border-top border-secondary border-opacity-25 d-flex flex-wrap justify-content-between align-items-center small text-secondary">
          <div>
            &copy; {new Date().getFullYear()} Gifts Galore. Handcrafted with reverence in Loharu, India. All rights reserved.
          </div>
          <div className="d-flex gap-3 mt-2 mt-md-0">
            <span>Direct Gifting Ready</span>
            <span>&bull;</span>
            <span>Zero Fake 3D Previews</span>
            <span>&bull;</span>
            <span>Transparent Artisan Pricing</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
