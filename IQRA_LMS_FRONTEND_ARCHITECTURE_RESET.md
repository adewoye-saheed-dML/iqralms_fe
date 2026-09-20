# IQRA LMS Frontend — Architecture Reset & Product Flow Correction

Repository: `adewoye-saheed-dML/iqralms_fe`

Backend: `adewoye-saheed-dML/iqralms`

Primary reference: `spec/FRONTEND_MASTER_SSoT.md`

## Purpose

The current frontend does not match the intended product experience.

Reset the frontend around these separate experiences:

```text
PUBLIC MARKETING
    ↓
PRICING / ACCESS
    ↓
LOGIN
    ↓
ACCESS CHECK
    ↓
ACADEMY OWNER ONBOARDING
    ↓
INVITE PEOPLE
    ↓
ROLE-SPECIFIC DASHBOARD
```

Do not continue patching the current dashboard into compliance.

---

# 1. Public product

Required public routes:

```text
/
/about
/features
/pricing
/contact
/login
/accept-invitation
```

`/` must be a real marketing landing page, not the default Next.js starter page.

The marketing experience should explain the actual product, its users, core capabilities, academy workflow, pricing/access CTA, and contact path.

Do not invent customer numbers, testimonials, awards, revenue, or unsupported capabilities.

---

# 2. Registration and access

The current public `/register` role selector is not the intended product flow.

Do not offer public self-registration as:

```text
Student
Parent
Teacher
Staff
```

Teachers, parents, and students enter through invitation workflows.

The academy owner/customer enters through authenticated access, then creates an academy if they do not already belong to one.

Keep backend registration only if required by the existing API; do not expose it as an unrestricted role-selection product flow.

The normal login page should not encourage arbitrary public role registration.

---

# 3. Subscription / entitlement boundary

The desired product rule is:

```text
Subscribed customer
OR
account explicitly given access credentials
        ↓
can enter the product
```

The current backend does not expose a subscription/entitlement API.

Therefore do NOT invent:

```text
isSubscribed
subscriptionStatus
planActive
checkoutCompleted
```

Do not hard-code an entitlement such as:

```typescript
const isSubscribed = true
```

Do not build a fake checkout that only changes frontend state.

Current architecture should treat successful authenticated access as the available backend contract and leave a clear boundary for a future real entitlement API.

The pricing page can be a real marketing/pricing page. Do not claim payment collection exists until a real backend/provider contract exists.

---

# 4. Invitation flow

Required concept:

```text
Owner/Admin
    ↓
invite person
    ↓
person receives link
    ↓
/accept-invitation
    ↓
account/sign-in according to backend contract
    ↓
accept invitation
    ↓
role-specific experience
```

Invitation acceptance must be outside the academy admin shell.

## Teachers

Use the existing backend invitation endpoint:

```text
POST /api/organizations/{organization_pk}/invitations/
```

Use the generated OpenAPI client.

Do not use the old membership POST workflow.

Do not ask for a user ID as a replacement for an invitation.

## Parents and students

The requested product requires parent/student invitation links.

The current backend does not provide the required parent/student invitation contract.

Do not fake these links in React.

Do not create local-only invitation tokens.

Mark parent/student invitation integration as:

```text
BACKEND CONTRACT REQUIRED
```

until the backend exposes the real mechanism.

---

# 5. Academy onboarding

After authenticated owner access:

```text
No academy
    ↓
Create Academy
    ↓
Academy details
    ↓
Curriculum
    ↓
Invite teachers/staff
    ↓
Invite/enroll students when backend supports it
    ↓
Invite parents when backend supports it
    ↓
Configure available academy settings
    ↓
Academy ready
```

A new owner should be taken through useful onboarding rather than a generic dashboard full of empty cards.

Do not define readiness using arbitrary conditions such as:

```text
staff.length > 1
students.length > 0
tracks.length > 0
```

If the backend has no readiness endpoint, show setup progress honestly rather than claiming a backend readiness state that does not exist.

---

# 6. Role experiences

The authenticated application must distinguish:

```text
OWNER / ADMIN
TEACHER
PARENT
STUDENT
```

Do not treat every authenticated account as an academy administrator.

---

# 7. Owner/Admin

Primary management navigation may include:

```text
Dashboard
Academy
Students
Teachers
Curriculum
Scheduling
Assessments
Progress / Reports
Finance
Notifications
Audit
Settings
```

Only expose routes supported by backend permissions.

Owner/admin manages academy operations, invitations, curriculum, scheduling, assessments, academy financial workflows, notifications, audit, and settings where contracted.

---

# 8. Teacher

Teacher home should answer:

```text
What class do I teach today?
What do I need to do next?
Which student needs attention?
What assessment/progress action is due?
```

Teacher navigation should be limited to permitted teaching workflows, such as:

```text
Dashboard
My Schedule
My Classes
Relevant Students
Assessments
Progress
Availability
My Earnings
Notifications
Profile
```

Do not expose academy administration, finance management, audit administration, staff administration, academy pricing, or imports unless the backend explicitly permits it.

---

# 9. Parent

Parent navigation should focus on:

