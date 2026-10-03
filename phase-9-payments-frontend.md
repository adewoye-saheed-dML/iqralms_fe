# Phase 9 (Frontend) — Wiring Up Subscription Billing & Tuition Collection

> Companion to the backend's `specs/phase-9-payments.md`, which is the
> source of truth for the API surface, webhook behaviour, and the
> business rules behind every screen below. This document does not
> re-decide anything that spec already decided — it only says where each
> piece lives in this codebase and how it's built, using the same
> patterns the curriculum-placement work (`decisions.md` D-007) and the
> minor-student dashboard (`decisions.md` D-008) already established.

## Goal

Two flows, matching the backend's 9a/9b exactly, each getting its own
feature folder, its own route, and its own nav entries per role:

```text
9a. Academy owner → IqraLMS       /app/billing   (owner/admin only)
9b. Family/parent → Academy       /app/payments  (student, parent)
```

Nothing here is a third thing. No general "Finance" page, no combined
owner+family screen — same reasoning the backend spec gives for keeping
`pricing` and `payouts` as separate concerns applies here.

## Prerequisite cleanup — do this first

`src/app/app/finance/` and `src/features/finance/` already exist and are
already stale: a pre-split "Academy Finance" page that predates `pricing`
and `payouts` being separated, still linked from
`owner-admin-dashboard.tsx` ("Academy Finance" card →
`/app/finance`) and still referenced in `navigation/config.ts`'s route
guards. `manage_finance` is still a live capability, used by
`finance-dashboard.tsx` and by `teacher-detail.tsx`
(`const canManageFinance = can('manage_finance', ...)`).

Building `/app/billing` next to an unremoved `/app/finance` creates a
third, confusing money surface, not a second one. Before any new code in
this spec:

1. Replace `teacher-detail.tsx`'s `canManageFinance` check with whichever
   of `manage_payouts` / `manage_pricing` actually matches what that
   screen gates — check the surrounding code to tell which.
2. Delete `src/app/app/finance/`, `src/features/finance/`, the "Academy
   Finance" card and its link in `owner-admin-dashboard.tsx`, the
   `/app/finance` route guards in `navigation/config.ts`, and the
   `manage_finance` capability and its case in `capabilities.ts`.
3. Verify `pnpm run typecheck`, `pnpm run lint`, and `pnpm run test`
   stay clean after the deletion, the same bar every change in this
   codebase has been held to.

## Scope

### 1. Capabilities

