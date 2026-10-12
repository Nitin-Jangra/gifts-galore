---
phase: 3
plan: 1
wave: 1
gap_closure: false
---

# Plan 3.1: Product Customization Engine & Personalization Snapshot

## Objective
Implement product-specific customization field configurations for eligible products (`CUSTOMIZABLE`). Allow sellers to define custom fields (text, character limits, instructions, reference image uploads, dropdown options, and display order) with strict ownership checks. Implement server-side customer personalization validation against the product's defined schema, generating immutable customization snapshots. Provide an honest, accessible UI for personalization with clear notices.

## Context
Load these files for context:
- `.gsd/SPEC.md`
- `.gsd/ARCHITECTURE.md`
- `.gsd/ROADMAP.md`
- `server/prisma/schema.prisma`

## Tasks

<task type="auto">
  <name>Implement Customization Fields Validation & Repository</name>
  <files>
    server/src/validations/customization.validation.js
    server/src/repositories/customization.repository.js
  </files>
  <action>
    - Create Zod validation schemas for defining customization fields (label, fieldType, isRequired, maxLength, maxFileSizeMb, allowedFileTypes, optionsJson, displayOrder).
    - Create Zod validation schema for customer input validation against field rules.
    - Create repository for CRUD on CustomizationField entity.
  </action>
  <verify>
    vitest run tests/customization.test.js
  </verify>
  <done>
    Sellers can configure product custom fields. Repository queries return ordered custom fields for products.
  </done>
</task>

<task type="auto">
  <name>Implement Customization Service, Controller & Routes</name>
  <files>
    server/src/services/customization.service.js
    server/src/controllers/customization.controller.js
    server/src/routes/customization.routes.js
  </files>
  <action>
    - Service verifies product is CUSTOMIZABLE and seller owns the product before creating/modifying customization fields.
    - Implement `validateCustomerPersonalization(productId, customerInputs, files)` to rigorously validate text lengths, required fields, and upload formats.
    - Generate immutable JSON snapshot suitable for cart and order preservation.
    - Connect routes under `/api/v1/products/:productId/custom-fields`.
  </action>
  <verify>
    vitest run tests/customization.test.js
  </verify>
  <done>
    Customization fields can be added, updated, deleted by owner seller. Customer personalization validation passes when valid and rejects missing required fields or length overflows.
  </done>
</task>

<task type="auto">
  <name>Integrate Frontend Customization Form & Honest Preview Notice</name>
  <files>
    client/src/components/CustomizationForm.jsx
    client/src/pages/ProductDetailPage.jsx
  </files>
  <action>
    - Create CustomizationForm component dynamically rendering fields based on product customization schema.
    - Clearly display notice: "Artisans handcraft every piece according to your specified instructions. Colors and natural wood/metal grains may vary slightly from photographs." (No fake live previews).
    - Provide file upload for reference images and character counters for custom text engraving.
  </action>
  <verify>
    npm run build in client/
  </verify>
  <done>
    Frontend builds without errors and allows customers to personalize customizable gifts.
  </done>
</task>

## Must-Haves
- [ ] Product customization is product-specific (only eligible products).
- [ ] Seller ownership check strictly enforced on field configuration.
- [ ] Customer inputs validated against field definitions (required, max length, allowed file types).
- [ ] Immutable snapshot format created.
- [ ] Transparent UI notice explaining artisanal handcrafting rather than fake previews.
