# Phase 14 — Academy Onboarding & Initial Setup Verification

## Environment
Commands run locally after implementation of Phase 14.

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
$ pnpm test run src/features/onboarding

> quran-academy-frontend@0.1.0 test /home/woyes/projects/quranfe
> vitest run src/features/onboarding

 ✓ src/features/onboarding/__tests__/create-academy-form.test.tsx (2 tests)
 ✓ src/features/onboarding/__tests__/curriculum-setup.test.tsx (3 tests)
 ✓ src/features/onboarding/__tests__/onboarding-wizard.test.tsx (5 tests)

 Test Files  3 passed (3)
      Tests  10 passed (10)
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
 ✓ Generating static pages (8/8) 
 ✓ Finalizing page optimization    

Route (app)                                Size     First Load JS
┌ ○ /                                      138 B          83.2 kB
├ ○ /_not-found                            882 B          83.9 kB
├ ○ /app/academy/create                    322 B          96.1 kB
├ ○ /app/dashboard                         249 B          95.2 kB
├ ○ /app/onboarding                        451 B          98.2 kB
├ ○ /app/onboarding/curriculum             294 B          96.8 kB
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
 M src/app/app/layout.tsx
 A src/app/app/academy/create/page.tsx
 A src/app/app/onboarding/page.tsx
 A src/app/app/onboarding/curriculum/page.tsx
 A src/features/onboarding/__tests__/create-academy-form.test.tsx
 A src/features/onboarding/__tests__/curriculum-setup.test.tsx
 A src/features/onboarding/__tests__/onboarding-wizard.test.tsx
 A src/features/onboarding/api/onboarding.ts
 A src/features/onboarding/components/create-academy-form.tsx
 A src/features/onboarding/components/curriculum-setup.tsx
 A src/features/onboarding/components/onboarding-wizard.tsx
```

## End-to-End Verification
- **Create Academy:** Authenticated users without an academy are prompted in `AppLayout` to create one via `/app/academy/create`. Submission triggers POST `/api/organizations/`. The layout bypass allows accessing the create page even when blocked from other tenant routes.
- **Onboarding Setup Wizard:** Available at `/app/onboarding`. Queries `/api/curriculum/organizations/{id}/tracks/`.
- **Completion States:** Properly reflects "Academy Details" as completed immediately since timezone and name are provided at creation. "Curriculum" requires at least 1 track. All other feature phases (Teachers, Students, Classes, Notifications) are visibly marked as Pending/Coming soon, preventing false completion.
- **Curriculum Setup Boundary:** Admins can POST `/api/curriculum/organizations/{id}/tracks/` using the `CurriculumSetupForm`. Auto-generates valid URL slugs dynamically. Success invalidates cache and redirects back to the wizard, marking curriculum setup as "Complete" and making the academy "Ready".
