import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer-gg py-5 mt-auto">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <h5 className="brand-font text-white mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-gift-fill" style={{ color: 'var(--gg-coral)' }}></i>
              Gifts Galore
            </h5>
            <p className="text-secondary small">
              Headquartered in Loharu, India. A premier multi-vendor gift marketplace delivering ready-made, personalized, and on-demand bespoke treasures crafted to perfection.
            </p>
          </div>
          <div className="col-lg-2 col-md-6">
            <h6 className="text-uppercase text-white fw-bold small mb-3">Gifting</h6>
            <ul className="list-unstyled text-secondary small mb-0">
              <li className="mb-2"><Link to="/" className="text-secondary text-decoration-none">Ready-Made Gifts</Link></li>
              <li className="mb-2"><Link to="/customizable" className="text-secondary text-decoration-none">Personalized Gifts</Link></li>
              <li className="mb-2"><Link to="/bespoke-request" className="text-secondary text-decoration-none">Bespoke Requests</Link></li>
            </ul>
          </div>
          <div className="col-lg-3 col-md-6">
            <h6 className="text-uppercase text-white fw-bold small mb-3">Customer Support</h6>
            <ul className="list-unstyled text-secondary small mb-0">
              <li className="mb-2"><span className="text-secondary">Location: Loharu, Haryana, India</span></li>
              <li className="mb-2"><span className="text-secondary">Direct Gifting Delivery Support</span></li>
              <li className="mb-2"><span className="text-secondary">Discreet Pricing & Packing</span></li>
            </ul>
          </div>
          <div className="col-lg-3 col-md-6">
            <h6 className="text-uppercase text-white fw-bold small mb-3">Security & Trust</h6>
            <p className="text-secondary small mb-0">
              Protected with modern encryption, tamper-proof session tokens, strict RBAC, and zero client credential leakage.
            </p>
          </div>
        </div>
        <hr className="my-4 border-secondary opacity-25" />
        <div className="text-center text-secondary small">
          © {new Date().getFullYear()} Gifts Galore. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
