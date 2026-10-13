import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import CustomizationForm from '../components/CustomizationForm';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedFinish, setSelectedFinish] = useState('Antique Sheesham');
  const [loading, setLoading] = useState(true);
  const [customizationSnapshot, setCustomizationSnapshot] = useState(null);

  // Fallback product matching Stitch screen if navigating offline
  const defaultProduct = {
    id: 'p-default',
    name: 'Custom Engraved Sheesham Keepsake Memory Box',
    slug: 'custom-engraved-wooden-keepsake-box',
    description: 'Masterfully carved from seasoned natural sheesham wood in Loharu, Haryana. This keepsake memory chest features precision hand-carved floral motifs, solid brass latching, and a natural beeswax luster. Personalize it with the recipient’s name, celebratory message, or custom date.',
    productType: 'CUSTOMIZABLE',
    price: 1499.0,
    discountPrice: 1350.0,
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
        <div className="spinner-border text-terracotta" role="status"></div>
        <p className="text-muted mt-2">Loading artisan gift specifications...</p>
      </div>
    );
  }

  const p = product || defaultProduct;
  const images = p.images && p.images.length > 0 ? p.images : [{ imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800' }];
  const currentImage = images[activeImageIndex]?.imageUrl || images[0]?.imageUrl;
  const wishlisted = isInWishlist(p.id);

  return (
    <div className="container py-5 flex-grow-1">
      {/* Stitch Breadcrumbs */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb small text-muted">
          <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-muted">Storefront</Link></li>
          <li className="breadcrumb-item">
            <span className="text-muted">{p.productType ? p.productType.replace('_', ' ') : 'GIFT'}</span>
          </li>
          <li className="breadcrumb-item active text-dark fw-semibold" aria-current="page">{p.name}</li>
        </ol>
      </nav>

      <div className="row g-5">
        {/* Left Column: Gallery from Stitch */}
        <div className="col-lg-6">
          <div className="card card-luxury overflow-hidden border p-2 mb-3 bg-white position-relative" style={{ minHeight: '440px' }}>
            <img
              src={currentImage}
              alt={p.name}
              className="w-100 rounded-3 object-fit-cover shadow-xs"
              style={{ maxHeight: '480px' }}
            />
            {/* Wishlist button */}
            <button
              type="button"
              className="btn btn-sm position-absolute top-0 end-0 m-3 rounded-circle bg-white shadow-sm p-0 d-flex align-items-center justify-content-center"
              style={{ width: '40px', height: '40px', border: 'none' }}
              title={wishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
              onClick={() => toggleWishlist({ ...p, primaryImageUrl: currentImage })}
            >
              <i className={`bi ${wishlisted ? 'bi-heart-fill text-danger fs-5' : 'bi-heart text-secondary fs-5'}`}></i>
            </button>
          </div>

          {images.length > 1 && (
            <div className="d-flex gap-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`btn p-1 border rounded-3 ${activeImageIndex === idx ? 'border-2' : 'border-light'}`}
                  style={{
                    width: '84px',
                    height: '84px',
                    borderColor: activeImageIndex === idx ? 'var(--gg-primary)' : '#E2E8F0',
                  }}
                  onClick={() => setActiveImageIndex(idx)}
                >
                  <img src={img.imageUrl} alt="" className="w-100 h-100 object-fit-cover rounded-2" />
                </button>
              ))}
            </div>
          )}

          {/* Stitch Artisan Collective Guarantee Card */}
          <div className="card card-luxury p-3 border mt-4" style={{ backgroundColor: 'var(--gg-surface-container-low)' }}>
            <div className="d-flex align-items-center gap-3">
              <span className="fs-2 text-warning"><i className="bi bi-shield-check"></i></span>
              <div>
                <h6 className="fw-bold mb-0">100% Loharu Artisan Authenticity</h6>
                <p className="small text-muted mb-0">
                  Every gift is handcrafted in our verified Loharu workshops. Shipped directly to your recipient.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Specs, Customization & Ordering */}
        <div className="col-lg-6">
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className={`badge badge-gift-type ${
              p.productType === 'CUSTOMIZABLE' ? 'badge-customizable' :
              p.productType === 'ON_DEMAND' ? 'badge-on-demand' : 'badge-ready-made'
            }`}>
              {p.productType ? p.productType.replace('_', ' ') : 'GIFT'}
            </span>
            <span className="text-secondary small fw-semibold">
              <i className="bi bi-geo-alt-fill text-danger me-1"></i>
              {p.seller?.storeName || 'Gifts Galore'}, {p.seller?.city || 'Loharu'}
            </span>
          </div>

          <h1 className="brand-font display-6 fw-bold mb-3">{p.name}</h1>

          {/* Pricing Section */}
          <div className="d-flex align-items-baseline gap-3 mb-3 p-3 rounded-3" style={{ backgroundColor: 'var(--gg-surface-container)' }}>
            <span className="display-6 fw-bold" style={{ color: 'var(--gg-primary)' }}>
              ₹{Number(p.discountPrice || p.price).toLocaleString('en-IN')}
            </span>
            {p.discountPrice && (
              <span className="fs-5 text-muted text-decoration-line-through">
                ₹{Number(p.price).toLocaleString('en-IN')}
              </span>
            )}
            <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 ms-auto">
              Inclusive of GST & Artisan Fair Trade
            </span>
          </div>

          {/* Availability Status */}
          <div className="mb-3">
            {p.availability === 'MADE_TO_ORDER' ? (
              <div className="alert alert-warning py-2 px-3 small d-inline-flex align-items-center gap-2 rounded-pill">
                <i className="bi bi-stars"></i>
                <span><strong>Made to Order:</strong> Handcrafted individually upon confirmation (3-5 business days).</span>
              </div>
            ) : p.stockQuantity > 0 ? (
              <div className="text-success small fw-semibold">
                <i className="bi bi-check-circle-fill me-1"></i> In Stock ({p.stockQuantity} ready for immediate dispatch from Loharu)
              </div>
            ) : (
              <div className="text-danger small fw-semibold">
                <i className="bi bi-x-circle-fill me-1"></i> Currently Out of Stock
              </div>
            )}
          </div>

          <p className="text-secondary mb-4 leading-relaxed">{p.description}</p>

          {/* Finish Selector for Handcrafted items */}
          {p.productType === 'CUSTOMIZABLE' && (
            <div className="mb-4">
              <label className="fw-semibold small text-uppercase text-secondary d-block mb-2">
                Handcrafted Finish Selection
              </label>
              <div className="d-flex gap-2">
                {['Antique Sheesham', 'Natural Honey Teak', 'Polished Brass Inlay'].map((finish) => (
                  <button
                    key={finish}
                    type="button"
                    className={`btn btn-sm rounded-pill px-3 py-1.5 ${
                      selectedFinish === finish ? 'btn-terracotta' : 'btn-outline-secondary'
                    }`}
                    onClick={() => setSelectedFinish(finish)}
                  >
                    {finish}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Direct Gifting Assurance Banner */}
          <div className="p-3 rounded-3 mb-4" style={{ backgroundColor: 'var(--gg-primary-fixed)', border: '1px solid var(--gg-primary)' }}>
            <h6 className="fw-bold mb-1 d-flex align-items-center gap-2" style={{ color: 'var(--gg-on-primary-fixed)' }}>
              <i className="bi bi-gift-fill" style={{ color: 'var(--gg-primary)' }}></i>
              Direct Gifting Ready
            </h6>
            <p className="small mb-0" style={{ color: 'var(--gg-on-primary-fixed)' }}>
              Ship directly to your recipient with handwritten greeting cards, scheduled occasion arrival, and discreet pricing slips.
            </p>
          </div>

          {/* Action / Customization Section */}
          {p.productType === 'CUSTOMIZABLE' ? (
            <div>
              {customizationSnapshot ? (
                <div className="alert alert-success border p-3 mb-3 rounded-3 shadow-xs">
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
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-terracotta btn-lg flex-grow-1"
                      onClick={() => {
                        addToCart(p, 1, { ...customizationSnapshot, finish: selectedFinish });
                        navigate('/cart');
                      }}
                    >
                      <i className="bi bi-bag-plus me-2"></i> Add Personalized Gift to Parcel
                    </button>
                  </div>
                  <button
                    className="btn btn-link btn-sm text-secondary w-100 mt-2 text-decoration-none"
                    onClick={() => setCustomizationSnapshot(null)}
                  >
                    Edit Personalization
                  </button>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="p-3 mb-3 rounded-3 bg-light border small text-secondary">
                    <i className="bi bi-info-circle-fill text-primary me-2"></i>
                    <strong>Artisan Engraving Notice:</strong> Please provide your required personalization details below.
                    Our artisans hand-carve/engrave each piece in Loharu with traditional serif typographic spacing.
                  </div>
                  <CustomizationForm
                    productId={p.id}
                    onCustomizationComplete={(snapshot) => setCustomizationSnapshot(snapshot)}
                  />
                </div>
              )}
            </div>
          ) : p.productType === 'ON_DEMAND' ? (
            <div className="d-flex flex-column gap-2 mb-4">
              <Link to="/bespoke-request" className="btn btn-terracotta btn-lg w-100 text-center">
                <i className="bi bi-stars me-2"></i> Submit Bespoke Commission Request
              </Link>
            </div>
          ) : (
            <div className="d-flex gap-2 mb-4">
              <button
                className="btn btn-terracotta btn-lg flex-grow-1"
                disabled={p.stockQuantity === 0}
                onClick={() => {
                  addToCart(p, 1, null);
                  navigate('/cart');
                }}
              >
                <i className="bi bi-bag-plus me-2"></i> Add Gift to Parcel
              </button>
            </div>
          )}

          {/* Stitch Accordion: Craftsmanship Details & Care */}
          <div className="accordion accordion-flush border rounded-3 mt-4" id="artisanSpecsAccordion">
            <div className="accordion-item">
              <h2 className="accordion-header" id="flush-headingOne">
                <button className="accordion-button collapsed fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseOne">
                  <i className="bi bi-hammer me-2 text-primary"></i> Craftsmanship & Materials
                </button>
              </h2>
              <div id="flush-collapseOne" className="accordion-collapse collapse" data-bs-parent="#artisanSpecsAccordion">
                <div className="accordion-body small text-secondary">
                  Fired and carved with authentic raw materials native to Rajasthan & Haryana borders. 
                  Every piece is hand-finished with organic oils and natural sealants, avoiding toxic chemical lacquers.
                </div>
              </div>
            </div>

            <div className="accordion-item">
              <h2 className="accordion-header" id="flush-headingTwo">
                <button className="accordion-button collapsed fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseTwo">
                  <i className="bi bi-truck me-2 text-primary"></i> Direct Shipping & Packaging
                </button>
              </h2>
              <div id="flush-collapseTwo" className="accordion-collapse collapse" data-bs-parent="#artisanSpecsAccordion">
                <div className="accordion-body small text-secondary">
                  Packed in recycled honeycomb cardboard and festive kraft boxes. 
                  When selected as a direct gift, price invoices are excluded, and handwritten occasion cards are tucked inside.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
