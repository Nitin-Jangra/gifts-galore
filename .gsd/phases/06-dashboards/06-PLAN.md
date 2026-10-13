# Phase 6 Plan: Dashboards & Real Analytics

## Objective
Provide real, database-derived analytics dashboards for both Sellers and Platform Admins without hardcoded numbers, ensuring strict separation of gross order value from platform revenue.

## Scope & Deliverables
1. **Analytics Repository & Aggregations**:
   - `analytics.repository.js`: Calculates metrics dynamically from Order, OrderItem, Product, and User tables.
   - Seller metrics: Gross sales, total items sold, pending fulfillment counts, low stock alerts, best performing products.
   - Admin metrics: Gross order value, promotional discounts, taxes, shipping collected, net platform revenue, user account distributions.
2. **Backend API Endpoints**:
   - `GET /api/v1/analytics/seller`: Protected by `requireRole('SELLER', 'ADMIN')` and scoped to current seller.
   - `GET /api/v1/analytics/admin`: Protected by `requireRole('ADMIN')`.
3. **Frontend Dashboards**:
   - `SellerDashboardPage.jsx`: Artisan operational hub with low inventory alerts, pending orders, and top gifts.
   - `AdminDashboardPage.jsx`: Platform governance portal with transparent financial reconciliation and user account audits.
4. **Empirical Verification**:
   - Vitest test suite `analytics.test.js` validating financial calculations and RBAC access restrictions.
