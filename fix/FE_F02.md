# F02 — Remove Duplicate API Types

Goal: remove handwritten copies of API schemas.

Audit targets:
- `src/features/students/api/students.ts`
- `src/features/onboarding/api/onboarding.ts`
- `src/features/staff/api/staff.ts`
- `src/types/**`
- `src/lib/api/**`

Search:
```bash
rg 'interface |type ' src/features src/types
rg 'StudentEnrollment|Membership|AssignableRole|CreateOrganizationPayload|CreateTrackPayload' src
```

For each transport type:
1. Find its generated OpenAPI equivalent.
2. Replace it with the generated type.
3. Keep UI-only view/form models separate and explicitly named.
4. Never use `any` to hide a contract mismatch.
5. If OpenAPI and backend disagree, record the mismatch instead of guessing.

Allowed: form state, table rows, UI unions, derived view models.
Not allowed: duplicate API response/request schema definitions.

Acceptance:
- API-facing feature types use generated contract types
- no obvious duplicate transport interfaces remain
- UI types are clearly distinct
- no `any` workaround
- tests/typecheck pass

STOP.
