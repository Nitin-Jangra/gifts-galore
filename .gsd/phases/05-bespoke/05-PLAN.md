# Phase 5 Plan: Bespoke Workflow Engine

## Objective
Implement end-to-end bespoke on-demand gift commissions from initial customer submission through artisan review, quote provision, and customer quote acceptance.

## Scope & Deliverables
1. **Bespoke Request Lifecycle State Machine**:
   - `SUBMITTED`: Initial customer submission with description, reference links, budget, requested date.
   - `UNDER_REVIEW`: Artisan reviewing craftsmanship feasibility.
   - `QUOTED`: Artisan sets quote amount, estimated crafting days, and craft notes.
   - `CUSTOMER_APPROVED`: Customer accepts quote terms.
   - `ORDER_CREATED`: Linked order auto-generated for fulfillment.
2. **Backend API Endpoints**:
   - `POST /api/v1/bespoke`: Submit request (validated via Zod, CSRF verified).
   - `GET /api/v1/bespoke/my-requests`: Customer view of submitted commissions.
   - `GET /api/v1/bespoke/seller-requests`: Seller review queue.
   - `POST /api/v1/bespoke/:id/quote`: Seller provides quote terms.
   - `POST /api/v1/bespoke/:id/approve`: Customer accepts quote.
3. **Frontend UI**:
   - `BespokeRequestPage.jsx`: Form with budget, delivery date, description, and craftsmanship disclaimer.
4. **Automated Testing**:
   - Unit and integration tests covering the state machine transitions and invalid state rejections.
