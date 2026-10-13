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


  // Mock initial seed products if backend DB empty during development
  const fallbackProducts = [
    {
      id: 'p1',
      name: 'Loharu Brass Diya & Scented Candle Hamper',
      slug: 'loharu-brass-diya-scented-candle-hamper',
      description: 'Handcrafted bell metal diya with organic soy wax lavender candles from Loharu.',
      productType: 'READY_MADE',
      price: 1299.0,
      discountPrice: 1099.0,
      stockQuantity: 18,
      availability: 'IN_STOCK',
      seller: { storeName: 'Gifts Galore, Loharu' },
      images: [
        {
          imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80',
          isPrimary: true,
        },
      ],
    },
    {
      id: 'p2',
      name: 'Custom Engraved Wooden Keepsake Box',
      slug: 'custom-engraved-wooden-keepsake-box',
      description: 'Solid sheesham wood memory box personalized with custom name, date, and carved message.',
      productType: 'CUSTOMIZABLE',
      price: 1499.0,
      discountPrice: null,
      stockQuantity: 12,
      availability: 'IN_STOCK',
      seller: { storeName: 'Gifts Galore, Loharu' },
      images: [
        {
          imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80',
          isPrimary: true,
        },
      ],
    },
    {
      id: 'p3',
      name: 'Handcrafted Ceramic Tea Set for Couples',
      slug: 'handcrafted-ceramic-tea-set-for-couples',
      description: 'Artisanal glazed ceramic teapot and two handleless cups in terracotta-cream tone.',
      productType: 'READY_MADE',
      price: 2199.0,
      discountPrice: 1899.0,
      stockQuantity: 6,
      availability: 'IN_STOCK',
      seller: { storeName: 'Gifts Galore, Loharu' },
      images: [
        {
          imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&auto=format&fit=crop&q=80',
          isPrimary: true,
        },
      ],
    },
    {
      id: 'p4',
      name: 'Commissioned Portrait & Custom Calligraphy Scroll',
      slug: 'commissioned-portrait-custom-calligraphy-scroll',
      description: 'Bespoke hand-inked traditional scroll made to order with your custom poetry or celebration vows.',
      productType: 'ON_DEMAND',
      price: 3499.0,
      discountPrice: null,
      stockQuantity: 0,
      availability: 'MADE_TO_ORDER',
      seller: { storeName: 'Gifts Galore, Loharu' },
      images: [
        {
          imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80',
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
        return 'bg-secondary';
    }
  };

  const getBadgeLabel = (type) => {
    switch (type) {
      case 'READY_MADE':
        return 'Ready-Made';
      case 'CUSTOMIZABLE':
        return 'Customizable';
      case 'ON_DEMAND':
        return 'On-Demand Bespoke';
      default:
        return type;
    }
  };

  return (
    <div className="container py-5 flex-grow-1">
      {/* Page Title & Search Bar */}
      <div className="row align-items-center mb-4 g-3">
        <div className="col-md-6">
          <h1 className="brand-font fw-bold mb-1">Gifts Galore Marketplace</h1>
          <p className="text-muted small mb-0">Discover handcrafted treasures from verified artisans in Loharu, India</p>
        </div>
        <div className="col-md-6">
          <div className="input-group shadow-sm">
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search gifts by name or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Gift Modality Tabs */}
      <div className="d-flex flex-wrap gap-2 mb-4 border-bottom pb-3">
        <button
          className={`btn btn-sm ${selectedType === 'ALL' ? 'btn-terracotta' : 'btn-outline-secondary'} rounded-pill px-3`}
          onClick={() => setSelectedType('ALL')}
        >
          All Gifts
        </button>
        <button
          className={`btn btn-sm ${selectedType === 'READY_MADE' ? 'btn-terracotta' : 'btn-outline-secondary'} rounded-pill px-3`}
          onClick={() => setSelectedType('READY_MADE')}
        >
          <i className="bi bi-box-seam me-1"></i> Ready-Made Gifts
        </button>
        <button
          className={`btn btn-sm ${selectedType === 'CUSTOMIZABLE' ? 'btn-terracotta' : 'btn-outline-secondary'} rounded-pill px-3`}
          onClick={() => setSelectedType('CUSTOMIZABLE')}
        >
          <i className="bi bi-brush me-1"></i> Customizable Gifts
        </button>
        <button
          className={`btn btn-sm ${selectedType === 'ON_DEMAND' ? 'btn-terracotta' : 'btn-outline-secondary'} rounded-pill px-3`}
          onClick={() => setSelectedType('ON_DEMAND')}
        >
          <i className="bi bi-stars me-1"></i> On-Demand Bespoke
        </button>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status"></div>
          <p className="text-muted mt-2">Loading curated gifts...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-4 border">
          <i className="bi bi-gift fs-1 text-muted mb-3 d-block"></i>
          <h4>No gifts found matching your criteria</h4>
          <p className="text-muted small">Try adjusting your search terms or selecting another gifting category.</p>
        </div>
      ) : (
        <div className="row g-4">
          {filteredProducts.map((product) => {
            const primaryImg = product.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80';
            return (
              <div key={product.id} className="col-lg-3 col-md-6">
                <div className="card h-100 card-luxury overflow-hidden">
                  <div className="position-relative" style={{ height: '220px', backgroundColor: '#F7FAFC' }}>
                    <img
                      src={primaryImg}
                      alt={product.name}
                      className="w-100 h-100 object-fit-cover"
                      loading="lazy"
                    />
                    <span className={`position-absolute top-0 start-0 m-3 badge badge-gift-type ${getBadgeClass(product.productType)} shadow-sm`}>
                      {getBadgeLabel(product.productType)}
                    </span>
                    <button
                      type="button"
                      className="btn btn-sm position-absolute top-0 end-0 m-2 rounded-circle bg-white shadow-sm p-0 d-flex align-items-center justify-content-center"
                      style={{ width: '32px', height: '32px', border: 'none' }}
                      title={isInWishlist(product.id) ? 'Remove from Wishlist' : 'Save to Wishlist'}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist(product);
                      }}
                    >
                      <i className={`bi ${isInWishlist(product.id) ? 'bi-heart-fill text-danger' : 'bi-heart text-secondary'}`}></i>
                    </button>
                    {product.availability === 'MADE_TO_ORDER' && (
                      <span className="position-absolute bottom-0 end-0 m-2 badge bg-dark opacity-75 small">
                        Made to Order
                      </span>
                    )}
                  </div>

                  <div className="card-body d-flex flex-column p-3">
                    <span className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>
                      {product.seller?.storeName || 'Gifts Galore, Loharu'}
                    </span>
                    <h5 className="card-title fw-bold fs-6 mt-1 mb-2">
                      <Link to={`/products/${product.slug}`} className="text-dark text-decoration-none text-truncate d-block">
                        {product.name}
                      </Link>
                    </h5>
                    <p className="card-text text-muted small flex-grow-1 line-clamp-2" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {product.description}
                    </p>

                    <div className="d-flex align-items-baseline gap-2 mt-2 mb-3">
                      <span className="fs-5 fw-bold" style={{ color: 'var(--gg-terracotta)' }}>
                        ₹{Number(product.discountPrice || product.price).toLocaleString('en-IN')}
                      </span>
                      {product.discountPrice && (
                        <span className="text-muted text-decoration-line-through small">
                          ₹{Number(product.price).toLocaleString('en-IN')}
                        </span>
                      )}
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
                          <i className="bi bi-eye me-1"></i> View Gift
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
  );
}
