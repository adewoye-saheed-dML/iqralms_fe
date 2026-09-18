# F05 — Route and Navigation Correction

Goal: align authenticated routes with the SSoT without destroying working workflows.

Target routes:
`/app`, `/app/dashboard`, `/app/academy`, `/app/students`, `/app/teachers`, `/app/curriculum`, `/app/scheduling`, `/app/assessments`, `/app/pricing`, `/app/payouts`, `/app/notifications`, `/app/audit`, `/app/settings`, `/app/profile`, plus `/accept-invitation`.

Audit finding: current implementation uses `/app/staff`, `/app/staff/add`, `/app/staff/[id]`, which mixes teaching and general membership administration.

Instructions:
1. Inspect route tree, links, tests and imports.
2. Map existing reusable components into the People/Teachers model.
3. Make `/app/teachers` the primary teacher route where supported.
4. Use intentional redirects only when appropriate.
5. Preserve useful deep links.
6. Keep unsupported routes staged instead of implying missing backend capability.
7. Consume F04 capabilities.

Guard states must distinguish unauthenticated, loading, no selected academy, forbidden, and not-found.

Tests:
- owner/admin access
- teacher access
- parent/student access
- forbidden management route
- old staff route migration if retained

Acceptance:
- route model aligns with SSoT where API supports it
- generic staff is no longer the primary teacher representation
- navigation is capability-aware
- backend remains authoritative

STOP.
