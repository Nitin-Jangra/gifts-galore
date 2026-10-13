# Phase 7 Plan: Customer Portal, Wishlist & End-to-End Hardening

## Objective
Provide an end-to-end customer portal with order tracking, direct gifting details, bespoke commission management, saved gift wishlist, and system verification across the full stack.

## Scope & Deliverables
1. **Wishlist State & Storage**:
   - `WishlistContext.jsx`: Persistent local storage wishlist with add/remove/toggle methods.
   - Interactive heart buttons integrated across `StorefrontPage` and `ProductDetailPage`.
2. **Customer Account Portal**:
   - `CustomerAccountPage.jsx`: Tabbed interface with:
     - Placed Orders: Displays order numbers, statuses, line items, recipient direct gifting greeting & discreet packaging flags.
     - Bespoke Commissions: Displays custom requests, status badges, artisan quotations, and one-click quote acceptance.
     - Wishlist: Saved gifts with quick Add-to-Cart.
     - Security & Profile: Full user credentials and security architecture overview.
3. **Route Integration & Polish**:
   - `Navbar.jsx`: Wishlist counter badge and quick account links.
   - `App.jsx`: Full routing wired for `/account`, `/seller/dashboard`, `/admin/dashboard`.
4. **End-to-End Verification**:
   - Clean production client build via Vite (`npm run build`).
   - 100% test pass rate across all server test suites via Vitest (`npm test`).
