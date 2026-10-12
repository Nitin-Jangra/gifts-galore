---
milestone: v1.0
version: 1.0.0
updated: 2026-10-12T17:33:00+05:30
---

# Roadmap: Gifts Galore Marketplace

> **Current Phase:** Phase 1 — Core Database Schema, Authentication & Authorization Engine
> **Status:** ✅ Complete

## Must-Haves (from SPEC)
- [x] Multi-vendor architecture with explicit `Seller` record abstraction (initial seed: Gifts Galore, Loharu).
- [ ] Support for Ready-Made, Customizable, and On-Demand Bespoke gifting modalities.
- [ ] Direct Gifting checkout capabilities with recipient details, greeting messages, and discreet packing/pricing.
- [x] Enterprise-grade security: Argon2id, HttpOnly SameSite cookies, CSRF, Helmet, rate limiting, and zero exposed service keys.
- [ ] Real-data analytics dashboards for Sellers and Admins with live database aggregations.
- [x] Responsive, polished, accessible UI in React + Vite + Bootstrap 5.

---

## Phases

### Phase 0: Foundation & Baseline Architecture Setup
**Status:** ✅ Complete
**Objective:** Establish repository structure, initialize `server/` (Express, Prisma, security middlewares, test setup) and `client/` (Vite, React, Bootstrap 5), configure environment schemas, and verify clean test and dev builds.
**Requirements:** NFR-SEC-02, NFR-SEC-04, NFR-TEST-01

**Plans:**
- [x] Plan 0.1: Initialize repository structure, package configs, environment templates, and tooling baseline.
- [x] Plan 0.2: Implement Express server baseline with security middleware, health check, and test suite.
- [x] Plan 0.3: Initialize React + Vite + Bootstrap 5 frontend scaffold with custom palette tokens.

---

### Phase 1: Core Database Schema, Prisma Migrations, Authentication & Authorization
**Status:** ✅ Complete
**Objective:** Define Prisma models for Users, Sellers, Roles, Sessions, and Audit Logs; implement Argon2id hashing, HttpOnly session handling, CSRF token pipeline, role-based access control, and account moderation.
**Depends on:** Phase 0
**Requirements:** REQ-AUTH-01, REQ-AUTH-02, REQ-AUTH-03, REQ-AUTH-04, REQ-AUTH-05, NFR-SEC-01, NFR-SEC-03

**Plans:**
- [x] Plan 1.1: Core Authentication, Authorization & Session Management Engine (Argon2id, JWT, CSRF, RBAC, seller ownership, rate limiting, test suite).

---

### Phase 2: Multi-Vendor Catalog & Product Management
**Status:** ⬜ Not Started
**Objective:** Implement product management API and UI: categories, product variants, inventory thresholds, multi-image upload pipeline to Supabase Storage, and strict seller-ownership authorization.
**Depends on:** Phase 1
**Requirements:** REQ-CAT-01, REQ-CAT-02, REQ-CAT-03, REQ-CAT-04, REQ-CAT-05, NFR-SEC-05, NFR-PERF-01

---

### Phase 3: Product Customization Engine & Media Validation
**Status:** ⬜ Not Started
**Objective:** Enable sellers to configure custom fields per product (text, character limits, reference photos), implement customer personalization validation, and preserve immutable customization snapshots.
**Depends on:** Phase 2
**Requirements:** REQ-CUST-01, REQ-CUST-02, REQ-CUST-03

---

### Phase 4: Cart, Direct Gifting, Checkout & Order Lifecycle
**Status:** ⬜ Not Started
**Objective:** Build persistent cart, direct gifting checkout flow (recipient address, custom card message, requested delivery date, discreet packaging), order fulfillment state machine, and multi-vendor order partitioning.
**Depends on:** Phase 3
**Requirements:** REQ-CART-01, REQ-GIFT-01, REQ-GIFT-02, REQ-ORD-01, REQ-ORD-02

---

### Phase 5: On-Demand Bespoke Gift Request Workflow
**Status:** ⬜ Not Started
**Objective:** Build end-to-end bespoke gift request workflow (`SUBMITTED` → `UNDER_REVIEW` → `QUOTED` → `CUSTOMER_APPROVED` → `ORDER_CREATED`), allowing customer image/spec submission and seller quotation.
**Depends on:** Phase 4
**Requirements:** REQ-BESPOKE-01, REQ-BESPOKE-02

---

### Phase 6: Seller & Admin Dashboards & Real Analytics
**Status:** ⬜ Not Started
**Objective:** Provide real database-derived analytics: gross order values, discounts, net sales, inventory alerts, customization backlogs, admin moderation queues, and audit log viewer.
**Depends on:** Phase 5
**Requirements:** REQ-DASH-01, REQ-DASH-02, REQ-AUDIT-01

---

### Phase 7: Customer Experience, Wishlist & End-to-End Hardening
**Status:** ⬜ Not Started
**Objective:** Implement customer account portal (saved addresses, order history, wishlist), complete UI/UX polish across all viewports, conduct full security review, automated test verification, and deployment documentation.
**Depends on:** Phase 6
**Requirements:** REQ-UI-01, REQ-UI-02, NFR-A11Y-01

---

## Progress Summary

| Phase | Description | Status | Plans | Complete |
|-------|-------------|--------|-------|----------|
| 0 | Foundation & Baseline Architecture Setup | ✅ Complete | 3/3 | 100% |
| 1 | Database, Authentication & Authorization | ✅ Complete | 1/1 | 100% |
| 2 | Multi-Vendor Catalog & Media Storage | ⬜ Not Started | 0/3 | 0% |
| 3 | Product Customization Engine | ⬜ Not Started | 0/2 | 0% |
| 4 | Cart, Direct Gifting & Order Management | ⬜ Not Started | 0/3 | 0% |
| 5 | On-Demand Bespoke Gift Workflow | ⬜ Not Started | 0/2 | 0% |
| 6 | Seller & Admin Dashboards & Analytics | ⬜ Not Started | 0/2 | 0% |
| 7 | Customer Portal, Hardening & Verification | ⬜ Not Started | 0/3 | 0% |
