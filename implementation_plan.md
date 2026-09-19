# IQRA LMS Frontend Implementation Plan

## Overview
This implementation plan guides the frontend correction for the IQRA LMS Next.js application strictly following `IQRA_LMS_FRONTEND_CORRECTION_PLAYBOOK.md`.
The backend contract in `adewoye-saheed-dML/iqralms` (replicated in `openapi/schema.yml`) is the single source of truth.

---

## Phase F00 — Baseline Inspection & Mismatches
- **Status**: Completed inspection. Baseline test/lint/typecheck/build commands executed.
- **Identified Mismatches**:
  1. **Build failure**: 26 files have `'use client'` positioned after import statements instead of the first line, causing Next.js 16 build to fail.
  2. **Typecheck failure**: 33 TypeScript errors across 17 files due to schema mismatch, wrong types (`PatchedTrackUpdate` vs `PatchedTrackWrite`), missing query params in pricing/progress, missing track levels in booking form, and handwritten type casts.
  3. **Lint failure**: 147 problems (96 errors, 51 warnings) primarily consisting of explicit `any`, `@ts-ignore` comments, and unused expressions/vars.
  4. **Unit test failure**: 7 failed test files (25 failed tests) in `academy-provider.test.tsx`, `auth.test.ts`, and `config.test.ts`.
  5. **E2E test failure**: Playwright fails due to unreachable server, legacy `/app/staff` routing, and token key mismatch.

---

## Phase F01 — OpenAPI Schema is the Only API Transport Authority
- **Goal**: Regenerate types from `openapi/schema.yml` and eliminate handwritten transport types, `any`, and `as unknown as` casts.
- **Tasks**:
  1. Run `pnpm generate:api` to update `src/lib/api/schema.d.ts` from `openapi/schema.yml`.
  2. Remove `interface StudentEnrollmentView` and handwritten interfaces in `src/features/students/api/students.ts`. Use canonical `StudentList` and `StudentDetail` schemas.
  3. Remove `export type AddMemberPayload = any` and undocumented `apiClient.POST('/api/organizations/{organization_pk}/memberships/')` in `src/features/staff/api/staff.ts`.
  4. Correct `PatchedTrackUpdate` to `PatchedTrackWrite` in `src/features/curriculum/api/curriculum.ts`.
  5. Align `src/features/pricing/api/pricing.ts` with OpenAPI schema (require `query: { student_id: number }`).
  6. Align `src/features/progress/api/progress.ts` with OpenAPI schema (require `query: { track_id: number }`).
  7. Align `src/features/notifications/api/notifications.ts` with OpenAPI schema.

---

## Phase F02 — Rebuild the API Client Boundary
- **Goal**: Establish a unified, typed API transport boundary and normalized error handling.
- **Tasks**:
  1. Fix `'use client'` placement at the top of all 26 components to restore proper client component boundary.
  2. Ensure all UI components interact via feature hooks / TanStack Query, not raw fetch calls.
  3. Normalize `ApiError` handling for 401 (unauthenticated), 403 (forbidden), 404 (not found), 400 (validation), 409 (conflict), 5xx (server error).
  4. Prevent raw HTML/Django stack traces from leaking into UI.

---

## Phase F03 — Authentication Contract
- **Goal**: Use DRF token authentication contract and unify storage keys across application and test suites.
- **Tasks**:
  1. Unify storage key to `auth_token` everywhere (fix `quran_fe_token` occurrences in `e2e/critical-journeys.spec.ts`).
  2. Replace `@ts-ignore` with `@ts-expect-error` or typed handling in `auth-provider.tsx`.
  3. Fix `src/lib/auth/__tests__/auth.test.ts` to properly mock or handle client requests without ECONNREFUSED.
  4. Verify login, `/me`, logout, and 401 token invalidation workflows without fake refresh-token logic.

---

## Phase F04 — Role Model: Global Role vs Academy Role
- **Goal**: Strictly decouple global user account role (`User.role`: lead, sub, student, parent) from academy membership role (`OrganizationMembership.role`: owner, admin, staff, teacher).
- **Tasks**:
  1. Fix `src/lib/academy/__tests__/academy-provider.test.tsx` to not pass global role `'lead'` as membership role.
  2. Verify capability checks evaluate the correct role context (`activeRole` for academy permissions, `userRole` for personal account permissions).

