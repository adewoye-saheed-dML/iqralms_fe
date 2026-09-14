# Phase 21 Verification

## Endpoints Used
- `GET /api/payouts/organizations/{organization_pk}/lead/` (Lead: all payouts)
- `GET /api/payouts/organizations/{organization_pk}/mine/` (Teacher: own payouts)
- `GET /api/payouts/organizations/{organization_pk}/statements/` (Lead: teacher statement)
- `GET /api/payouts/organizations/{organization_pk}/statements/mine/` (Teacher: own statement)
- `POST /api/payouts/organizations/{organization_pk}/generate/` (Lead: generate payouts)
- `POST /api/payouts/organizations/{organization_pk}/{pk}/finalize/` (Lead: finalize payout)

## Generated Schemas Used
- `TeacherPayout`
- `MyTeacherPayout`
- `Statement`
- `MyStatement`
- `PayoutGenerate`
- `GenerationResult`
- `SkippedBooking`
- `PayoutSession`
- `PayoutStatusEnum`
- `StatementStatusEnum`

## Routes Created/Changed
- `/app/payouts` - Main Payouts and Statements dashboard.
- Navigation (`src/lib/navigation/config.ts`) updated with "Payouts" menu item, exposed only to `['owner', 'admin', 'staff', 'teacher']`.

## Permissions Observed
- `activeRole` checks drive visibility (Lead vs Teacher/Sub tabs). Students/parents are completely blocked from viewing the feature.
- Teacher-specific endpoints are correctly hit for Teacher roles (`/mine/`).
- 403 Forbidden is rendered gracefully in all components.

## Payout Semantics
- `amount` and `rate_used` strings from the backend are rendered cleanly without local math manipulation.
- Generated payouts vs Finalized payouts are distinctly handled with correct `PayoutStatusEnum` badges.
- Finalize mutation explicitly catches `409` conflicts and surfaces it inline (useful for repeated button smashes or stale data).
- Generation form exposes `created_count`, `skipped_count`, and `total_amount`, alongside a list of `skipped` bookings detailing exact reasons (e.g., `no_payout_rate`).

## Testing & Results
- Query keys are securely scoped `['academy', academyId, 'payouts', ...]`.
- `Payouts Feature` test suite verifies:
  - Teacher view blocking empty states and rendering statement payouts accurately.
  - Lead view allowing generation and properly mapping backend skipped booking objects.
- `pnpm test` passes completely.

## Deferred Work
- Explicitly deferred actual bank transfers, integrations, payroll tax engines, and physical invoicing. The frontend stops precisely at generation and finalization per the SSoT.