Add to `src/lib/permissions/capabilities.ts`, following the file's
existing pattern exactly (see `submit_placement`'s comment style):

```text
'manage_subscription'       owner/admin only — paying IqraLMS's own bill
                             is more sensitive than any academy-internal
                             action; not even a lead gets this.
'manage_payment_setup'      owner/admin only — bank details / subaccount
                             onboarding (§9b of the backend spec).
'view_organization_payments' owner/admin only. The backend spec's
                             Visibility section is explicit that a lead
                             teacher gets no subscription or tuition
                             visibility beyond what payouts already
                             exposes — do not extend this to
                             isOwnerAdminOrLead() the way
                             view_academy_payouts is.
'make_payment'               student only. Mirrors submit_placement's
                             exact shape: userRole === 'student' ||
                             activeRole === 'student'. A parent does not
                             get this capability — see below.
'view_own_payments'          student or parent — mirrors
                             view_own_progress's existing pattern.
```

A parent paying for a linked child is not a capability check on the
child's behalf — it's the parent's own action, scoped by which children
they're linked to, the same way `PlacementOutcomeList`'s `scope:
'children'` already works. No new capability is needed for "parent can
pay for their child"; `view_own_payments` plus the existing parent-child
linking is sufficient, and reusing that pattern instead of inventing a
new one keeps this consistent with how placements already solved the
identical shape.

### 2. Routes & navigation

```text
/app/billing            owner/admin only. Two sections: subscription
                         status, and the academy's own tuition payment
                         log (read-only, from §9b's FamilyPayment data).
/app/payments            student, parent. Outstanding balance + pay
                         action, and payment history.
/app/payments/callback   Paystack redirect target. Not in any nav list —
                         reached only via redirect after checkout.
```

Nav additions in `navigation/config.ts`:

- `owner_admin` case: `{ label: 'Billing', href: '/app/billing', icon:
  CreditCard, requiredCapability: 'manage_subscription' }`. Not added to
  `lead_teacher`'s case — see the capability note above.
- `student` case: `{ label: 'Payments', href: '/app/payments', icon:
  CreditCard }`.
- `parent` case: same `Payments` entry.
- **The minor-student simplified dashboard's tile list in
  `student-dashboard.tsx` (the `is_minor && is_fully_active` branch from
  D-008) does not get a payments tile.** This needs to be a deliberate
  decision every time that branch is touched, not an oversight — a minor
  initiating or even seeing a payment screen contradicts the backend
  spec's Visibility section outright.

### 3. API clients

Two feature folders, mirroring `pricing`/`payouts`'s existing separation
exactly — not one combined "payments" module, for the same reason the
backend keeps `FamilyPayment` and `PlatformSubscription` as unrelated
models.

`src/features/billing/api/billing.ts`:

```ts
import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

export type SubscriptionStatus = components['schemas']['SubscriptionStatus'];
export type BankDetails = components['schemas']['BankDetails'];
export type ResolvedAccount = components['schemas']['ResolvedAccount'];
export type OrganizationPayment = components['schemas']['FamilyPayment'];

export const billingApi = {
  getSubscriptionStatus: async (organizationId: number): Promise<SubscriptionStatus> => { ... },
  subscribe: async (organizationId: number): Promise<{ authorization_url: string }> => { ... },
  resolveAccount: async (
    organizationId: number,
    body: { bank_code: string; account_number: string }
  ): Promise<ResolvedAccount> => { ... },
  confirmPaymentSetup: async (
    organizationId: number,
    body: { bank_code: string; account_number: string }
  ): Promise<void> => { ... },
  getOrganizationPayments: async (organizationId: number): Promise<OrganizationPayment[]> => { ... },
};
```

`src/features/payments/api/payments.ts`:

```ts
import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

export type FamilyPayment = components['schemas']['FamilyPayment'];

export const paymentsApi = {
  getMyPayments: async (organizationId: number): Promise<FamilyPayment[]> => { ... },
  getChildPayments: async (organizationId: number): Promise<FamilyPayment[]> => { ... },
  initializePayment: async (
    organizationId: number,
    pricingAgreementId: number
  ): Promise<{ authorization_url: string; reference: string }> => { ... },
  verifyPayment: async (organizationId: number, reference: string): Promise<FamilyPayment> => { ... },
};
```

Exact schema type names depend on what the backend actually names its
serializers — confirm against `openapi/schema.yml` once §9a/§9b of the
backend spec ships, the same way every other feature in this codebase
generates its types from the real schema rather than hand-authoring them.

### 4. Query keys

Add to `src/lib/api/query-keys.ts`, same shape as `pricingKeys` and
`payoutsKeys` immediately above them:

```ts
export const billingKeys = {
  all: (academyId: AcademyId) => [...academyKeys.tenant(academyId), 'billing'] as const,
  subscription: (academyId: AcademyId) => [...billingKeys.all(academyId), 'subscription'] as const,
  organizationPayments: (academyId: AcademyId) =>
    [...billingKeys.all(academyId), 'organization-payments'] as const,
};

export const paymentsKeys = {
  all: (academyId: AcademyId) => [...academyKeys.tenant(academyId), 'payments'] as const,
  mine: (academyId: AcademyId) => [...paymentsKeys.all(academyId), 'mine'] as const,
  children: (academyId: AcademyId) => [...paymentsKeys.all(academyId), 'children'] as const,
};
```

### 5. Components

Named and scoped the same way the placement feature was built — a form,
a read-only list reused across two scopes, a role-aware panel composing
them. Do not build one monolithic "Payments" component the way the old
`finance-dashboard.tsx` did; that shape is exactly what's being removed
in the prerequisite cleanup.

```text
src/features/billing/components/
  subscription-status-card.tsx   Plan status, next charge date, a
                                  visible past_due warning banner wired
                                  to SubscriptionStatus.status.
  bank-details-form.tsx          Two-step: resolve (show the returned
                                  account name, "Is this you?"), then
                                  confirm. Mirrors the confirm-before-
                                  commit shape, not a single blind submit.
  organization-payments-list.tsx Read-only tuition log for the owner.
  billing-panel.tsx              Composes the three above into /app/billing.

src/features/payments/components/
  payment-initiate-card.tsx      Outstanding balance, a Pay button that
                                  redirects full-page to authorization_url
                                  — window.location.href, not a new tab.
  payment-history-list.tsx       scope: 'mine' | 'children', exactly the
                                  PlacementOutcomeList pattern.
  payments-panel.tsx             Composes the two above into /app/payments,
                                  role-aware the same way placements-panel.tsx
                                  is.
  payment-callback-view.tsx      /app/payments/callback's content.
```

### 6. Paystack redirect & callback handling

Both the owner's subscription charge and a family's tuition payment use
the same underlying pattern:

1. `initializePayment` / `subscribe` returns an `authorization_url`.
   Redirect the whole page to it — `window.location.href =
   authorization_url` — not `window.open`. A payment flow that leaves a
   stray tab behind is a worse experience than a full navigation away and
   back.
2. Paystack redirects back to `/app/payments/callback?reference=...`
   (or an equivalent billing callback for the subscription case).
3. `payment-callback-view.tsx` calls `verifyPayment`/the subscription
   equivalent for an immediate best-effort read, but — matching the
   backend spec's own rule that `charge.success` is the only thing that
   actually marks a payment `paid` — the callback view's copy should say
   something honest: *"Confirming this with Paystack — this page will
   update shortly"* rather than asserting success outright, and the
   payment-history list underneath is the thing that reflects the real,
   webhook-confirmed state. A brief poll (re-fetch `verifyPayment` every
   few seconds for under a minute) is reasonable here; treating the
   initial redirect as final is not.

## Visibility, restated for the frontend

Matches the backend spec's Visibility section exactly — this list exists
so a reviewer can check UI access against it without cross-referencing
the other document:

- **Owner/Admin**: `/app/billing` (subscription + organization tuition
  log), full access.
- **Lead Teacher**: none of this. No nav entry, no route access.
- **Sub-teacher**: none of this.
- **Student (adult)**: `/app/payments`, own history, can pay.
- **Parent**: `/app/payments`, linked children's history, can pay on
  their behalf.
- **Minor student**: nothing, anywhere, unconditionally.

## Explicitly out of scope

- Any UI for teacher disbursement — matches the backend spec, which
  rejected this outright, not deferred it.
- Any UI for percentage-based compensation — removed from the backend
  spec entirely; there is no corresponding frontend surface to build.
- A platform-owner cross-academy oversight dashboard — explicitly later,
  per the backend spec. This phase does not add anything toward it beyond
  what already exists in the data.
- Refund or reversal UI for a `paid` `FamilyPayment`.
- Editing a subaccount's bank details inline on `/app/billing` — the
  first version only needs one-time setup; a "change my bank details"
  flow is a reasonable follow-up, not part of this phase.

## Acceptance criteria

1. `/app/finance`, `features/finance`, and `manage_finance` no longer
   exist anywhere in the codebase before any new route is added.
2. An owner/admin can view subscription status and complete bank-details
   setup from `/app/billing`; a lead teacher cannot reach the route at
   all.
3. An adult student can view and pay their own outstanding balance from
   `/app/payments`.
4. A parent can view and pay a linked child's outstanding balance from
   the same route, scoped the same way placement outcomes already are.
5. A minor student's dashboard and nav contain no payment affordance of
   any kind.
6. The Pay button performs a full-page redirect, never opens a new tab.
7. The callback view never claims a payment succeeded before the
   payment-history list (backed by real, webhook-confirmed data) agrees.
8. `pnpm run typecheck`, `pnpm run lint`, and `pnpm run test` all pass.

## Suggested implementation breakdown

1. Prerequisite cleanup (above) — its own small, verifiable change.
2. Capabilities (§1) — schema-only, no UI yet.
3. `billing` and `payments` API clients + query keys (§3, §4), against
   real generated types once the backend ships §9a/§9b.
4. `/app/billing`: subscription status card, bank-details form, nav entry.
5. Organization tuition log on `/app/billing`.
6. `/app/payments`: payment history list (`mine`), payment-initiate card,
   nav entry for student.
7. Extend `/app/payments` for parent (`children` scope), nav entry for
   parent.
8. `/app/payments/callback` and the equivalent billing callback,
   including the polling behaviour described in §6.

## Manual testing checklist

- [ ] confirm `/app/finance` returns a 404 (route genuinely removed, not
      just unlinked);
- [ ] log in as a lead teacher, confirm no `Billing` nav entry and that
      navigating to `/app/billing` directly is refused;
- [ ] complete bank-details setup as an owner, confirm the resolved
      account name is shown before the subaccount is created, not after;
- [ ] as an adult student, pay an outstanding balance, confirm the
      full-page redirect (no new tab) and that the callback view doesn't
      claim success before the history list does;
- [ ] as a parent, pay for a linked minor child, confirm the child's own
      login shows no trace of a payment affordance;
- [ ] force a `past_due` subscription status in a test environment,
      confirm `subscription-status-card.tsx` shows a visible warning
      rather than silently looking identical to `active`.

## Definition of done

Every acceptance criterion above passes, all three of typecheck/lint/test
pass, and the two "Stop and ask" items below have recorded answers before
the relevant components are built.

## Stop and ask instead of guessing

- **Past-due presentation**: during the grace period between
  `invoice.payment_failed` and `subscription.disable` (`is_active` is
  still `True`), does the owner just see a warning banner on
  `/app/billing`, or does every page get an interstitial? The backend
  spec defines the state transitions; it doesn't define how loudly the
  frontend should react to `past_due` specifically versus `disabled`.
- **Bank-details timing**: is payment setup a required step during
  academy creation (`create-academy-form.tsx` already exists and already
  handles multi-step onboarding), or a settings action an owner completes
  whenever they get to it, with tuition payment simply unavailable until
  they do? Both are reasonable; they imply different UI, so this needs an
  answer before `bank-details-form.tsx` is placed.
