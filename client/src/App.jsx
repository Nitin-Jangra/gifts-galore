import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StorefrontPage from './pages/StorefrontPage';
import ProductDetailPage from './pages/ProductDetailPage';
import SellerProductsPage from './pages/SellerProductsPage';

function HomePage() {
  return (
    <main className="container my-5 flex-grow-1">
      {/* Hero Banner */}
      <section className="p-5 mb-5 rounded-4" style={{ backgroundColor: '#FDF7F0', border: '1px solid #F1E5D8' }}>
        <div className="row align-items-center">
          <div className="col-lg-8">
            <span className="badge rounded-pill px-3 py-2 text-uppercase mb-3" style={{ backgroundColor: 'var(--gg-terracotta-subtle)', color: 'var(--gg-terracotta)', fontWeight: '700' }}>
              Handcrafted in Loharu, India
            </span>
            <h1 className="display-4 fw-bold mb-3" style={{ color: '#1A202C' }}>
              Memories Crafted, Emotions Delivered
            </h1>
            <p className="lead text-secondary mb-4">
              Discover ready-made artisan treasures, design custom personalized gifts, or commission bespoke, on-demand creations made just for you and your loved ones.
            </p>
            <div className="d-flex flex-wrap gap-3">
              <a href="#gifting-categories" className="btn btn-terracotta">
                Explore Gifts
              </a>
              <a href="#bespoke-info" className="btn btn-outline-terracotta">
                Custom On-Demand Requests
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Modalities of Gifting */}
      <section id="gifting-categories" className="mb-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold">Three Thoughtful Ways to Gift</h2>
          <p className="text-muted">Designed for individual joy, corporate milestones, and heartwarming surprises.</p>
        </div>

        <div className="row g-4">
          <div className="col-md-4">
            <div className="card h-100 card-luxury p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <span className="badge badge-gift-type badge-ready-made">Ready-Made</span>
                <i className="bi bi-box-seam fs-2" style={{ color: 'var(--gg-terracotta)' }}></i>
              </div>
              <h4 className="fw-bold">Ready-Made Gifts</h4>
              <p className="text-muted small">
                Pre-curated, in-stock artisan products ready for instant checkout and expedited dispatch.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 card-luxury p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <span className="badge badge-gift-type badge-customizable">Customizable</span>
                <i className="bi bi-brush fs-2" style={{ color: 'var(--gg-coral)' }}></i>
              </div>
              <h4 className="fw-bold">Personalized Gifts</h4>
              <p className="text-muted small">
                Add personalized names, heartfelt messages, or photo engravings tailored to your loved ones.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 card-luxury p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <span className="badge badge-gift-type badge-on-demand">On-Demand Bespoke</span>
                <i className="bi bi-stars fs-2" style={{ color: 'var(--gg-accent-gold)' }}></i>
              </div>
              <h4 className="fw-bold">Bespoke Requests</h4>
              <p className="text-muted small">
                Submit custom specs, budgets, and reference photos for seller quotation and feasibility review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Direct Gifting Feature Callout */}
      <section className="p-4 p-md-5 rounded-4 mb-5" style={{ backgroundColor: '#FFFDF9', border: '1px dashed var(--gg-terracotta)' }}>
        <div className="row align-items-center">
          <div className="col-lg-8">
            <h3 className="fw-bold mb-2">Sending a Gift Directly to Someone Else?</h3>
            <p className="text-secondary mb-0">
              Select "Gift this order" during checkout. We’ll package it with your custom gift card message, schedule the requested delivery date, and ensure discreet pricing.
            </p>
          </div>
          <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
            <span className="badge bg-light text-dark p-3 border shadow-sm">
              <i className="bi bi-shield-check text-success me-2"></i>
              Discreet Invoicing Supported
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<StorefrontPage />} />
          <Route path="/customizable" element={<StorefrontPage defaultType="CUSTOMIZABLE" />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/seller/products" element={<SellerProductsPage />} />
          <Route path="/seller/dashboard" element={<SellerProductsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={
            <div className="container py-5 text-center flex-grow-1">
              <h2>Page Not Found</h2>
              <p className="text-muted">The requested section is currently being constructed.</p>
            </div>
          } />
        </Routes>
        <Footer />
      </div>
    </AuthProvider>
  );
}
