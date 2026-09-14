# Phase 20 — Pricing & Financial Agreements

**Repository:** `adewoye-saheed-dML/quran_fe`  
**Branch:** `main`  
**Status:** READY TO IMPLEMENT  
**Scope:** Academy pricing agreements and teacher/family-visible pricing information strictly against the live backend contract.

---

## 1. Phase readiness decision

Phase 19 — Assessment & Learning Progress — is now implemented in the frontend.

Evidence from the live repository:

- `spec/verification/phase-19-assessment-and-progress.md` is marked as the Phase 19 verification receipt.
- Assessment and progress routes are implemented under `/app/assessments` and `/app/progress`.
- The implementation uses academy-scoped TanStack Query keys.
- Assessment/progress permission boundaries and historical-data semantics were tested.
- The Phase 19 receipt documents explicit deferred work rather than claiming unsupported placement or rubric-builder functionality.

The repository's `CURRENT_PHASE.md` and historical `progress.md` remain stale and must not be treated as proof of phase status. The actual verification receipt is the stronger implementation evidence.

The next supported backend domain after assessment/progress is **pricing**. The frontend Master SSoT explicitly separates academy pricing from teacher payouts and places financial reconciliation after learning/assessment workflows.

---

## 2. Source-of-truth rules

Use these in order:

1. `spec/FRONTEND_MASTER_SSoT.md`
2. current `openapi/schema.yml`
3. generated TypeScript API types
4. backend authorization, tenancy, validation, and business rules

Never invent:

- pricing fields
- pricing calculation formulas
- permission rules
- payment status semantics
- teacher payout behavior
- financial states not exposed by the backend

The backend remains authoritative for all financial business rules.

---

## 3. Live pricing backend surface

The backend currently exposes pricing under:

```text
/api/pricing/organizations/{organization_pk}/
```

Confirmed route families:

```text
GET /agreements/
GET /agreements/mine/
```

The exact request/response schemas, editable fields, permissions, and business rules must be read from the current OpenAPI schema and backend implementation before coding.

Do not infer CRUD operations that are not present.

---

## 4. Phase 20 goal

Build a clear financial agreement experience that helps the relevant users understand:

- what pricing agreement applies;
- which academy it belongs to;
- which student/level or other backend-defined dimensions it covers;
- the financial status exposed by the backend;
- what actions are actually allowed.

The frontend must keep the two financial concepts separate:

```text
Academy pricing
≠
Teacher payouts
```

Do not build a combined "money" dashboard.

---

## 5. Contract audit before implementation

Before coding:

- inspect all `/api/pricing/` paths in `openapi/schema.yml`;
- inspect generated pricing schemas;
- inspect pricing serializers/views/models;
- identify read vs write operations;
- identify exact permissions for owner/admin/staff/teacher/student/parent;
- identify tenant scoping;
- identify whether agreements are historical, mutable, active/inactive, negotiated, or otherwise stateful;
- identify all supported filters/query parameters;
- identify error responses.

If the backend only supports read operations for the current phase, implement a read-only UX.

If write operations exist, implement only the exact supported fields.

---

## 6. Information architecture

Add:

```text
/app/pricing
```

Recommended experience:

```text
Pricing
→ current academy agreement(s)
→ agreement details
→ relevant user-facing financial information
```

Only add nested routes when the backend contract and UX require them.

Do not build `/app/payouts` in Phase 20.

Payouts follow as a separate phase because the SSoT explicitly distinguishes academy pricing from teacher payout history/statements/status.

---

## 7. Role behavior

The Master SSoT identifies pricing as an academy/admin concern.

Do not create client-only permissions.

The backend decides access.

Possible behavior:

### Owner/Admin

May see academy-level pricing agreements and supported management actions.

### Staff/Teacher

Only show pricing information if the backend explicitly permits it.

### Parent/Student

Only show pricing information if the backend exposes a corresponding allowed endpoint/view.

A backend `403` must render as forbidden, not as "no pricing found."

---

## 8. API architecture

Use:

```text
Page
→ feature hook/component
→ TanStack Query
→ typed API client
→ Django REST API
```

Expected structure:

```text
src/features/pricing/
├── api/
├── components/
├── hooks/
├── __tests__/
└── types/
```

Use generated OpenAPI types.

Do not add handwritten request/response models when generated types exist.

---

## 9. Tenant-safe query keys

All pricing data must be scoped by academy:

```ts
['academy', academyId, 'pricing', ...]
```

Examples:

```ts
['academy', academyId, 'pricing', 'agreements']
['academy', academyId, 'pricing', 'mine']
```

Do not use:

```ts
['pricing']
```

Academy switching must invalidate/refetch pricing state so one academy's agreement cannot remain visible after switching to another.

---

## 10. Pricing directory

Build a primary `/app/pricing` page that answers:

> What pricing agreement applies to this academy/user?

Provide:

- clear page title/description;
- useful agreement information;
- explicit current/historical status where backend exposes it;
- loading state;
- empty state;
- error state;
- forbidden state;
- responsive presentation.

