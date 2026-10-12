import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-5 flex-grow-1 d-flex align-items-center justify-content-center">
      <div className="card card-luxury p-4 p-md-5 shadow-sm" style={{ maxWidth: '460px', width: '100%' }}>
        <div className="text-center mb-4">
          <span className="fs-2" style={{ color: 'var(--gg-terracotta)' }}>
            <i className="bi bi-gift-fill"></i>
          </span>
          <h2 className="brand-font fw-bold mt-2">Welcome Back</h2>
          <p className="text-muted small">Sign in to your Gifts Galore account</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 px-3 small" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="loginEmail" className="form-label fw-semibold small">Email Address</label>
            <input
              type="email"
              id="loginEmail"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <label htmlFor="loginPassword" className="form-label fw-semibold small">Password</label>
            </div>
            <input
              type="password"
              id="loginPassword"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-terracotta w-100 py-2 d-flex align-items-center justify-content-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting && <span className="spinner-border spinner-border-sm" role="status"></span>}
            <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="text-center mt-4">
          <span className="text-muted small">Don't have an account? </span>
          <Link to="/register" className="fw-semibold text-decoration-none" style={{ color: 'var(--gg-terracotta)' }}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
