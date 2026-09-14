# Phase 20 Verification

## Endpoints Used
- `GET /api/pricing/organizations/{organization_pk}/agreements/` (Lead view of all agreements)
- `POST /api/pricing/organizations/{organization_pk}/agreements/` (Lead creates an agreement)
- `GET /api/pricing/organizations/{organization_pk}/agreements/mine/` (Student's own active agreements)

## Generated Schemas Used
- `PricingAgreement`
- `PricingAgreementCreate`
- `MyPricingAgreement`
- `Level`
- `ReasonEnum`

## Routes Created/Changed
- `/app/pricing` - Pricing Dashboard
- Navigation (`src/lib/navigation/config.ts`) updated with "Pricing" menu item for all authenticated users (tabs render dynamically based on role).

## Permissions Observed
- `activeRole` drives visibility of the creation form and the type of list fetched (mine vs all).
- Students see only their own agreements using `getMyAgreements()`.
- Admins/Leads/Owners can see the "New Agreement" form and `getAgreements()`.
- `403 Forbidden` responses from the backend are gracefully captured by `ErrorState` rather than crashing the page or showing an empty list falsely.

## Historical Data Semantics
- Created agreements snapshot the level's standard rate at generation time and store it explicitly along with the `agreed_rate`, preserving financial history independently of backend live tier changes.
- Inactive (superseded) agreements are intentionally displayed but visually deemphasized using opacity. They are never deleted, respecting the backend's append-only design.
- Currency handling defers completely to the backend string precision responses. No floating-point math was performed on the client.

## Testing & Results
- `@tanstack/react-query` query keys are accurately isolated using `['academy', academyId, 'pricing', ...]`.
- `Pricing Feature` test suite verifies:
  - Role-based rendering (Student vs Admin).
  - Empty states and successful data rendering.
  - Form integration with proper mock submission.
- `pnpm test` passes smoothly.

## Deferred Work
- Payouts and payments functionality explicitly excluded as per Section 19 of the Phase 20 specification.