```text
Dashboard
Children
Schedule
Progress
Assessments
Notifications
Profile
```

Do not show:

```text
Finance
Payouts
Academy administration
Teachers administration
Staff
Curriculum management
Imports
Audit
Academy pricing
```

A family fee/payment experience can only be added when a real backend contract and explicit product decision exists.

---

# 10. Student

Student navigation should focus on:

```text
Dashboard
My Schedule
My Learning
Progress
Assessments
Notifications
Profile
```

Do not show:

```text
Finance
Payouts
Academy administration
Teachers administration
Staff
Curriculum management
Imports
Audit
Academy pricing
```

---

# 11. Role-specific dashboards

Do not create one giant dashboard with conditional cards.

Use separate dashboard experiences, conceptually:

```text
src/features/dashboard/
    owner-admin-dashboard.tsx
    teacher-dashboard.tsx
    parent-dashboard.tsx
    student-dashboard.tsx
```

`/app/dashboard` may remain the route, but its content must resolve from the user's actual role and academy context.

Navigation, route guards, and dashboard content must agree.

---

# 12. Navigation and direct routes

The current navigation policy mixes global account roles and academy membership roles too loosely.

Keep the distinction:

```text
global account identity/role
academy membership role
```

Resolve the user's active academy membership first.

Then determine the role experience.

Hiding a sidebar item is not enough.

A restricted user must also receive the intended forbidden/redirect UX when directly visiting a restricted URL such as:

```text
/app/finance
/app/audit
/app/teachers
/app/academy
```

Create one central route-access policy or equivalent.

Backend authorization remains authoritative; frontend checks are UX/routing only.

---

# 13. Finance

Separate financial experiences.

## Owner/Admin

```text
Academy finance
Pricing agreements
Academy payout management
Financial statements
```

## Teacher

```text
Own earnings
Own payout statements
```

## Parent

No finance navigation.

## Student

No finance navigation.

Do not put finance into universal navigation.

---

# 14. Marketing layout

Replace:

```text
src/app/(marketing)/page.tsx
```

with the actual product landing page.

Include:

```text
Hero
Product value
How it works
Feature groups
Role experiences
Academy workflow
Pricing CTA
Contact CTA
Footer
```

Remove starter-template content such as:

```text
Deploy Now
Documentation
Next.js logo
Vercel logo
```

Create shared marketing layout/components where appropriate.

Marketing pages must not inherit the authenticated academy sidebar.

---

# 15. Route architecture

Use route groups conceptually like:

```text
src/app/
    (marketing)/
        page.tsx
        about/
        features/
        pricing/
        contact/

    (auth)/
        login/
        accept-invitation/

    app/
        dashboard/
        academy/
        students/
        teachers/
        curriculum/
        scheduling/
        assessments/
        progress/
        finance/
        payouts/
        notifications/
        audit/
        settings/
        profile/
```

Invitation acceptance must not inherit the authenticated academy shell until acceptance is complete.

---

# 16. Login

Keep:

```text
username/email
password
sign in
loading
error
```

Flow:

```text
Login
  ↓
successful authentication
  ↓
access/entitlement boundary
  ↓
academy context
  ↓
role-specific dashboard or onboarding
```

Remove the normal:

```text
Don't have an account? Register
```

product flow.

Provide a suitable pricing/access CTA instead.

Do not claim subscription status without backend evidence.

---

# 17. Academy context and cache

Keep academy selection for users who belong to multiple academies.

Model:

```text
Authenticated user
    ↓
backend-provided memberships
    ↓
selected academy
    ↓
tenant-aware API requests
```

Never treat localStorage as authorization.

When switching academy:

```text
invalidate/refetch tenant-specific state
```

Use the existing query-key factories consistently.

Do not rely on:

```text
key[0] === 'academy'
```

because feature keys include:

```text
students
teachers
staff
curriculum
scheduling
...
```

---

# 18. API discipline

Required flow:

```text
UI
 ↓
feature hook/API function
 ↓
TanStack Query
 ↓
generated OpenAPI client/types
 ↓
Django REST API
```

Remove these patterns where they are workarounds for undocumented API behaviour:

```text
any
unknown as HandwrittenType
@ts-expect-error
undocumented membership POST
hand-maintained API response interfaces
```

Never invent frontend endpoints.

---

# 19. Invitation acceptance UX

Handle:

```text
loading
valid token
expired token
invalid token
wrong email/account
already accepted
already a member
backend failure
success
```

After acceptance:

```text
teacher → teacher experience
parent → parent experience
student → student experience
staff/admin → appropriate academy experience
```

Do not send every invited person into an administrator dashboard.

---

# 20. Staff vs teachers

The existing `features/staff` and `features/teachers` split is acceptable only if the distinction remains clear:

```text
teachers
    = teacher-specific teaching/configuration workflows

staff
    = academy membership/administration
```

There must be one canonical invitation workflow.

Do not maintain an old direct-member-add workflow alongside invitations.

---

# 21. Documentation cleanup

The frontend repository should have one permanent product/architecture SSoT.

Keep:

