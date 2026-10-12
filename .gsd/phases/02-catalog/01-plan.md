---
phase: 2
plan: 1
wave: 1
gap_closure: false
---

# Plan 2.1: Multi-Vendor Catalog, Media Storage & Product Management

## Objective
Implement a multi-vendor product catalog engine supporting the 3 gifting modalities: Ready-Made, Customizable, and On-Demand Bespoke. This includes categories, inventory availability rules (no zero-stock marked in stock unless made-to-order), variants, soft-deletion/deactivation, secure media upload pipeline with MIME filtering and size limits, seller ownership enforcement, and public storefront catalog browsing.

## Context
Load these files for context:
- `.gsd/SPEC.md`
- `.gsd/ARCHITECTURE.md`
- `.gsd/ROADMAP.md`
- `server/prisma/schema.prisma`

## Tasks

<task type="auto">
  <name>Implement Media Storage Service & Upload Middleware</name>
  <files>
    server/src/utils/storage.js
    server/src/middleware/upload.middleware.js
  </files>
  <action>
    - Create upload middleware using Multer memory storage with file-size limits (max 5MB) and strict MIME type allowlisting (image/jpeg, image/png, image/webp).
    - Create storage utility supporting Supabase Storage upload with randomized UUID keys, with local/in-memory fallback for offline test suites.
  </action>
  <verify>
    vitest run tests/catalog.test.js
  </verify>
  <done>
    Rejects disallowed MIME types (e.g., pdf, exe) and files exceeding 5MB. Returns secure URL.
  </done>
</task>

<task type="auto">
  <name>Implement Catalog Validation Schemas & Service</name>
  <files>
    server/src/validations/product.validation.js
    server/src/repositories/product.repository.js
    server/src/services/product.service.js
    server/src/controllers/product.controller.js
    server/src/routes/product.routes.js
  </files>
  <action>
    - Validate product creation, updates, and query filters using Zod.
    - Implement inventory validation rule: products with 0 stock cannot be marked IN_STOCK unless availability is MADE_TO_ORDER.
    - Support product lifecycle: DRAFT, PENDING_REVIEW, ACTIVE, INACTIVE, and soft DELETED.
    - Public endpoints: GET /api/v1/products (browse with search, category, type, price filters), GET /api/v1/products/:slug.
    - Seller endpoints (requireRole('SELLER', 'ADMIN') + requireSellerOwnership): POST /api/v1/seller/products, PUT /api/v1/seller/products/:id, DELETE /api/v1/seller/products/:id (soft delete), POST /api/v1/seller/products/:id/images (reorder/upload).
  </action>
  <verify>
    vitest run tests/catalog.test.js
  </verify>
  <done>
    Products can be created, updated, soft deleted, and queried publicly. Cross-seller modifications are rejected.
  </done>
</task>

<task type="auto">
  <name>Integrate Frontend Catalog & Product Browsing</name>
  <files>
    client/src/pages/StorefrontPage.jsx
    client/src/pages/ProductDetailPage.jsx
    client/src/pages/SellerProductsPage.jsx
    client/src/App.jsx
  </files>
  <action>
    - Build rich storefront catalog browsing with search, category filtering, and gift type pills.
    - Build Product Detail view with multi-image gallery, price/discount display, inventory badges, and type callout.
    - Build Seller product dashboard view where authorized sellers can manage their catalog.
  </action>
  <verify>
    npm run build in client/
  </verify>
  <done>
    Frontend builds without errors and displays catalog products with gift type categorization.
  </done>
</task>

## Must-Haves
- [ ] Product models support READY_MADE, CUSTOMIZABLE, and ON_DEMAND.
- [ ] 0 inventory rule enforced on creation and update.
- [ ] Multi-image uploads validated against allowlisted image formats and size constraints.
- [ ] Seller ownership check strictly enforced on seller routes.
- [ ] Automated tests cover catalog CRUD, filtering, inventory validation, and unauthorized cross-seller updates.
