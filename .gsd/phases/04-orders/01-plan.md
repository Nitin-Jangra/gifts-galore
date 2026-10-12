---
phase: 4
plan: 1
wave: 1
gap_closure: false
---

# Plan 4.1: Cart, Direct Gifting, Checkout & Multi-Vendor Order Lifecycle

## Objective
Implement shopping cart state management, checkout with dedicated Direct Gifting workflow (recipient details, separate address, custom gift card message, requested delivery date, discreet pricing), multi-vendor order architecture (partitioning order line items by seller while retaining immutable customization snapshots), and order status management.

## Context
Load these files for context:
- `.gsd/SPEC.md`
- `.gsd/ARCHITECTURE.md`
- `.gsd/ROADMAP.md`
- `server/prisma/schema.prisma`

## Tasks

<task type="auto">
  <name>Implement Order Validation Schemas, Repository & Order Service</name>
  <files>
    server/src/validations/order.validation.js
    server/src/repositories/order.repository.js
    server/src/services/order.service.js
    server/src/controllers/order.controller.js
    server/src/routes/order.routes.js
  </files>
  <action>
    - Create Zod validation schema for checkout with Direct Gifting options (isGift, recipientName, recipientPhone, recipientAddress, giftMessage, deliveryDateRequested, discreetPricingRequested, items).
    - Validate product stock and prices dynamically from DB; check customization snapshots for customizable items.
    - Implement order calculation (grossAmount, discountAmount, shipping, netAmount) and transactionally create Order and OrderItem records associated with each product's sellerId.
    - Implement status updates: PENDING_PAYMENT -> CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED.
    - Enforce authorization: Customers can view only their own orders; Sellers can view only order items belonging to their store; Admins can view all orders.
  </action>
  <verify>
    vitest run tests/order.test.js
  </verify>
  <done>
    Orders can be created with Direct Gifting details; stock decreases or verifies correctly; customer privacy protected; sellers only see their items.
  </done>
</task>

<task type="auto">
  <name>Build Frontend CartContext, Cart & Direct Gifting Checkout Pages</name>
  <files>
    client/src/context/CartContext.jsx
    client/src/pages/CartPage.jsx
    client/src/pages/CheckoutPage.jsx
    client/src/pages/OrderConfirmationPage.jsx
    client/src/App.jsx
  </files>
  <action>
    - Implement CartContext with localStorage persistence, supporting ready-made gifts and personalized gifts with customization snapshots.
    - Build CartPage displaying item breakdown, customization summaries, quantities, and price totals.
    - Build CheckoutPage with toggleable "Gift this order" direct gifting section (recipient contact, recipient delivery address, personal gift note, delivery date picker, discreet packaging).
    - Build OrderConfirmationPage displaying clean receipt with direct gifting summary.
  </action>
  <verify>
    npm run build in client/
  </verify>
  <done>
    Frontend builds without errors and allows full cart, direct gifting checkout, and receipt display.
  </done>
</task>

## Must-Haves
- [ ] Direct gifting captured separately from purchaser account.
- [ ] OrderItem records associate each product with its true sellerId.
- [ ] Immutable customization snapshots preserved on OrderItem.
- [ ] Automated tests cover order creation, direct gifting data capture, stock validation, and role-based order queries.
