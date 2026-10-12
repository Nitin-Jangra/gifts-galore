---
phase: 0
plan: 1
wave: 1
gap_closure: false
---

# Plan 0.1: Foundation Scaffolding & Tooling Setup

## Objective
Establish the project workspace foundation by setting up the directory structure (`server/` and `client/`), configuring the backend Node/Express application with essential security middlewares, configuring environment templates (`.env.example`), setting up testing suites, and configuring the React + Vite + Bootstrap 5 frontend application.

## Context
Load these files for context:
- `.gsd/SPEC.md`
- `.gsd/ARCHITECTURE.md`
- `.gsd/ROADMAP.md`

## Tasks

<task type="auto">
  <name>Initialize Server Workspace and Dependencies</name>
  <files>
    server/package.json
    server/src/app.js
    server/src/server.js
    server/.env.example
  </files>
  <action>
    Create the server directory with package.json including express, helmet, cors, cookie-parser, dotenv, express-rate-limit, zod, and testing dependencies (jest or vitest, supertest).
    Implement `server/src/app.js` with security headers (helmet), CORS origin configuration, JSON body parsing with strict size limits, cookie parsing, health check route at `/api/v1/health`, and centralized error handling.
  </action>
  <verify>
    npm test in server directory
  </verify>
  <done>
    Server runs, /api/v1/health returns status 200 with JSON payload {"status": "ok", "service": "gifts-galore-api"}.
  </done>
</task>

<task type="auto">
  <name>Initialize Client Workspace with React, Vite, and Bootstrap 5</name>
  <files>
    client/package.json
    client/vite.config.js
    client/index.html
    client/src/main.jsx
    client/src/App.jsx
    client/src/styles/theme.css
  </files>
  <action>
    Create client directory configured with Vite, React, React Router DOM, Bootstrap 5, and theme design system (warm cream, terracotta/coral, refined neutrals).
    Setup basic router with public landing placeholder and navigation component.
  </action>
  <verify>
    npm run build in client directory
  </verify>
  <done>
    Client builds without errors with standard bundle output.
  </done>
</task>

<task type="auto">
  <name>Configure Prisma Schema Baseline</name>
  <files>
    server/prisma/schema.prisma
  </files>
  <action>
    Initialize Prisma configuration with PostgreSQL provider, setting up datasource and generator blocks.
  </action>
  <verify>
    npx prisma validate in server directory
  </verify>
  <done>
    Prisma schema is syntactically valid and ready for entity migrations.
  </done>
</task>

## Must-Haves
- [ ] Working Express backend with security headers and passing health check tests.
- [ ] Working Vite + React + Bootstrap 5 frontend building cleanly.
- [ ] Prisma schema baseline validated.
- [ ] All `.env.example` files documented without secrets.
