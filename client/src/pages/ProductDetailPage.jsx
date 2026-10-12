import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import CustomizationForm from '../components/CustomizationForm';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customizationSnapshot, setCustomizationSnapshot] = useState(null);

  // Fallback if exploring without backend db connection
  const defaultProduct = {
    id: 'p-default',
    name: 'Custom Engraved Wooden Keepsake Box',
    slug: 'custom-engraved-wooden-keepsake-box',
    description: 'Masterfully carved from natural sheesham wood in Loharu, this keepsake box features precision brass inlay and a smooth lacquer finish. Personalize it with the recipient’s name, celebratory message, or custom date.',
    productType: 'CUSTOMIZABLE',
    price: 1499.0,
    discountPrice: 1299.0,
    stockQuantity: 12,
    availability: 'IN_STOCK',
    seller: { storeName: 'Gifts Galore', city: 'Loharu', state: 'Haryana' },
    images: [
      { imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80', isPrimary: true },
      { imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80', isPrimary: false },
    ],
  };

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await api.get(`/products/${slug}`);
        if (res.data?.product) {
          setProduct(res.data.product);
        } else {
          setProduct(defaultProduct);
        }
      } catch (err) {
        setProduct(defaultProduct);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="container py-5 text-center flex-grow-1">
        <div className="spinner-border text-warning" role="status"></div>
        <p className="text-muted mt-2">Loading gift details...</p>
      </div>
    );
  }

  const p = product || defaultProduct;
  const images = p.images && p.images.length > 0 ? p.images : [{ imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800' }];
  const currentImage = images[activeImageIndex]?.imageUrl || images[0]?.imageUrl;

  return (
    <div className="container py-5 flex-grow-1">
      {/* Breadcrumb Navigation */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-muted">Storefront</Link></li>
          <li className="breadcrumb-item"><span className="text-muted">{p.productType.replace('_', ' ')}</span></li>
          <li className="breadcrumb-item active text-dark fw-semibold" aria-current="page">{p.name}</li>
        </ol>
      </nav>

      <div className="row g-5">
        {/* Left Column: Image Gallery */}
        <div className="col-lg-6">
          <div className="card card-luxury overflow-hidden border p-2 mb-3 bg-white" style={{ minHeight: '400px' }}>
            <img
              src={currentImage}
              alt={p.name}
              className="w-100 rounded-3 object-fit-cover"
              style={{ maxHeight: '480px' }}
            />
          </div>

          {images.length > 1 && (
            <div className="d-flex gap-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`btn p-1 border rounded-2 ${activeImageIndex === idx ? 'border-danger' : 'border-light'}`}
                  style={{ width: '80px', height: '80px' }}
                  onClick={() => setActiveImageIndex(idx)}
                >
                  <img src={img.imageUrl} alt="" className="w-100 h-100 object-fit-cover rounded" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Specs & Ordering */}
        <div className="col-lg-6">
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="badge badge-gift-type badge-customizable">
              {p.productType}
            </span>
            <span className="text-muted small">
              <i className="bi bi-geo-alt-fill text-danger me-1"></i>
              {p.seller?.storeName || 'Gifts Galore'}, {p.seller?.city || 'Loharu'}
            </span>
          </div>

          <h1 className="brand-font fw-bold mb-3">{p.name}</h1>

          {/* Pricing */}
          <div className="d-flex align-items-baseline gap-3 mb-4">
            <span className="display-6 fw-bold" style={{ color: 'var(--gg-terracotta)' }}>
              ₹{Number(p.discountPrice || p.price).toLocaleString('en-IN')}
            </span>
            {p.discountPrice && (
              <span className="fs-5 text-muted text-decoration-line-through">
                ₹{Number(p.price).toLocaleString('en-IN')}
              </span>
            )}
            <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
              Inclusive of all taxes
            </span>
          </div>

          {/* Availability Status */}
          <div className="mb-4">
            {p.availability === 'MADE_TO_ORDER' ? (
              <div className="alert alert-warning py-2 px-3 small d-inline-flex align-items-center gap-2">
                <i className="bi bi-stars"></i>
                <span><strong>Made to Order:</strong> Handcrafted specifically upon customer confirmation.</span>
              </div>
            ) : p.stockQuantity > 0 ? (
              <div className="text-success small fw-semibold">
                <i className="bi bi-check-circle-fill me-1"></i> In Stock ({p.stockQuantity} ready for immediate dispatch)
              </div>
            ) : (
              <div className="text-danger small fw-semibold">
                <i className="bi bi-x-circle-fill me-1"></i> Currently Out of Stock
              </div>
            )}
          </div>

          <p className="text-secondary mb-4 leading-relaxed">{p.description}</p>

          {/* Direct Gifting Assurance Box */}
          <div className="p-3 rounded-3 mb-4" style={{ backgroundColor: '#FAF7F2', border: '1px solid #EAE3D9' }}>
            <h6 className="fw-bold mb-1 d-flex align-items-center gap-2">
              <i className="bi bi-gift-fill" style={{ color: 'var(--gg-terracotta)' }}></i>
              Direct Gifting Ready
            </h6>
            <p className="small text-muted mb-0">
              Ship directly to your recipient with custom greeting message, requested delivery date, and discreet price invoicing.
            </p>
          </div>

          {/* Action Button & Customization Section */}
          {p.productType === 'CUSTOMIZABLE' ? (
            <div>
              {customizationSnapshot ? (
                <div className="alert alert-success border p-3 mb-3 rounded-3">
                  <div className="d-flex align-items-center gap-2 mb-2 text-success fw-bold">
                    <i className="bi bi-patch-check-fill fs-5"></i>
                    <span>Personalization Confirmed & Ready</span>
                  </div>
                  <ul className="small text-secondary mb-3 ps-3">
                    {customizationSnapshot.fields?.map((f) => (
                      <li key={f.fieldId}>
                        <strong>{f.label}:</strong> {f.value}
                      </li>
                    ))}
                  </ul>
                  <button
                    className="btn btn-terracotta btn-lg w-100"
                    onClick={() => {
                      addToCart(p, 1, customizationSnapshot);
                      navigate('/cart');
                    }}
                  >
                    <i className="bi bi-bag-plus me-2"></i> Add Personalized Gift to Cart
                  </button>
                  <button
                    className="btn btn-link btn-sm text-secondary w-100 mt-2 text-decoration-none"
                    onClick={() => setCustomizationSnapshot(null)}
                  >
                    Edit Personalization
                  </button>
                </div>
              ) : (
                <CustomizationForm
                  productId={p.id}
                  onCustomizationComplete={(snapshot) => setCustomizationSnapshot(snapshot)}
                />
              )}
            </div>
          ) : p.productType === 'ON_DEMAND' ? (
            <Link to="/bespoke-request" className="btn btn-terracotta btn-lg w-100 text-center">
              <i className="bi bi-stars me-2"></i> Submit Bespoke Request
            </Link>
          ) : (
            <button
              className="btn btn-terracotta btn-lg w-100"
              disabled={p.stockQuantity === 0}
              onClick={() => {
                addToCart(p, 1, null);
                navigate('/cart');
              }}
            >
              <i className="bi bi-bag-plus me-2"></i> Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
