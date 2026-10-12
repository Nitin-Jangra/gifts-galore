# Gifts Galore — Secure, Multi-Vendor-Ready Gift Marketplace

Headquartered in Loharu, India, Gifts Galore is a secure, multi-vendor-ready e-commerce platform offering three gifting paradigms:
1. **Ready-Made Gifts**: Curated products ready for immediate fulfillment.
2. **Customizable Gifts**: Products configured with seller-defined customization fields (engraving, custom text, photo uploads).
3. **On-Demand Special Gifts**: Bespoke gift requests with seller review, feasibility confirmation, quotation, and customer approval.

---

## Architecture & Technology Stack

- **Frontend**: React 18, Vite, Bootstrap 5, React Router v6
- **Backend**: Node.js, Express.js (REST API under `/api/v1`)
- **Database**: PostgreSQL on Supabase, managed via Prisma ORM
- **Object Storage**: Supabase Storage for product images and customization uploads
- **Security**: Argon2id password hashing, HttpOnly SameSite cookies, CSRF defense, Helmet security headers, rate limiting, and zero exposed service keys

---

## Project Structure

```
GiftGlore/
├── .gsd/                 # GSD specifications, roadmaps, and phase plans
├── client/               # React + Vite + Bootstrap 5 frontend
├── server/               # Express.js REST API + Prisma ORM
├── README.md
└── .env.example
```

---

## Quickstart

### 1. Server Setup
```bash
cd server
npm install
cp .env.example .env
# Fill in DATABASE_URL and other configuration in .env
npm run dev
```

### 2. Client Setup
```bash
cd client
npm install
cp .env.example .env
npm run dev
```

### 3. Running Automated Tests
```bash
# Server tests
cd server
npm test

# Client build check
cd client
npm run build
```