---

## Phase F05 — Capability Matrix Must Match Backend Permissions
- **Goal**: Align frontend capability checks in `src/lib/permissions/capabilities.ts` with backend permission classes.
- **Tasks**:
  1. Verify capability permissions:
     - `manage_academy`: owner, admin
     - `manage_curriculum`: owner, admin
     - `manage_staff`: owner, admin
     - `manage_students`: owner, admin
     - `manage_scheduling`: owner, admin, staff, teacher
     - `view_own_schedule`: student, parent, teacher
     - `manage_finance`: owner, admin
     - `view_own_payouts`: teacher, staff
     - `view_academy_payouts`: owner, admin
  2. Fix `src/lib/navigation/config.ts` and test `src/lib/navigation/__tests__/config.test.ts` so `allowedOrgRoles` matches expectations.

---

## Phase F06 — Academy Context and Tenant Query Keys
- **Goal**: Centralize tenant query keys with academy ID and clean up stale cache on academy switch.
- **Tasks**:
  1. Ensure all tenant-scoped queries use centralized factories in `src/lib/api/query-keys.ts` containing the `academyId`.
  2. On academy switch in `AcademyProvider`, clear stale tenant queries and refetch active academy data.
  3. Fix test mock structure in `src/lib/academy/__tests__/academy-provider.test.tsx`.

---

## Phase F07 — Correct Teacher/Staff Invitation Workflow
- **Goal**: Replace direct membership creation with proper backend invitation API workflow.
- **Tasks**:
  1. Update `src/features/staff/api/staff.ts` or add `invitationsApi` calling `POST /api/organizations/{organization_pk}/invitations/` with `email` and `role`.
  2. Update `staff-invite-form.tsx` to collect email and role rather than User ID.
  3. Display pending invitations with pending status.
  4. Support invitation acceptance via `POST /api/organizations/{organization_pk}/invitations/accept/`.

---

## Phase F08 — Student Enrollment Workflow
- **Goal**: Update student management to focus on `StudentEnrollment` with track, level, status.
- **Tasks**:
  1. Update `add-student-form.tsx` to collect student user ID, track, level, status using OpenAPI schemas.
  2. Update `student-directory.tsx` and `student-detail.tsx` to consume canonical `StudentList` and `StudentDetail` types.
  3. Ensure tenant isolation and invalidation by academy ID.

---

## Phase F09 — Onboarding Must Stop Guessing
- **Goal**: Replace arbitrary collection length heuristics with explicit supported backend facts.
- **Tasks**:
  1. Remove `staff.length > 1`, `tracks.length > 0`, `students.length > 0` heuristics.
  2. Model onboarding steps with verifiable backend facts. Uncontracted steps marked cleanly as not yet configured.

---

## Phase F10 — Teachers vs Staff Route Architecture
- **Goal**: Standardize on `/app/teachers` for teacher management, distinguishing from organization staff.
- **Tasks**:
  1. Ensure primary teacher routes are `/app/teachers`, `/app/teachers/add`, `/app/teachers/[memberId]`.
  2. Remove legacy `/app/staff` references from navigation, tests, and links.

---

## Phase F11 — Scheduling, Finance and Payout Alignment
- **Goal**: Ensure tenant parameter inclusion and proper role segregation for scheduling and financial data.
- **Tasks**:
  1. Fix `booking-form.tsx` to fetch levels for the selected track dynamically via `curriculumApi.getLevels`.
  2. Fix `lead-payouts-view.tsx` to handle teacher string/object schema correctly.
  3. Restrict `/app/finance` to owner/admin, `/app/payouts` to teacher personal earnings.

---

## Phase F12 — Tests, Build, Accessibility and Documentation
- **Goal**: Complete verification across lint, typecheck, unit tests, build, and Playwright E2E.
- **Tasks**:
  1. Resolve all remaining ESLint errors (eliminate explicit `any` where possible, remove unused vars).
  2. Update `e2e/critical-journeys.spec.ts` for all 11 critical user journeys against real UI controls.
  3. Verify `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm test run`, `pnpm build`, and `pnpm test:e2e`.
  4. Complete `CORRECTION_PROGRESS.md` with command evidence.
