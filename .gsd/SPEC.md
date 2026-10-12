# SPEC.md — Project Specification

> **Status**: `FINALIZED`
>
> ⚠️ **Planning Lock**: No code may be written until this spec is marked `FINALIZED`.

## Vision
Gifts Galore is a production-minded, security-first gift e-commerce marketplace headquartered initially in Loharu, India, designed from the ground up for seamless multi-vendor expansion. The platform unites three distinct gifting paradigms:
1. **Ready-made gifts**: Pre-designed, cataloged products ready for immediate purchase.
2. **Customizable gifts**: Products featuring customer personalization (engraving, custom text, photo upload, specific color/material choices) governed by seller-configured schema.
3. **On-Demand special gifts**: Bespoke gift requests requiring seller review, feasibility verification, custom quotation, and customer approval before transitioning into a confirmed order.

Initially, Gifts Galore is the sole operating seller, but the data architecture, authorization boundaries, and inventory management are strictly multi-vendor isolated with seller records, feature-flagged public seller registration, and multi-tenant domain boundaries.

---

## Goals
1. **Multi-Vendor Architecture**: Design schema, domain logic, and APIs around independent `Seller` records. Gifts Galore is the seed seller, but zero business logic hardcodes a single vendor.
2. **Three-Tier Gifting Modalities**: Support Ready-Made, Customizable, and On-Demand Bespoke requests with rigorous validation and immutable order snapshots.
3. **Direct Gifting Experience**: Dedicated checkout workflow allowing purchasers to send directly to recipients with personalized greeting cards, requested delivery dates, recipient contact details, and optional discreet packaging/pricing.
4. **Security-First Architecture**: End-to-end defense-in-depth: Argon2id password hashing, HttpOnly SameSite cookies, CSRF defense, strict RBAC + resource-level tenant ownership enforcement, Helmet security headers, rate limiting, and zero client-exposed backend/Supabase service secrets.
5. **Real-Data Analytics**: Dashboards for Sellers and Platform Admins reflecting reconciled, live database metrics (gross order value, discounts, taxes, net revenues, inventory alerts, moderation statuses).
6. **Polished, Accessible UI**: React + Vite with Bootstrap 5, adhering to a gift-focused palette (warm cream, restrained terracotta/coral, refined neutrals), fully responsive across desktop, tablet, and mobile.

---

## Non-Goals (Out of Scope for v1.0)
- **Live Interactive 3D/Canvas Rendering Previews**: No deceptive or fabricated preview canvases; explicit text/upload confirmation will be utilized to accurately set customer expectations.
- **Immediate Public Seller Onboarding**: Public registration for sellers is disabled by default behind an administrative feature flag; onboarding is curated by Platform Administrators.
- **Raw Payment Processing Storage**: No storage or logging of raw credit card numbers or CVVs; integration relies exclusively on PCI-compliant payment gateway tokens/webhooks.
- **Arbitrary File Storage**: Unrestricted client uploads are banned; only allowlisted, scanned, size-constrained image formats stored with randomized object keys in Supabase Storage.

---

## Users & Roles

### 1. Platform Administrator
- Manage and moderate all customer and seller accounts (approve, reject, suspend, block).
- Moderate product catalog (review, approve, reject, deactivate violating products).
- Platform-wide governance: categories, platform commission/settings, audit logs.
- System-wide analytics: total gross sales, seller performance, platform fee breakdown.

### 2. Seller (Initial store: Gifts Galore, Loharu)
- Manage store profile, business policies, and contact information.
- Full catalog management: Ready-made, customizable, and on-demand products with inventory and variant tracking.
- Configure product-specific customization rules (text fields, character limits, upload requirements).
- Process incoming orders, manage fulfillment stages, and review bespoke gift quotation requests.
- Strict multi-tenant isolation: No seller can access or modify another seller's products, orders, or analytics.

### 3. Customer
- Unauthenticated browsing, filtering, and searching of products.
- Secure customer authentication, profile, address book, and wishlist management.
- Cart and checkout with direct-gifting recipient configuration.
- Customization input and asset upload validation.
- Submission and tracking of bespoke on-demand gift requests (quotation review and acceptance).
- Order history tracking and receipt access.

---

## Constraints
- **Backend**: Node.js with Express.js, REST APIs under `/api/v1`, centralized error handling, server-side Zod/Joi validation.
- **Frontend**: React.js with Vite, Bootstrap 5, React Router v6+, responsive and accessible UI.
- **Database & Storage**: PostgreSQL hosted on Supabase, Prisma ORM with version-controlled migrations, Supabase Storage for assets.
- **Security**: Argon2id hashing, secure cookies, CSRF protection, Helmet, rate limiting, least-privilege Supabase database roles, strict RBAC middleware.
- **DevOps & Testing**: Git version control, separate `.env.example` configurations, automated test suites (backend API integration & unit tests, frontend component tests).

---

## Success Criteria
- [ ] Automated tests pass for authentication, authorization, ownership checks, and API validation.
- [ ] Database migrations execute cleanly via Prisma with foreign keys, indexes, and constraints.
- [ ] Strict multi-tenant isolation prevents cross-seller data exposure.
- [ ] Customers can purchase ready-made gifts and customizable gifts with validated personalized data.
- [ ] Customers can submit on-demand bespoke gift requests, receive seller quotations, and convert them to orders.
- [ ] Direct gifting checkout captures recipient details, custom messages, and discreet packaging requests.
- [ ] Seller and Admin dashboards display accurate, calculated metrics derived from database state.
- [ ] No secrets or service-role keys are present in frontend bundles or Git.

---

*Last updated: 2026-10-12*