Avoid decorative financial metric cards unless every metric answers an actual operational question supported by the backend.

---

## 11. Agreement detail

If the backend exposes a detail representation or an agreement collection with sufficient fields:

Display the exact backend-supported fields.

Potential concepts may include only if the contract confirms them:

- agreement status;
- negotiated rate;
- student;
- level;
- effective dates;
- approval information;
- relevant constraints.

Do not invent:

- invoices;
- payment gateways;
- balances;
- transaction histories;
- tax calculations;
- discounts;
- billing cycles.

Those are separate business capabilities unless explicitly exposed.

---

## 12. Create/update behavior

If the live contract permits academy management of pricing agreements:

Build forms using the exact generated request schemas.

Requirements:

- clearly identify required fields;
- use backend-supported validation;
- show server errors;
- show save/submitting state;
- prevent duplicate submissions;
- confirm success only after the server succeeds;
- invalidate pricing queries after a successful mutation.

Do not calculate or normalize money values independently from backend-defined semantics.

---

## 13. Money display

Use the backend's currency/amount fields exactly.

Do not assume:

- NGN;
- USD;
- cents;
- kobo;
- decimal scaling.

Read the generated schema and API response contract.

If a monetary amount is already represented as a decimal/string by the API, preserve precision and display it safely.

Never use floating-point arithmetic in the frontend to derive business amounts.

---

## 14. Historical semantics

If agreements are historical records:

- do not overwrite history in client state;
- clearly distinguish active/current from historical data when the backend exposes that distinction;
- do not delete or mutate historical records unless the API explicitly supports that operation.

The frontend should present financial history as backend-sourced records rather than recomputing it.

---

## 15. Error handling

Handle the status codes actually exposed by the pricing API, especially:

```text
400 validation/business rule
401 unauthenticated
403 forbidden
404 not found
409 conflict, if exposed
network/unexpected failure
```

Do not turn a `403` into an empty pricing screen.

Do not show "saved" until a mutation succeeds.

---

## 16. Accessibility

Follow the SSoT:

- associated labels;
- visible focus;
- keyboard-complete financial workflows;
- programmatic form errors;
- no color-only status;
- readable financial amounts;
- sufficient contrast;
- accessible dialogs if used.

Financial status should be explicit text, not only badges/colors.

---

## 17. Testing requirements

### Unit/component

Cover:

- loading;
- successful agreement rendering;
- empty state;
- forbidden state;
- API failure;
- create/update validation where applicable;
- successful mutation;
- mutation failure;
- query invalidation;
- academy-scoped query keys.

### Integration/API boundary

Verify exact pricing endpoint paths and generated payloads.

### E2E

Where fixtures permit:

```text
login
→ select academy
→ open pricing
→ inspect supported agreement information
→ perform one supported management action if available
→ verify resulting state
```

Do not fake financial success.

---

## 18. Navigation

Add:

```text
/app/pricing
```

to the authenticated navigation only if consistent with the current role-aware navigation architecture.

Do not add payouts as part of this phase.

---

## 19. Out of scope

Do not implement:

- teacher payouts;
- payout generation/finalization;
- statements;
- payment gateways;
- invoices;
- accounting;
- taxes;
- subscription billing;
- payment collection;
- financial analytics;
- external payment providers.

These require separate backend-supported work.

---

## 20. Completion gate

Phase 20 is complete only after:

```text
contract audit
→ implementation
→ generated API types verified
→ lint
→ typecheck
→ unit/component tests
→ build
→ E2E critical pricing workflow
→ academy-switch tenant review
→ verification receipt
→ tracker update
```

The verification receipt must record:

- exact pricing endpoints;
- exact generated schemas;
- routes changed;
- permissions observed;
- supported write operations;
- tests/results;
- build result;
- any backend limitations;
- explicitly deferred payout/payment functionality.

Do not mark complete because the pricing page renders.

---

## 21. Required implementation discipline

Before completion:

1. Re-read `spec/FRONTEND_MASTER_SSoT.md`.
2. Inspect current `openapi/schema.yml`.
3. Verify generated pricing types.
4. Inspect backend pricing serializers/views/models.
5. Implement only supported operations.
6. Run all applicable checks.
7. Create `spec/verification/phase-20-pricing.md`.
8. Only then update phase bookkeeping.

---

## 22. Deliverables

Expected:

```text
src/app/app/pricing/
src/features/pricing/
spec/verification/phase-20-pricing.md
```

Plus:

- navigation changes where appropriate;
- generated API type changes if required;
- pricing tests;
- any necessary shared financial display/form components.

---

## 23. Definition of Done

Phase 20 is done when the supported academy pricing workflow works end-to-end against the real backend contract, financial amounts and states are displayed without invented calculations, tenant boundaries remain intact, permissions are respected, important UI states are tested, and the verification receipt clearly distinguishes completed pricing functionality from deferred payouts/payment capabilities.
