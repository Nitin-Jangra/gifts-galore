import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StorefrontPage from './pages/StorefrontPage';
import ProductDetailPage from './pages/ProductDetailPage';
import SellerProductsPage from './pages/SellerProductsPage';
import SellerDashboardPage from './pages/SellerDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import CustomerAccountPage from './pages/CustomerAccountPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import BespokeRequestPage from './pages/BespokeRequestPage';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <div className="d-flex flex-column min-vh-100">
            <Navbar />
            <Routes>
              <Route path="/" element={<StorefrontPage />} />
              <Route path="/customizable" element={<StorefrontPage defaultType="CUSTOMIZABLE" />} />
              <Route path="/bespoke-request" element={<BespokeRequestPage />} />
              <Route path="/products/:slug" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
              <Route path="/account" element={<CustomerAccountPage />} />
              <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
              <Route path="/seller/products" element={<SellerProductsPage />} />
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
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
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

