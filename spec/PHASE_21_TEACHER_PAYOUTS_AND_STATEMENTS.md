# Phase 21 — Teacher Payouts & Statements

## Status

NEXT PHASE — implement only after Phase 20 Pricing & Financial Agreements remains green.

## Source-of-truth rule

Before changing frontend code, re-read the live repositories on `main`:

- Frontend: `adewoye-saheed-dML/quran_fe`
- Backend: `adewoye-saheed-dML/quran_acad`
- Frontend product/UX authority: `spec/FRONTEND_MASTER_SSoT.md`
- Exact API contract: `openapi/schema.yml`
- Backend authorization, tenancy, validation, financial rules: `quran_acad/payouts/*`

Do not infer payout behavior from the phase number, old trackers, or generic SaaS conventions.

## Verified backend surface

The backend currently exposes these tenant-scoped payout routes:

- `GET /api/payouts/organizations/{organization_pk}/mine/`
- `GET /api/payouts/organizations/{organization_pk}/statements/mine/`
- `GET /api/payouts/organizations/{organization_pk}/statements/`
- `POST /api/payouts/organizations/{organization_pk}/generate/`
- `GET /api/payouts/organizations/{organization_pk}/lead/`
- `POST /api/payouts/organizations/{organization_pk}/{pk}/finalize/`

Legacy unscoped payout routes are retired. Do not recreate them.

### Teacher-facing permissions

Teacher-facing endpoints require:

- authenticated user
- active organization membership
- teacher role

`/mine/` returns only the calling teacher's payout records.

`/statements/mine/` returns only the calling teacher's computed statement.

### Lead-facing permissions

Lead/owner/admin operations are protected by the backend's `IsLeadTeacher` rules:

- academy-wide payout listing
- any-teacher statement
- payout generation
- payout finalization

Students and parents have no payout endpoint and must not be given payout financial data through the frontend.

## Exact payout data shapes to consume

The backend currently returns payout records with these fields:

- `id`
- `booking`
- `cohort`
- `minutes_paid`
- `rate_used`
- `amount`
- `currency`
- `status`
- `status_display`
- `created_at`
- `finalized_at`

Teacher-facing records omit `teacher` because the caller is the teacher.

Lead-facing records additionally include:

- `teacher`

A payout's nested `booking` contains:

- `id`
- `student`
- `level`
- `track`
- `start_time_utc`
- `duration_minutes`
- `status`
- `status_display`
- `cohort`

Do not add family pricing fields to teacher payout views. The backend deliberately keeps negotiated family pricing private from payout serializers.

## Statement data shapes

Teacher statements expose:

- `period_start`
- `period_end`
- `session_count`
- `finalized_count`
- `total_amount`
- `currency`
- `status`
- `payouts`

Lead statements contain the same information plus the selected teacher.

A statement requires both `start` and `end`.

A list of personal payouts may optionally accept `start` and `end`.

Period semantics are half-open: `[period_start, period_end)` and backend parsing is UTC-oriented. Do not reinterpret period boundaries in the browser's local timezone.

## Generation behavior

Generation is a lead-only POST action.

Request body:

- `period_start`
- `period_end`
- optional `teacher`

The backend generation process is idempotent.

The response contains:

- `period_start`
- `period_end`
- `created_count`
- `skipped_count`
- `total_amount`
- `created`
- `skipped`

Each skipped item contains:

- `booking_id`
- `teacher_id`
- `reason`

The frontend must show skipped results clearly enough for a lead to understand why a session was not converted into a payout. Do not silently discard the skipped array.

A repeat generation may return zero newly created records. Do not treat this as an error.

## Finalization behavior

Finalization is lead-only and one-way.

- `POST /api/payouts/organizations/{organization_pk}/{pk}/finalize/`
- A finalized payout cannot be edited back.
- A stale/repeated finalization can return `409 Conflict`.

Treat `409` as a state conflict with a useful user-facing message, not as a generic network failure.

## Frontend route

Create:

- `/app/payouts`

The route should support role-aware views rather than inventing separate public routes.

Suggested experience:

### Teacher view

Show:

- current/selected statement period
- total amount
- currency
- session count
- finalized count
- payout status
- payout rows with session context
- clear empty state when no payout records exist

