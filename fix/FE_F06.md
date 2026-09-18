# F06 — Tenant-Aware Query Keys

Goal: centralize TanStack Query keys so every academy-scoped query includes the academy identifier.

Current audit: `AcademyProvider` relies on a key convention beginning with `['academy', activeAcademyId, ...]`; this is fragile when every feature constructs keys independently.

Create query-key factories for:
- organizations
- students
- teachers
- curriculum
- scheduling
- assessments
- progress
- pricing
- payouts
- notifications
- imports
- audit

Example:
`studentKeys.list(academyId, filters)`
`studentKeys.detail(academyId, studentId)`

Academy switch must:
1. update active academy
2. invalidate/remove incompatible tenant queries
3. avoid rendering old-academy cached data as current
4. refetch needed data for the new academy

A query key is not a security boundary.

Tests:
- A/B query keys differ
- academy switch invalidates/refetches
- tenant-scoped queries do not omit academy id
- mutations invalidate only relevant tenant data

Acceptance:
- key factories exist
- major features use them
- stale tenant data cannot appear as current
- tests pass

STOP.
