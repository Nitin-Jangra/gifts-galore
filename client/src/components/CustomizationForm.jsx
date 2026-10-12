import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function CustomizationForm({ productId, onCustomizationComplete }) {
  const [fields, setFields] = useState([]);
  const [inputs, setInputs] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);

  // Fallback demo schema for customizable gifts
  const defaultFields = [
    {
      id: 'fld_name',
      label: 'Personalized Name or Monogram',
      instructions: 'Enter name or initials to be laser-engraved on the brass plate (up to 30 characters).',
      fieldType: 'TEXT',
      isRequired: true,
      maxLength: 30,
    },
    {
      id: 'fld_msg',
      label: 'Gift Message / Dedication',
      instructions: 'Optional heartfelt greeting to accompany your gift.',
      fieldType: 'TEXTAREA',
      isRequired: false,
      maxLength: 150,
    },
    {
      id: 'fld_font',
      label: 'Engraving Style',
      instructions: 'Select your preferred typography engraving style.',
      fieldType: 'SELECT',
      isRequired: true,
      optionsJson: ['Classic Serif', 'Modern Sans', 'Royal Calligraphy', 'Traditional Devnagari'],
    },
  ];

  useEffect(() => {
    async function loadFields() {
      try {
        const res = await api.get(`/products/${productId}/custom-fields`);
        if (res.data?.fields && res.data.fields.length > 0) {
          setFields(res.data.fields);
        } else {
          setFields(defaultFields);
        }
      } catch (err) {
        setFields(defaultFields);
      } finally {
        setLoading(false);
      }
    }
    loadFields();
  }, [productId]);

  const handleInputChange = (fieldId, value) => {
    setInputs((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidating(true);
    setError(null);

    try {
      // Validate on server
      const res = await api.post(`/products/${productId}/validate-customization`, {
        personalization: inputs,
      });

      if (res.data?.snapshot) {
        if (onCustomizationComplete) {
          onCustomizationComplete(res.data.snapshot);
        }
      }
    } catch (err) {
      setError(err.message || 'Validation failed. Please check your personalized entries.');
    } finally {
      setValidating(false);
    }
  };

  if (loading) {
    return <div className="spinner-border spinner-border-sm text-warning"></div>;
  }

  return (
    <div className="card card-luxury p-4 border mt-4 bg-white shadow-sm">
      <div className="d-flex align-items-center gap-2 mb-3">
        <i className="bi bi-brush fs-4" style={{ color: 'var(--gg-terracotta)' }}></i>
        <h5 className="fw-bold mb-0">Personalize Your Gift</h5>
      </div>

      {/* Honest Craftsmanship Notice (NO Fake Previews) */}
      <div className="alert alert-light border py-3 px-3 mb-4 small rounded-3" style={{ backgroundColor: '#FAF7F2' }}>
        <div className="d-flex gap-2">
          <i className="bi bi-info-circle-fill text-muted fs-5"></i>
          <div>
            <strong className="d-block text-dark mb-1">Authentic Craftsmanship Guarantee:</strong>
            <span className="text-secondary">
              Each personalized piece is meticulously handcrafted by artisans in Loharu according to your exact instructions.
              Because genuine materials (natural wood, brass, earthen clay) are individually sculpted, grain and tone may vary slightly from standard photos.
              We do not show automated digital previews to ensure expectations are grounded in authentic handcrafted reality.
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger py-2 px-3 small mb-3">
          <i className="bi bi-exclamation-circle-fill me-2"></i>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {fields.map((field) => {
          const val = inputs[field.id] || '';
          const currentLength = String(val).length;

          return (
            <div key={field.id} className="mb-3">
              <div className="d-flex justify-content-between align-items-baseline mb-1">
                <label className="form-label small fw-semibold mb-0">
                  {field.label} {field.isRequired && <span className="text-danger">*</span>}
                </label>
                {field.maxLength && (
                  <span className={`small ${currentLength > field.maxLength ? 'text-danger fw-bold' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>
                    {currentLength}/{field.maxLength}
                  </span>
                )}
              </div>

              {field.instructions && (
                <div className="form-text small text-muted mb-2" style={{ fontSize: '0.8rem' }}>
                  {field.instructions}
                </div>
              )}

              {field.fieldType === 'TEXT' && (
                <input
                  type="text"
                  className="form-control"
                  value={val}
                  maxLength={field.maxLength || undefined}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  required={field.isRequired}
                />
              )}

              {field.fieldType === 'TEXTAREA' && (
                <textarea
                  rows="3"
                  className="form-control"
                  value={val}
                  maxLength={field.maxLength || undefined}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  placeholder={`Write your ${field.label.toLowerCase()}...`}
                  required={field.isRequired}
                ></textarea>
              )}

              {field.fieldType === 'SELECT' && (
                <select
                  className="form-select"
                  value={val}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  required={field.isRequired}
                >
                  <option value="">-- Choose {field.label} --</option>
                  {(field.optionsJson || []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}

              {field.fieldType === 'IMAGE_UPLOAD' && (
                <div>
                  <input
                    type="file"
                    className="form-control"
                    accept={field.allowedFileTypes || 'image/jpeg,image/png,image/webp'}
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleInputChange(field.id, e.target.files[0].name);
                      }
                    }}
                    required={field.isRequired}
                  />
                  <div className="form-text small text-muted">
                    Accepted formats: JPEG, PNG, WebP (Max {field.maxFileSizeMb || 5}MB)
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <button
          type="submit"
          className="btn btn-terracotta w-100 py-2 mt-2 d-flex align-items-center justify-content-center gap-2"
          disabled={validating}
        >
          {validating && <span className="spinner-border spinner-border-sm" role="status"></span>}
          <span>{validating ? 'Verifying Specifications...' : 'Confirm Personalization Details'}</span>
        </button>
      </form>
    </div>
  );
}
