import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function BespokeRequestPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    sellerId: 'seller_loharu_101', // Default assigned to Gifts Galore, Loharu
    occasion: 'Wedding Anniversary',
    recipientNotes: '',
    budgetRange: '₹3,000 - ₹5,000',
    targetDate: '',
    description: '',
    contactPreference: 'EMAIL',
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!user) {
      setError('Please sign in or create an account to submit a bespoke gift commission.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        targetDate: formData.targetDate ? new Date(formData.targetDate).toISOString() : null,
      };

      const res = await api.post('/bespoke', payload);
      if (res.data?.request) {
        setSuccess(res.data.request);
      }
    } catch (err) {
      if (err.data?.errors) {
        setError(err.data.errors.map((e) => e.message).join(' | '));
      } else {
        setError(err.message || 'Submission failed. Please check your notes.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-5 flex-grow-1">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="text-center mb-5">
            <span className="badge rounded-pill px-3 py-2 text-uppercase mb-2" style={{ backgroundColor: 'var(--gg-terracotta-subtle)', color: 'var(--gg-terracotta)', fontWeight: '700' }}>
              On-Demand Bespoke Commissions
            </span>
            <h1 className="brand-font fw-bold">Commission an Artisan Masterpiece</h1>
            <p className="text-secondary">
              Collaborate directly with our master craftsmen in Loharu to design completely custom giftware.
            </p>
          </div>

          {/* Workflow Steps Indicator */}
          <div className="card card-luxury p-3 border mb-4 bg-white">
            <h6 className="fw-bold mb-3 text-center small text-uppercase text-muted">The Bespoke Quotation Process</h6>
            <div className="d-flex justify-content-between text-center small">
              <div className="flex-fill">
                <span className="badge bg-dark rounded-circle p-2 mb-1">1</span>
                <div className="fw-semibold">Submit Vision</div>
              </div>
              <div className="text-muted align-self-center">→</div>
              <div className="flex-fill">
                <span className="badge bg-secondary rounded-circle p-2 mb-1">2</span>
                <div className="fw-semibold">Artisan Review</div>
              </div>
              <div className="text-muted align-self-center">→</div>
              <div className="flex-fill">
                <span className="badge bg-secondary rounded-circle p-2 mb-1">3</span>
                <div className="fw-semibold">Receive Quotation</div>
              </div>
              <div className="text-muted align-self-center">→</div>
              <div className="flex-fill">
                <span className="badge bg-secondary rounded-circle p-2 mb-1">4</span>
                <div className="fw-semibold">Approve & Order</div>
              </div>
            </div>
          </div>

          {success ? (
            <div className="card card-luxury p-5 text-center border-success">
              <i className="bi bi-patch-check-fill fs-1 text-success mb-3"></i>
              <h3 className="brand-font fw-bold">Bespoke Request Submitted!</h3>
              <p className="text-secondary small mb-3">
                Your bespoke commission has been assigned to <strong>Gifts Galore Artisans, Loharu</strong>.
                Our team will assess feasibility, material requirements, and lead-time, then send you a custom quotation.
              </p>
              <div className="p-3 bg-light rounded-3 d-inline-block mx-auto mb-4 small">
                Request ID: <strong>{success.id}</strong> | Status: <span className="badge bg-primary">UNDER REVIEW</span>
              </div>
              <div>
                <Link to="/" className="btn btn-terracotta">Return to Storefront</Link>
              </div>
            </div>
          ) : (
            <div className="card card-luxury p-4 p-md-5 border shadow-sm">
              {error && (
                <div className="alert alert-danger py-2 px-3 small mb-4">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Occasion / Milestone *</label>
                    <select
                      name="occasion"
                      className="form-select"
                      value={formData.occasion}
                      onChange={handleChange}
                      required
                    >
                      <option value="Wedding Anniversary">Wedding Anniversary</option>
                      <option value="Wedding / Engagement">Wedding / Engagement</option>
                      <option value="Milestone Birthday">Milestone Birthday</option>
                      <option value="Corporate / Executive Award">Corporate / Executive Award</option>
                      <option value="Housewarming Ceremony">Housewarming Ceremony</option>
                      <option value="Retirement Farewell">Retirement Farewell</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Intended Recipient *</label>
                    <input
                      type="text"
                      name="recipientNotes"
                      className="form-control"
                      placeholder="e.g. My parents, corporate client, partner"
                      value={formData.recipientNotes}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Target Budget Range *</label>
                    <select
                      name="budgetRange"
                      className="form-select"
                      value={formData.budgetRange}
                      onChange={handleChange}
                    >
                      <option value="₹2,000 - ₹5,000">₹2,000 - ₹5,000</option>
                      <option value="₹5,000 - ₹10,000">₹5,000 - ₹10,000</option>
                      <option value="₹10,000 - ₹25,000">₹10,000 - ₹25,000</option>
                      <option value="₹25,000+ Luxury Commission">₹25,000+ Luxury Commission</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Required By Date (Optional)</label>
                    <input
                      type="date"
                      name="targetDate"
                      className="form-control"
                      value={formData.targetDate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold">Detailed Vision & Specifications *</label>
                    <textarea
                      rows="4"
                      name="description"
                      className="form-control"
                      placeholder="Describe the materials (brass, carved wood, ceramic, silver inlay), engraving inscriptions, preferred themes, and dimensions..."
                      value={formData.description}
                      onChange={handleChange}
                      required
                    ></textarea>
                    <div className="form-text small">Minimum 15 characters. The more detail you provide, the faster our artisans can provide an accurate quotation.</div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Contact Preference</label>
                    <select
                      name="contactPreference"
                      className="form-select"
                      value={formData.contactPreference}
                      onChange={handleChange}
                    >
                      <option value="EMAIL">Email Updates</option>
                      <option value="PHONE">Direct Phone Call</option>
                      <option value="WHATSAPP">WhatsApp Messaging</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    type="submit"
                    className="btn btn-terracotta w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <span className="spinner-border spinner-border-sm" role="status"></span>}
                    <span>{isSubmitting ? 'Submitting to Artisans...' : 'Submit Bespoke Request for Quotation'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
