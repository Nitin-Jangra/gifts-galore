---
phase: 1
plan: 1
wave: 1
gap_closure: false
---

# Plan 1.1: Core Authentication, Authorization & Session Management Engine

## Objective
Implement a production-grade, security-first authentication and authorization layer for Gifts Galore. This includes Argon2id password hashing, HttpOnly SameSite cookie session management, CSRF token validation, role-based access control (RBAC for `CUSTOMER`, `SELLER`, `ADMIN`), account moderation status enforcement, and seller feature-flag enforcement.

## Context
Load these files for context:
- `.gsd/SPEC.md`
- `.gsd/ARCHITECTURE.md`
- `.gsd/ROADMAP.md`
- `server/prisma/schema.prisma`

## Tasks

<task type="auto">
  <name>Implement Security Core: Argon2id Hashing, Token Generation & CSRF Protection</name>
  <files>
    server/src/utils/security.js
    server/src/middleware/csrf.js
  </files>
  <action>
    - Create Argon2id password hashing and verification utilities with high-security parameters.
    - Implement signed JWT/session token utilities.
    - Implement double-submit / header-cookie CSRF middleware for mutating endpoints.
  </action>
  <verify>
    vitest run on security unit tests
  </verify>
  <done>
    Argon2id produces hashes and verifies passwords correctly. CSRF middleware accepts valid matching token and rejects mismatched or missing token on POST/PUT/DELETE.
  </done>
</task>

<task type="auto">
  <name>Implement Auth Validation Schemas & Service Layer</name>
  <files>
    server/src/validations/auth.validation.js
    server/src/services/auth.service.js
    server/src/controllers/auth.controller.js
    server/src/routes/auth.routes.js
  </files>
  <action>
    - Create Zod validation schemas for customer registration, seller registration, login, and profile update.
    - Implement `auth.service.js` with registration (checking duplicate email/slug and public seller registration feature flag), login verification, account status checks (reject SUSPENDED/BLOCKED), and user profile retrieval.
    - Connect routes under `/api/v1/auth`:
      - `POST /register`: Register customer (or seller if allowed)
      - `POST /login`: Verify credentials, issue HttpOnly cookie & CSRF token
      - `POST /logout`: Clear cookies
      - `GET /me`: Authenticated user info
      - `GET /csrf-token`: Retrieve fresh CSRF token
  </action>
  <verify>
    vitest run on auth integration tests
  </verify>
  <done>
    Auth endpoints return expected responses and secure cookies.
  </done>
</task>

<task type="auto">
  <name>Implement Authentication, RBAC & Account Status Middleware</name>
  <files>
    server/src/middleware/auth.middleware.js
  </files>
  <action>
    - Extract and verify token from HttpOnly cookie or Authorization header.
    - Attach authenticated user to `req.user`.
    - Check user status: if `SUSPENDED` or `BLOCKED`, return 403 Forbidden with account inactive error.
    - Implement `requireRole(...roles)` checking user role against allowed roles.
  </action>
  <verify>
    vitest run tests/auth.test.js
  </verify>
  <done>
    Unauthorized requests get 401; insufficient role requests get 403; suspended users get 403.
  </done>
</task>

## Must-Haves
- [ ] Argon2id hashing used for all passwords.
- [ ] Session tokens set via HttpOnly SameSite cookies.
- [ ] CSRF middleware protects mutating requests.
- [ ] Role enforcement for CUSTOMER, SELLER, ADMIN.
- [ ] Automated tests cover registration, login, logout, RBAC, and invalid credential cases.