```text
CLAUDE.md
AGENTS.md
README.md
decisions.md
learnings.md
spec/FRONTEND_MASTER_SSoT.md
spec/tech-debt.md
```

Do not recreate the deleted:

```text
fix/
verification/
archive/
phase-specific correction playbooks
CORRECTION_PROGRESS.md
implementation_plan.md
progress.md
```

Do not create another parallel frontend roadmap.

Update the master SSoT when product UX or architecture changes.

---

# 22. Required searches

Run:

```bash
rg -n "Register|register|Finance|Payouts|staff.length|students.length|tracks.length|any|ts-expect-error|unknown as|/app/staff|membership.*POST|subscription|checkout|isSubscribed" src
```

Review every result.

Remove:

- public role registration UX;
- starter landing page;
- universal admin dashboard assumptions;
- finance visibility for parent/student;
- guessed onboarding readiness;
- direct membership-add workaround;
- fake subscription flags;
- stale `/app/staff` assumptions.

---

# 23. Required tests

## Public

Verify:

```text
/
/about
/features
/pricing
/contact
/login
/accept-invitation
```

## Login

Verify:

```text
unauthenticated → login
valid credentials → authenticated flow
invalid credentials → useful error
```

## Roles

Verify:

```text
owner/admin → admin dashboard
teacher → teacher dashboard
parent → parent dashboard
student → student dashboard
```

## Navigation

Verify:

```text
parent cannot see Finance
student cannot see Finance
parent cannot see teacher administration
student cannot see academy administration
teacher cannot see finance management
owner/admin can see management navigation
```

## Direct routes

Verify restricted roles cannot access restricted routes through direct URLs.

## Academy

Verify:

```text
single academy
multiple academy switching
old tenant cache does not appear under new academy
```

## Invitations

Verify teacher invitation and acceptance end-to-end.

Do not invent parent/student invitation tests until their backend contract exists.

---

# 24. Required commands

Run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Run the critical Playwright journeys.

Do not claim completion if the commands fail.

---

# 25. Critical journeys

At minimum:

```text
1. Public landing → pricing/access → login
2. Login → create academy
3. Owner → invite teacher
4. Teacher → accept invitation → teacher dashboard
5. Owner → student/parent onboarding when backend contract exists
6. Parent → parent dashboard without finance
7. Student → student dashboard without finance
8. Owner/admin → academy management
9. Teacher → teaching workflow
10. Academy switch → correct tenant data
```

---

# 26. Backend blockers must remain explicit

Stop and report rather than invent behaviour when:

```text
subscription/entitlement endpoint does not exist
parent invitation endpoint does not exist
student invitation endpoint does not exist
backend permission is unclear
response schema is incomplete
```

Use:

```text
BACKEND CONTRACT REQUIRED
```

instead of a frontend-only workaround.

---

# 27. Execution order

Execute in this exact order:

```text
1. Clean obsolete frontend documentation
2. Fix public route architecture
3. Replace starter landing page
4. Fix login/access flow
5. Remove public role registration UX
6. Add invitation acceptance route
7. Centralize role resolution
8. Replace navigation policy
9. Build role-specific dashboards
10. Fix direct-route guards
11. Fix academy context/cache switching
12. Fix owner onboarding
13. Fix teacher invitation workflow
14. Prepare parent/student invitation integration for real backend contracts
15. Remove finance from parent/student experiences
16. Remove guessed onboarding readiness
17. Remove API typing/workaround debt
18. Rewrite stale tests
19. Run lint/typecheck/test/build
20. Run critical Playwright journeys
```

Do not jump ahead and leave the foundation inconsistent.

---

# 28. Final architecture target

```text
PUBLIC
├── Landing
├── About
├── Features
├── Pricing
├── Contact
└── Login

ACCESS
├── Login
└── Invitation Acceptance

OWNER / ADMIN
├── Dashboard
├── Academy
├── Teachers
├── Students
├── Curriculum
├── Scheduling
├── Assessments
├── Progress / Reports
├── Finance
├── Notifications
├── Audit
└── Settings

TEACHER
├── Dashboard
├── My Classes
├── My Schedule
├── Students
├── Assessments
├── Progress
├── Availability
├── My Earnings
├── Notifications
└── Profile

PARENT
├── Dashboard
├── Children
├── Schedule
├── Progress
├── Assessments
├── Notifications
└── Profile

STUDENT
├── Dashboard
├── My Schedule
├── My Learning
├── Progress
├── Assessments
├── Notifications
└── Profile
```

Do not collapse this back into one universal ERP dashboard.

---

# 29. Final report

Return:

## Architecture fixed

Exact frontend architecture changes.

## Product flow fixed

```text
Marketing → Pricing/Access → Login → Academy → Invitations → Role Dashboard
```

Clearly identify backend-dependent portions.

## Role UX

State exactly what Owner/Admin, Teacher, Parent and Student see.

## Documentation cleaned

List the permanent Markdown files remaining.

## Tests

Exact commands and results.

## Remaining backend dependencies

Only genuine blockers, especially:

```text
subscription/entitlement API
parent invitation API
student invitation API
```

Do not call the project complete when these dependencies are hidden behind frontend mocks.
