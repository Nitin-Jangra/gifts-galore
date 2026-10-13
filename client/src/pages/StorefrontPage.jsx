import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useWishlist } from '../context/WishlistContext';

export default function StorefrontPage({ defaultType = null }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [products, setProducts] = useState([]);
  const [selectedType, setSelectedType] = useState(defaultType || 'ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // High-fidelity fallback products matching Stitch and Loharu artisan catalog
  const fallbackProducts = [
    {
      id: 'p1',
      name: 'Loharu Brass Bell-Metal Diya & Scented Candle Hamper',
      slug: 'loharu-brass-diya-scented-candle-hamper',
      description: 'Handcrafted bell metal diya made by traditional metalsmiths in Loharu, paired with organic soy wax lavender candles.',
      productType: 'READY_MADE',
      price: 1299.0,
      discountPrice: 1099.0,
      stockQuantity: 18,
      availability: 'IN_STOCK',
      rating: 4.9,
      reviewsCount: 38,
      seller: { storeName: 'Gifts Galore', city: 'Loharu', state: 'Haryana' },
      images: [
        {
          imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80',
          isPrimary: true,
        },
      ],
    },
    {
      id: 'p2',
      name: 'Custom Engraved Sheesham Keepsake Memory Box',
      slug: 'custom-engraved-wooden-keepsake-box',
      description: 'Solid sheesham wood treasure chest personalized with custom recipient name, celebration date, and carved greeting.',
      productType: 'CUSTOMIZABLE',
      price: 1499.0,
      discountPrice: 1350.0,
      stockQuantity: 12,
      availability: 'IN_STOCK',
      rating: 5.0,
      reviewsCount: 64,
      seller: { storeName: 'Gifts Galore', city: 'Loharu', state: 'Haryana' },
      images: [
        {
          imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80',
          isPrimary: true,
        },
      ],
    },
    {
      id: 'p3',
      name: 'Handcrafted Terracotta & Ceramic Couple Tea Set',
      slug: 'handcrafted-ceramic-tea-set-for-couples',
      description: 'Artisanal glazed ceramic teapot and pair of handleless cups fired in traditional earthen kilns for mindful tea ceremonies.',
      productType: 'READY_MADE',
      price: 2199.0,
      discountPrice: 1899.0,
      stockQuantity: 6,
      availability: 'IN_STOCK',
      rating: 4.8,
      reviewsCount: 22,
      seller: { storeName: 'Gifts Galore', city: 'Loharu', state: 'Haryana' },
      images: [
        {
          imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop&q=80',
          isPrimary: true,
        },
      ],
    },
    {
      id: 'p4',
      name: 'Commissioned Portrait & Custom Calligraphy Scroll',
      slug: 'commissioned-portrait-custom-calligraphy-scroll',
      description: 'Bespoke hand-inked traditional scroll commissioned to your specifications with custom poetry or wedding vows.',
      productType: 'ON_DEMAND',
      price: 3499.0,
      discountPrice: null,
      stockQuantity: 0,
      availability: 'MADE_TO_ORDER',
      rating: 5.0,
      reviewsCount: 17,
      seller: { storeName: 'Gifts Galore', city: 'Loharu', state: 'Haryana' },
      images: [
        {
          imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80',
          isPrimary: true,
        },
      ],
    },
  ];

  useEffect(() => {
    async function fetchProducts() {
      try {
        const query = selectedType !== 'ALL' ? `?productType=${selectedType}` : '';
        const res = await api.get(`/products${query}`);
        if (res.data?.products && res.data.products.length > 0) {
          setProducts(res.data.products);
        } else {
          setProducts(fallbackProducts);
        }
      } catch (err) {
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [selectedType]);

  const filteredProducts = products.filter((p) => {
    const matchesType = selectedType === 'ALL' || p.productType === selectedType;
    const matchesSearch =
      searchTerm.trim() === '' ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getBadgeClass = (type) => {
    switch (type) {
      case 'READY_MADE':
        return 'badge-ready-made';
      case 'CUSTOMIZABLE':
        return 'badge-customizable';
      case 'ON_DEMAND':
        return 'badge-on-demand';
      default:
        return 'bg-secondary text-white';
    }
  };

  const getBadgeLabel = (type) => {
    switch (type) {
      case 'READY_MADE':
        return 'Ready-Made';
      case 'CUSTOMIZABLE':
        return 'Personalized';
      case 'ON_DEMAND':
        return 'On-Demand Bespoke';
      default:
        return type;
    }
  };

  return (
    <div className="pb-5">
      {/* Stitch Hero Section */}
      <section className="py-5" style={{ backgroundColor: 'var(--gg-surface-container-low)', borderBottom: '1px solid var(--gg-outline-variant)' }}>
        <div className="container py-3">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <div className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill mb-3" style={{ backgroundColor: 'var(--gg-primary-fixed)', color: 'var(--gg-on-primary-fixed)' }}>
                <i className="bi bi-patch-check-fill text-warning"></i>
                <span className="small fw-bold">Heritage Artisan Collective &bull; Loharu, Haryana</span>
              </div>
              <h1 className="brand-font display-4 fw-bold mb-3" style={{ color: 'var(--gg-on-surface)' }}>
                Thoughtful Giving, Handcrafted with Soul.
              </h1>
              <p className="fs-5 text-secondary mb-4 leading-relaxed">
                Discover bespoke engraved wooden keepsakes, bell metal brassware, and made-to-order commissions 
                from master artisans in Loharu. Ready for direct gifting with handwritten cards and discreet delivery.
              </p>

              <div className="d-flex flex-wrap gap-3">
                <a href="#catalog-grid" className="btn btn-terracotta btn-lg px-4 shadow-sm">
                  <i className="bi bi-box-seam me-2"></i> Explore Gifts
                </a>
                <Link to="/bespoke-request" className="btn btn-outline-terracotta btn-lg px-4">
                  <i className="bi bi-stars me-2"></i> Commission Bespoke
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="d-flex flex-wrap gap-4 mt-4 pt-3 border-top border-secondary border-opacity-10 small text-secondary">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-check2-circle text-success fs-5"></i>
                  <span>Zero Fake 3D Mocks</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-envelope-heart text-danger fs-5"></i>
                  <span>Direct Recipient Delivery</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-shield-lock text-primary fs-5"></i>
                  <span>Discreet Price Invoicing</span>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="position-relative">
                <div className="card card-luxury overflow-hidden p-2 shadow-lg" style={{ transform: 'rotate(1deg)' }}>
                  <img
                    src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80"
                    alt="Handcrafted Keepsake Gift"
                    className="w-100 rounded-3 object-fit-cover"
                    style={{ height: '360px' }}
                  />
                  <div className="p-3 bg-white rounded-bottom-3">
                    <span className="badge badge-customizable mb-1">Featured Artisan Commission</span>
                    <h5 className="brand-font fw-bold mb-0">Custom Engraved Keepsake Box</h5>
                    <span className="text-muted small">Carved from Sheesham in Loharu, Haryana</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Occasion Showcase Carousel Cards (From Stitch Design) */}
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="brand-font fw-bold mb-0">Curated by Occasion</h4>
          <span className="text-muted small">Thoughtful gifts for every milestone</span>
        </div>
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="occasion-card shadow-xs" onClick={() => setSelectedType('CUSTOMIZABLE')}>
              <i className="bi bi-heart-pulse-fill fs-2 d-block mb-2" style={{ color: 'var(--gg-primary)' }}></i>
              <strong className="d-block">Couples & Anniversaries</strong>
              <span className="small text-muted">Personalized Names & Dates</span>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="occasion-card shadow-xs" onClick={() => setSelectedType('READY_MADE')}>
              <i className="bi bi-house-heart-fill fs-2 d-block mb-2 text-warning"></i>
              <strong className="d-block">Housewarming & Festive</strong>
              <span className="small text-muted">Loharu Brass Diyas & Sets</span>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="occasion-card shadow-xs" onClick={() => setSelectedType('ON_DEMAND')}>
              <i className="bi bi-palette-fill fs-2 d-block mb-2 text-success"></i>
              <strong className="d-block">Bespoke Commissions</strong>
              <span className="small text-muted">Direct Artisan Quotes</span>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="occasion-card shadow-xs" onClick={() => setSelectedType('ALL')}>
              <i className="bi bi-gift-fill fs-2 d-block mb-2 text-info"></i>
              <strong className="d-block">Direct Gifting Delivery</strong>
              <span className="small text-muted">Delivered with Greetings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog & Filter Navigation */}
      <div className="container py-3" id="catalog-grid">
        <div className="row align-items-center mb-4 g-3">
          <div className="col-md-7">
            {/* Stitch Modality Filter Chips */}
            <div className="d-flex flex-wrap gap-2">
              <button
                className={`filter-chip-pill ${selectedType === 'ALL' ? 'active' : ''}`}
                onClick={() => setSelectedType('ALL')}
              >
                All Gifts
              </button>
              <button
                className={`filter-chip-pill ${selectedType === 'READY_MADE' ? 'active' : ''}`}
                onClick={() => setSelectedType('READY_MADE')}
              >
                <i className="bi bi-box-seam me-1"></i> Ready-Made
              </button>
              <button
                className={`filter-chip-pill ${selectedType === 'CUSTOMIZABLE' ? 'active' : ''}`}
                onClick={() => setSelectedType('CUSTOMIZABLE')}
              >
                <i className="bi bi-brush me-1"></i> Customizable
              </button>
              <button
                className={`filter-chip-pill ${selectedType === 'ON_DEMAND' ? 'active' : ''}`}
                onClick={() => setSelectedType('ON_DEMAND')}
              >
                <i className="bi bi-stars me-1"></i> On-Demand Bespoke
              </button>
            </div>
          </div>

          <div className="col-md-5">
            <div className="input-group shadow-xs">
              <span className="input-group-text bg-white border-end-0 rounded-start-pill ps-3">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 rounded-end-pill py-2"
                placeholder="Search gifts by name, wood, brass..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-terracotta" role="status"></div>
            <p className="text-muted mt-2">Curating artisan gifts...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-4 border p-5 shadow-xs">
            <i className="bi bi-gift fs-1 text-muted mb-3 d-block"></i>
            <h4 className="brand-font fw-bold">No gifts found</h4>
            <p className="text-muted small">Try broadening your search term or exploring another gifting modality.</p>
            <button className="btn btn-terracotta btn-sm mt-2" onClick={() => { setSelectedType('ALL'); setSearchTerm(''); }}>
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {filteredProducts.map((product) => {
              const primaryImg = product.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=80';
              const wishlisted = isInWishlist(product.id);

              return (
                <div key={product.id} className="col-lg-3 col-md-6">
                  <div className="card h-100 card-luxury overflow-hidden d-flex flex-column">
                    <div className="position-relative" style={{ height: '240px', backgroundColor: 'var(--gg-surface-container)' }}>
                      <img
                        src={primaryImg}
                        alt={product.name}
                        className="w-100 h-100 object-fit-cover"
                        loading="lazy"
                      />

                      {/* Gifting Modality Badge */}
                      <span className={`position-absolute top-0 start-0 m-3 badge badge-gift-type ${getBadgeClass(product.productType)} shadow-xs`}>
                        {getBadgeLabel(product.productType)}
                      </span>

                      {/* Wishlist Heart Overlay Button */}
                      <button
                        type="button"
                        className="btn btn-sm position-absolute top-0 end-0 m-2 rounded-circle bg-white shadow-sm p-0 d-flex align-items-center justify-content-center"
                        style={{ width: '34px', height: '34px', border: 'none' }}
                        title={wishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist({
                            ...product,
                            primaryImageUrl: primaryImg,
                          });
                        }}
                      >
                        <i className={`bi ${wishlisted ? 'bi-heart-fill text-danger' : 'bi-heart text-secondary'}`}></i>
                      </button>

                      {product.availability === 'MADE_TO_ORDER' && (
                        <span className="position-absolute bottom-0 end-0 m-2 badge bg-dark bg-opacity-75 small">
                          Made to Order
                        </span>
                      )}
                    </div>

                    <div className="card-body d-flex flex-column p-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
                          <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                          {product.seller?.storeName || 'Gifts Galore'}, {product.seller?.city || 'Loharu'}
                        </span>
                        {product.rating && (
                          <span className="small text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
                            <i className="bi bi-star-fill text-warning"></i>
                            <span className="fw-bold text-dark">{product.rating}</span>
                            <span>({product.reviewsCount || 12})</span>
                          </span>
                        )}
                      </div>

                      <h5 className="card-title brand-font fw-bold fs-6 mb-2">
                        <Link to={`/products/${product.slug}`} className="text-dark text-decoration-none text-truncate d-block">
                          {product.name}
                        </Link>
                      </h5>

                      <p
                        className="card-text text-secondary small flex-grow-1 mb-3"
                        style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}
                      >
                        {product.description}
                      </p>

                      <div className="d-flex align-items-baseline gap-2 mb-3">
                        <span className="fs-5 fw-bold" style={{ color: 'var(--gg-primary)' }}>
                          ₹{Number(product.discountPrice || product.price).toLocaleString('en-IN')}
                        </span>
                        {product.discountPrice && (
                          <span className="text-muted text-decoration-line-through small">
                            ₹{Number(product.price).toLocaleString('en-IN')}
                          </span>
                        )}
                        <span className="badge bg-light text-secondary border small ms-auto" style={{ fontSize: '0.65rem' }}>
                          Incl. taxes
                        </span>
                      </div>

                      <Link
                        to={`/products/${product.slug}`}
                        className={`btn w-100 btn-sm ${product.productType === 'CUSTOMIZABLE' ? 'btn-outline-terracotta' : 'btn-terracotta'}`}
                      >
                        {product.productType === 'CUSTOMIZABLE' ? (
                          <>
                            <i className="bi bi-brush me-1"></i> Personalize Gift
                          </>
                        ) : product.productType === 'ON_DEMAND' ? (
                          <>
                            <i className="bi bi-stars me-1"></i> Request Quote
                          </>
                        ) : (
                          <>
                            <i className="bi bi-bag-plus me-1"></i> View & Gift
                          </>
                        )}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stitch Artisan Story Banner */}
      <div className="container py-5">
        <div className="p-4 p-md-5 rounded-4 border" style={{ backgroundColor: 'var(--gg-surface-container)' }}>
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <span className="badge rounded-pill bg-warning text-dark mb-2">Artisans of Haryana</span>
              <h2 className="brand-font fw-bold mb-3">Rooted in Loharu's Metal & Wood Traditions</h2>
              <p className="text-secondary leading-relaxed mb-3">
                Loharu, nestled in the southern belt of Haryana, possesses centuries of bell metal craftmanship and 
                sheesham wood carving traditions. Gifts Galore directly partners with local artisan families, 
                guaranteeing living wages, verifiable material authenticity, and zero deceptive machine replications.
              </p>
              <div className="d-flex flex-wrap gap-4 pt-2 small text-secondary">
                <div><strong>100%</strong> Authentic Bell Metal & Sheesham</div>
                <div>&bull;</div>
                <div><strong>Direct</strong> Artisan Fair Trade</div>
                <div>&bull;</div>
                <div><strong>Handwritten</strong> Direct Gifting Cards</div>
              </div>
            </div>
            <div className="col-lg-4 text-center">
              <Link to="/bespoke-request" className="btn btn-terracotta btn-lg px-4">
                <i className="bi bi-palette me-2"></i> Commission Custom Artisan Work
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