A teacher must never see another teacher's payouts.

### Lead/admin/owner view

Show:

- academy-wide payout list
- optional teacher filtering
- period filtering
- statement lookup for a selected teacher
- generation action
- generation result summary
- skipped booking reasons
- finalization control for individual generated payouts

Do not imply that generation equals payment transfer. The backend records payout amounts; this phase does not add a payment gateway, transfer execution, invoice system, payroll tax engine, or external bank integration.

## API client requirements

Use the generated API contract wherever generated client infrastructure already exists.

Do not invent endpoint names, fields, or alternate request payloads.

All server access belongs in the API/data layer, not in page presentation components.

Use tenant-safe TanStack Query keys in the established project pattern, for example:

- `['academy', academyId, 'payouts', ...]`

Include relevant period and teacher filters in the query key.

Mutations that change payout state must invalidate the correct academy-scoped payout queries.

## Financial display rules

- Treat backend `amount`, `rate_used`, and `total_amount` as authoritative.
- Do not perform floating-point financial arithmetic in UI code.
- Do not invent currency codes or currency symbols.
- Render the backend `currency` value consistently.
- Preserve precision from backend responses.
- Make the distinction between generated/unfinalized and finalized records obvious.
- Do not expose private pricing agreement notes or negotiated family pricing to teachers.

## Authorization and tenant safety

The frontend must remain defense-in-depth only.

The backend remains authoritative for:

- organization membership
- role checks
- teacher identity
- period validation
- payout eligibility
- payout amounts
- generation idempotency
- finalization state
- concurrency conflicts

Every request must use the active academy context.

Never cache payouts across academies under a global key.

A role-based UI restriction is useful for UX, but a `403` response must still be handled correctly.

## Recommended component structure

Keep page components focused on composition.

Use reusable components for:

- period selector
- payout summary
- payout table/list
- statement header
- statement totals
- generation form
- generation result/skipped list
- finalize confirmation
- empty/error/403 states

Do not put raw `fetch` calls or backend field-mapping logic inside visual components.

## UX states that must be handled

For every payout/statement surface:

- loading
- success
- empty
- `403 Forbidden`
- validation errors (`400`)
- `409 Conflict` for finalization/generation state conflicts
- generic server failure

Generation should also expose created/skipped results instead of only a success toast.

## Testing requirements

Add or update tests for at least:

### Teacher

- teacher sees only `/mine/`
- teacher statement requires a valid period
- empty payout history renders correctly
- payout/session fields render from real API shapes
- another teacher's records are never displayed

### Lead/admin/owner

- academy-wide payouts render
- teacher filtering is scoped to the current academy
- statement lookup uses required teacher and period inputs
- generation submits the exact backend request shape
- generation displays created and skipped results
- repeated generation with `created_count = 0` is handled as a successful no-op
- finalization handles success
- finalization handles `409`

### Tenant isolation

- switching academy changes payout query keys
- no payout result from academy A remains visible for academy B
- `403` is rendered as forbidden, not as an empty success state

Run the project's normal test command and build command before marking the phase complete.

## Verification receipt

Only mark Phase 21 complete after all of the following are true:

1. `/app/payouts` is implemented and reachable.
2. Exact backend payout endpoints are used.
3. Generated schemas/client types are used where available.
4. Teacher and lead/admin experiences respect backend permissions.
5. Payouts remain academy-scoped.
6. Statement period handling matches backend UTC/half-open semantics.
7. Generation exposes created and skipped results.
8. Finalization handles one-way state and `409`.
9. No payment gateway, banking, tax, invoice, or subscription behavior is invented.
10. Tests pass.
11. Production build passes.
12. A verification receipt is added at:
   `spec/verification/phase-21-payouts.md`
13. The receipt records exact endpoints used, routes, permission behavior, tests, build result, and any explicitly deferred work.

## Explicitly deferred unless the backend contract proves otherwise

Do not add:

- bank transfers
- payment-provider integrations
- invoices
- tax calculations
- payroll exports
- automatic teacher payment execution
- family billing collection
- editable historical payout amounts
- custom payout formulas in the frontend
