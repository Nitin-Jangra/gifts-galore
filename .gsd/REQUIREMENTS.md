---
milestone: v1.0
updated: 2026-10-12T17:15:00+05:30
---

# Requirements: Gifts Galore Marketplace

## Overview
Comprehensive functional and non-functional requirements traceable directly to `SPEC.md`.

---

## Functional Requirements

| ID | Requirement Description | Source | Target Phase | Status |
|----|-------------------------|--------|--------------|--------|
| **REQ-AUTH-01** | User registration and authentication for Customers, Sellers, and Admins using Argon2id password hashing. | SPEC Goal 4 | Phase 1 | Pending |
| **REQ-AUTH-02** | Session management with HttpOnly, Secure, SameSite cookies, session invalidation on logout, and CSRF protection. | SPEC Goal 4 | Phase 1 | Pending |
| **REQ-AUTH-03** | Role-based authorization middleware enforcing permissions for `CUSTOMER`, `SELLER`, and `ADMIN`. | SPEC Goal 4 | Phase 1 | Pending |
| **REQ-AUTH-04** | Feature flag to control public seller registration (disabled by default; admin can invite/approve). | SPEC Goal 1 | Phase 1 | Pending |
| **REQ-AUTH-05** | Account moderation: Admin can approve, suspend, or block accounts; blocked sessions are invalidated immediately. | SPEC Goal 4 | Phase 1 | Pending |
| **REQ-CAT-01** | Multi-vendor product catalog model supporting Ready-Made, Customizable, and On-Demand gift types. | SPEC Goal 1, 2 | Phase 2 | Pending |
| **REQ-CAT-02** | Product variants (size, color, style) and inventory controls (out-of-stock enforcement unless made-to-order). | SPEC Goal 2 | Phase 2 | Pending |
| **REQ-CAT-03** | Product lifecycle states: `DRAFT`, `PENDING_REVIEW`, `ACTIVE`, `INACTIVE`, and soft-deletion. | SPEC Goal 2 | Phase 2 | Pending |
| **REQ-CAT-04** | Seller ownership checks on all product mutations (prevent cross-seller modification). | SPEC Goal 1, 4 | Phase 2 | Pending |
| **REQ-CAT-05** | Secure media upload pipeline: Multi-photo upload, reordering, primary image selection via Supabase Storage. | SPEC Goal 4 | Phase 2 | Pending |
| **REQ-CUST-01** | Seller-defined product customization schema (text fields, char limits, image uploads, dropdowns). | SPEC Goal 2 | Phase 3 | Pending |
| **REQ-CUST-02** | Customer personalization input validation during cart addition and checkout. | SPEC Goal 2 | Phase 3 | Pending |
| **REQ-CUST-03** | Immutable order snapshot preserving agreed customization details and uploaded assets for confirmed orders. | SPEC Goal 2 | Phase 3 | Pending |
| **REQ-CART-01** | Persistent shopping cart supporting multi-item selection with real-time stock verification. | SPEC Goal 2 | Phase 4 | Pending |
| **REQ-GIFT-01** | Direct gifting checkout option: Recipient name, phone number, delivery address, custom card message, requested delivery date. | SPEC Goal 3 | Phase 4 | Pending |
| **REQ-GIFT-02** | Optional gift packaging and discreet pricing request (hide itemized price on package if supported). | SPEC Goal 3 | Phase 4 | Pending |
| **REQ-ORD-01** | Multi-vendor order architecture: Unified checkout decomposed into seller-specific fulfillment items. | SPEC Goal 1 | Phase 4 | Pending |
| **REQ-ORD-02** | Order status lifecycle: `PENDING_PAYMENT`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `REFUNDED`. | SPEC Goal 2 | Phase 4 | Pending |
| **REQ-BESPOKE-01** | On-Demand bespoke gift request submission: Occasion, recipient, budget range, target date, notes, reference image. | SPEC Goal 2 | Phase 5 | Pending |
| **REQ-BESPOKE-02** | Bespoke request workflow: `SUBMITTED` → `UNDER_REVIEW` → `QUOTED` → `CUSTOMER_APPROVED` → `ORDER_CREATED`. | SPEC Goal 2 | Phase 5 | Pending |
| **REQ-DASH-01** | Seller analytics dashboard: Orders, gross/net sales, inventory alerts, customization queue, sales trends. | SPEC Goal 5 | Phase 6 | Pending |
| **REQ-DASH-02** | Platform Admin analytics: System users, order volume, platform gross sales, seller breakdowns, moderation queue. | SPEC Goal 5 | Phase 6 | Pending |
| **REQ-AUDIT-01** | Audit logging for sensitive administrative, financial, and moderation events. | SPEC Goal 4 | Phase 6 | Pending |
| **REQ-UI-01** | Polished, responsive storefront in warm cream, terracotta/coral, and neutral palette using Bootstrap 5. | SPEC Goal 6 | Phase 7 | Pending |
| **REQ-UI-02** | Customer profile, address book, wishlist, and order tracking portals. | SPEC Goal 6 | Phase 7 | Pending |

---

## Non-Functional Requirements

| ID | Requirement Description | Category | Target Phase | Status |
|----|-------------------------|----------|--------------|--------|
| **NFR-SEC-01** | Argon2id for password hashing with recommended salt/memory cost parameters. | Security | Phase 1 | Pending |
| **NFR-SEC-02** | Defense against OWASP Top 10: CSRF tokens, Helmet security headers, CORS origin restrictions, SQL injection prevention via Prisma. | Security | Phase 0, 1 | Pending |
| **NFR-SEC-03** | Server-side rate limiting on auth endpoints and sensitive actions using `express-rate-limit`. | Security | Phase 1 | Pending |
| **NFR-SEC-04** | Zero exposure of Supabase service-role keys or database credentials to client bundles. | Security | Phase 0, 1 | Pending |
| **NFR-SEC-05** | Strict file upload controls: MIME validation, size limits (e.g. 5MB), randomized UUID object keys. | Security | Phase 2, 3 | Pending |
| **NFR-PERF-01** | API response latency < 300ms for p95 catalog queries with optimized database indexing. | Performance | Phase 2 | Pending |
| **NFR-A11Y-01** | WCAG 2.1 AA compliant color contrast, keyboard-navigable forms, and semantic HTML. | Accessibility | Phase 7 | Pending |
| **NFR-TEST-01** | Automated test coverage for core business logic, permissions, and security middleware. | Quality | All Phases | Pending |

---

*Last updated: 2026-10-12*
