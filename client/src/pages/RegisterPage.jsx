import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      if (err.data?.errors) {
        setError(err.data.errors.map((e) => e.message).join(' | '));
      } else {
        setError(err.message || 'Registration failed. Please review your details.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-5 flex-grow-1 d-flex align-items-center justify-content-center">
      <div className="card card-luxury p-4 p-md-5 shadow-sm" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="text-center mb-4">
          <span className="fs-2" style={{ color: 'var(--gg-coral)' }}>
            <i className="bi bi-person-heart"></i>
          </span>
          <h2 className="brand-font fw-bold mt-2">Create Account</h2>
          <p className="text-muted small">Join Gifts Galore to personalize and send heartfelt gifts</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 px-3 small" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="regName" className="form-label fw-semibold small">Full Name</label>
            <input
              type="text"
              id="regName"
              name="fullName"
              className="form-control"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. Ananya Sharma"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="regEmail" className="form-label fw-semibold small">Email Address</label>
            <input
              type="email"
              id="regEmail"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              placeholder="ananya@example.com"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="regPhone" className="form-label fw-semibold small">Phone Number (Optional)</label>
            <input
              type="tel"
              id="regPhone"
              name="phone"
              className="form-control"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="regPass" className="form-label fw-semibold small">Password</label>
            <input
              type="password"
              id="regPass"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 8 chars, 1 uppercase, 1 lowercase, 1 number & 1 special"
              required
            />
            <div className="form-text small">
              Must be at least 8 characters with uppercase, lowercase, number, and special character.
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-terracotta w-100 py-2 d-flex align-items-center justify-content-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting && <span className="spinner-border spinner-border-sm" role="status"></span>}
            <span>{isSubmitting ? 'Creating Account...' : 'Register'}</span>
          </button>
        </form>

        <div className="text-center mt-4">
          <span className="text-muted small">Already have an account? </span>
          <Link to="/login" className="fw-semibold text-decoration-none" style={{ color: 'var(--gg-terracotta)' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
