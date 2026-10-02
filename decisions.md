# Frontend Architecture Decisions

Record decisions that materially affect architecture or product behavior.

## D-001 — Separate frontend repository

Status: Accepted

The frontend is maintained separately from the Django backend.

Reason:

- independent lifecycle
- frontend-specific CI/CD
- cleaner separation
- safer AI-assisted iteration

## D-002 — Backend remains source of truth

Status: Accepted

Frontend logic consumes the backend contract and does not become a second domain-authority layer.

## D-003 — Recommended frontend stack

Status: Accepted

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui + Radix primitives
- TanStack Query
- React Hook Form
- Zod
- OpenAPI-generated TypeScript types/client
- TanStack Table
- Vitest + Testing Library
- Playwright
- pnpm

## D-004 — No Redux initially

Status: Accepted unless evidence changes

Use TanStack Query for server state and local React state for UI state. Add a global client store only when a concrete cross-feature requirement exists.

## D-005 — Feature-oriented structure

Status: Accepted

Feature/domain modules own domain behavior while shared UI remains small and reusable.

## Change policy

Do not silently replace important decisions. Add a new decision entry with the reason and impact.
\n## [2026-09-13] Phase 13.0 - Frontend Foundation
- Used `apiClient` wrapper for fetch to centralize configuration, authentication headers, error handling.
- Chose not to introduce global state for server data (relied on TanStack React Query).
- Stored academy context in a dedicated provider decoupled from auth to reflect 1 user -> many academies model.
- Configured navigation using `navigationConfig` object with allowed roles, instead of messy conditional JSX.

## D-006 — Token Storage

Status: Accepted

Auth token is stored in `localStorage`. The backend uses DRF TokenAuthentication (returning a token key in the response payload instead of an HTTP-only cookie). Therefore, the token must be stored client-side to be appended to the `Authorization` header of subsequent API requests. Since Next.js is primarily acting as a static SPA for the dashboard rendering, `localStorage` is the optimal approach without complicating SSR passing.

## D-007 — Resync `spec/FRONTEND_MASTER_SSoT.md` with the canonical v1.0 spec

Status: Accepted

Reason: the committed `spec/FRONTEND_MASTER_SSoT.md` was a pre-Phase-13 draft (34 loosely-numbered sections, no route map, no Phase 13.0–13.11 sequence, no D/O decision ledger) that no longer matched the owner's actual v1.0 "Frontend Master Specification" (13 Sep 2026). Any agent following `CLAUDE.md`'s instruction to treat that file as the SoT was building against an outdated plan. Replaced the file's content with the v1.0 spec verbatim; no application code was changed by this decision. `IQRA_LMS_FRONTEND_BACKEND_SSoT_REMEDIATION_AUDIT.md` is now explicitly named in `CLAUDE.md` as a subordinate, closeable punch-list rather than a competing source of truth.

## D-008 — Simplified home screen for verified minor students

Status: Accepted

Reason: `user.is_minor` and `user.is_fully_active` already exist and already gate
navigation (see `app-sidebar.tsx`'s restricted-minor filter) and the dashboard's
pending-verification state, but once a minor is verified they fell through to
the same dense, tab/badge-heavy dashboard built for adult students and
academy staff. Added a third branch in `student-dashboard.tsx`, gated on
`is_minor && is_fully_active`: one next-action card (join/book a class) with a
56px-tall primary button, and a 2x2 grid of large labeled tiles (schedule,
books, notifications, profile) instead of the tabbed bookings table. Adult
student, parent, teacher and owner/admin views are unchanged. Colors reuse the
existing `primary` token — no new palette. This does not touch the shared
`AppSidebar`/`AppLayout` chrome; a minor still navigates away from the
dashboard into the same sidebar-drawer pattern everyone else uses. Extending
the simplified, large-target treatment to the rest of the shell for minors is
a separate, not-yet-made decision.

## D-009 — Strict role isolation in assessment workflows & early learner navigation

Status: Accepted

Reason: When academy owners or admins (whose initial user account registration had `user.role === 'student'`) navigated to the assessment dashboard or assignments list, `isStudent` previously evaluated to true alongside `isTeacher`, incorrectly displaying student submission badges and "Submit Homework" action buttons to the owner. Resolved by enforcing authoritative role experience resolution (`resolveRoleExperience`) with mutual exclusivity: owner/admin and teacher contexts strictly manage assignments, review grading queues, and inspect student submissions, while only true students receive homework submission interfaces. Furthermore, refined the verified minor dashboard into an intuitive, picture-first experience with colorful high-contrast icons (Books, Homework/Recitation, Schedule, Stars) and large touch targets (56px–64px) tailored for young learners, including 4-year-olds.

## D-010 — Canonical Session Recordings & Scalable Academy Schedule Table View

Status: Accepted

Reason: Session Recordings and Audit are canonically managed under `/app/scheduling?tab=recordings`. The duplicate "Recordings & Audit" tab on `OwnerAdminDashboard` and its redundant sidebar entry were removed, and all dashboard links/cards were redirected to the canonical scheduling tab. Furthermore, replaced the 3-column card grid in `BookingList` for high-volume academy schedules with a responsive, high-density data table equipped with text search (student, teacher, level, session ID), status filter chips (Scheduled, Completed, Cancelled), timeline filter (Today, Upcoming, Past), pagination controls, and an optional grid/table view toggle.

## D-011 — Deactivation of "Enter Class Session" on Completed Bookings

Status: Accepted

Reason: Once a class session is concluded and marked as `completed`, the live classroom meeting room is closed and payout duration logged. Active entry actions ("Enter Class Session", "Join Class 🎥", "Class Session") across `BookingList`, Student, Parent, Teacher, and Owner dashboards must no longer be active or present for completed sessions. They are replaced by an immutable "Class Concluded" / "Concluded" indicator, preventing confusion, unauthorized re-entry into finished meetings, or false upcoming class prompts.

## D-012 — Dynamic Academy Tab Wording & White-Label Institution Customization

Status: Accepted

Reason: Rather than hardcoding generic "Quran Academy" branding, the browser document title dynamically binds to the active tenant academy name (e.g. `ikacad | Iqra LMS`, `dia | Iqra LMS`), while public marketing and unauthenticated pages display the platform branding `Iqra LMS - Quran Academy Platform` with the official Iqra LMS brand logo. In addition, institutions are provided white-label customization capabilities: academy owners and administrators can upload a custom academy icon/logo (rendered across sidebar crests, top navigation, and favicon for all academy personas: students, parents, teachers, and admins) and configure their academy display color (updating CSS variable `--primary` across buttons, navigation highlights, badges, and learning widgets).




