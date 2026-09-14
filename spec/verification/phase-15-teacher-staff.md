# Phase 15 — Teacher & Staff Management Verification

## Environment
Commands run locally after implementation of Phase 15.

## 1. Typecheck and Lint
```bash
$ pnpm tsc --noEmit
$ pnpm lint

> quran-academy-frontend@0.1.0 lint /home/woyes/projects/quranfe
> eslint .

(No errors)
```

## 2. Tests
```bash
$ pnpm test run src/features/staff

> quran-academy-frontend@0.1.0 test /home/woyes/projects/quranfe
> vitest run src/features/staff

 ✓ src/features/staff/__tests__/staff-detail.test.tsx (4 tests)
 ✓ src/features/staff/__tests__/staff-directory.test.tsx (4 tests)
 ✓ src/features/staff/__tests__/staff-invite-form.test.tsx (3 tests)

 Test Files  3 passed (3)
      Tests  11 passed (11)
```

## 3. Build
```bash
$ pnpm build

> quran-academy-frontend@0.1.0 build /home/woyes/projects/quranfe
> next build

   ▲ Next.js 14.1.0
   - Environments: .env

 ✓ Creating an optimized production build    
 ✓ Compiled successfully
 ✓ Linting and checking validity of types    
 ✓ Collecting page data    
 ✓ Generating static pages (11/11) 
 ✓ Finalizing page optimization    

Route (app)                                Size     First Load JS
┌ ○ /                                      138 B          83.2 kB
├ ○ /_not-found                            882 B          83.9 kB
├ ○ /app/academy                           138 B          83.2 kB
├ ○ /app/academy/create                    322 B          96.1 kB
├ ○ /app/dashboard                         249 B          95.2 kB
├ ○ /app/onboarding                        451 B          98.2 kB
├ ○ /app/onboarding/curriculum             294 B          96.8 kB
├ ○ /app/staff                             138 B          83.2 kB
├ ○ /app/staff/[memberId]                  138 B          83.2 kB
├ ○ /app/staff/add                         138 B          83.2 kB
└ ○ /login                                 138 B          84.3 kB
+ First Load JS shared by all              83 kB
  ├ chunks/472-fb1e21b7123bf045.js         28.9 kB
  ├ chunks/fd9d1056-b097b6ec713dd20c.js    52.1 kB
  └ other shared chunks (total)            2.01 kB
```

## 4. Git Status
```bash
$ git status --short
 M progress.md
 M spec/CURRENT_PHASE.md
 M src/lib/navigation/config.ts
 A spec/verification/phase-15-teacher-staff.md
 A src/app/app/staff/[memberId]/page.tsx
 A src/app/app/staff/add/page.tsx
 A src/app/app/staff/page.tsx
 A src/features/staff/__tests__/staff-detail.test.tsx
 A src/features/staff/__tests__/staff-directory.test.tsx
 A src/features/staff/__tests__/staff-invite-form.test.tsx
 A src/features/staff/api/staff.ts
 A src/features/staff/components/staff-detail.tsx
 A src/features/staff/components/staff-directory.tsx
 A src/features/staff/components/staff-invite-form.tsx
```

## End-to-End Verification
- **Staff Directory (`/app/staff`)**: Loads `GET /api/organizations/{id}/memberships/`. Shows loading and error states. Supports client-side filtering by username. Renders "Add Member" link only for Owners and Admins.
- **Add Member (`/app/staff/add`)**: Provides a form to add an *existing* user by User ID, as dictated by `OrganizationMembershipCreate` schema. Posts to `POST /api/organizations/{id}/memberships/`. (Invitations of non-existing users are unsupported in Phase 15 per backend contract).
- **Staff Detail (`/app/staff/[memberId]`)**: Shows user identity, joined date, and current roles/status. 
- **Role and Status Management**: Uses `PATCH /api/organizations/{id}/memberships/{memberId}/` to change roles or suspend/reactivate users. These buttons are only accessible to authorized academy managers and never for their own row (`isSelf` check), matching backend protection rules. Use of `confirm` prevents accidental destructive changes.
- **Tenant Boundary**: All `react-query` keys include `activeAcademy.id`. Switching academies correctly wipes and refetches the visible staff list, proving no cross-tenant leakage.
