import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SellerProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    productType: 'READY_MADE',
    price: '',
    stockQuantity: '10',
    availability: 'IN_STOCK',
    status: 'ACTIVE',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadSellerProducts() {
      try {
        const res = await api.get('/products');
        if (res.data?.products) {
          setProducts(res.data.products);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSellerProducts();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity, 10),
      };

      const res = await api.post('/products', payload);
      if (res.data?.product) {
        setProducts((prev) => [res.data.product, ...prev]);
        setShowAddModal(false);
        setFormData({
          name: '',
          description: '',
          productType: 'READY_MADE',
          price: '',
          stockQuantity: '10',
          availability: 'IN_STOCK',
          status: 'ACTIVE',
        });
      }
    } catch (err) {
      setFormError(err.message || 'Failed to create product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-5 flex-grow-1">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="brand-font fw-bold mb-1">Seller Product Management</h2>
          <p className="text-muted small mb-0">
            Store: {user?.sellerProfile?.storeName || 'Gifts Galore, Loharu'}
          </p>
        </div>
        <button className="btn btn-terracotta" onClick={() => setShowAddModal(true)}>
          <i className="bi bi-plus-lg me-1"></i> Add New Product
        </button>
      </div>

      {/* Add Product Form Modal / Section */}
      {showAddModal && (
        <div className="card card-luxury p-4 mb-4 border-warning shadow-sm">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">List New Gift Product</h5>
            <button className="btn btn-close" onClick={() => setShowAddModal(false)}></button>
          </div>

          {formError && (
            <div className="alert alert-danger py-2 px-3 small">{formError}</div>
          )}

          <form onSubmit={handleCreateProduct}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Product Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label small fw-semibold">Gift Modality</label>
                <select
                  name="productType"
                  className="form-select"
                  value={formData.productType}
                  onChange={handleChange}
                >
                  <option value="READY_MADE">Ready-Made Gift</option>
                  <option value="CUSTOMIZABLE">Customizable Gift</option>
                  <option value="ON_DEMAND">On-Demand Bespoke</option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label small fw-semibold">Price (INR)</label>
                <input
                  type="number"
                  name="price"
                  className="form-control"
                  value={formData.price}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold">Description</label>
                <textarea
                  name="description"
                  rows="3"
                  className="form-control"
                  value={formData.description}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <div className="col-md-3">
                <label className="form-label small fw-semibold">Stock Quantity</label>
                <input
                  type="number"
                  name="stockQuantity"
                  className="form-control"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label small fw-semibold">Availability</label>
                <select
                  name="availability"
                  className="form-select"
                  value={formData.availability}
                  onChange={handleChange}
                >
                  <option value="IN_STOCK">In Stock</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                  <option value="MADE_TO_ORDER">Made to Order</option>
                </select>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-terracotta"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Publish Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Product List Table */}
      <div className="card card-luxury overflow-hidden border">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Product</th>
                <th>Type</th>
                <th>Price</th>
                <th>Inventory</th>
                <th>Availability</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No products cataloged yet.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.name}</strong>
                    </td>
                    <td>
                      <span className="badge badge-gift-type badge-ready-made">{p.productType}</span>
                    </td>
                    <td>₹{Number(p.price).toLocaleString('en-IN')}</td>
                    <td>{p.stockQuantity}</td>
                    <td>
                      <span className={`badge ${p.availability === 'IN_STOCK' ? 'bg-success' : 'bg-warning'}`}>
                        {p.availability}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-primary-subtle text-primary border">{p.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
