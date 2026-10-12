# Architecture Decision Records (ADR) — Gifts Galore

## ADR-001: Separation of Frontend and Backend Services
- **Status:** Approved
- **Context:** Gifts Galore requires a secure REST API architecture with clear separation of responsibilities, decoupled deployments, and clean boundary enforcement for security (no leaks of backend secrets to client bundles).
- **Decision:** Split the repository into `server/` (Node.js/Express) and `client/` (React/Vite). Shared contracts will be defined via REST API v1 conventions.
- **Consequences:** Clear security perimeter; frontend interacts with backend purely over HTTP/HTTPS with HttpOnly cookies and CSRF tokens.

---

## ADR-002: Multi-Vendor Data Abstraction from Day One
- **Status:** Approved
- **Context:** Initially Gifts Galore (Loharu) is the sole active vendor, but business requirements demand future multi-vendor support without codebase rewrites.
- **Decision:** Introduce a distinct `Seller` entity in the database schema. All products, inventory, orders, and customization fields belong to a `Seller`. Gifts Galore will be created as the initial seed seller. Public seller registration will be disabled by default via a feature flag.
- **Consequences:** Eliminates hardcoded seller IDs or single-tenant assumptions across backend logic, queries, and authorization checks.

---

## ADR-003: Authentication, Session Management & CSRF Strategy
- **Status:** Approved
- **Context:** Security-first requirement demands strong password hashing and protection against credential stuffing, session hijacking, XSS, and CSRF.
- **Decision:** Use `argon2` (Argon2id algorithm) for hashing passwords. Use cryptographically secure session tokens stored in `HttpOnly`, `SameSite=Lax`, `Secure` cookies. State-changing requests must validate a double-submit or server-verified CSRF token.
- **Consequences:** Complete immunity to JavaScript-accessible token theft via XSS; CSRF defense on all mutating API calls.

---

## ADR-004: Supabase PostgreSQL & Prisma ORM
- **Status:** Approved
- **Context:** Reliable relational persistence with ACID transactions, JSON schema support for custom product configurations, and versioned database migrations.
- **Decision:** Use Prisma ORM backed by PostgreSQL on Supabase. File assets (product images, customer personalization attachments) stored in Supabase Storage with randomized UUID file keys.
- **Consequences:** Structured migrations, type safety, parameterized queries preventing SQL injection, and zero database credentials exposed to the frontend.
