# Frontend Master Specification (SSoT)
# Quran Academy SaaS — Frontend Product, UX & Design Specification

Status: Foundation specification

## 1. Product role

The frontend is the user-facing web application for the Quran Academy SaaS.

It supports:

- academy organizations
- memberships and roles
- teachers
- students
- parents
- curriculum
- scheduling
- assessments
- progress
- pricing
- teacher payouts
- notifications
- imports
- audit history

The backend remains the source of truth for domain behavior, authorization, tenancy, validation, concurrency, and data.

## 2. Experience goal

The core operating journey is:

```text
Onboard
→ configure academy
→ establish curriculum
→ invite staff
→ add students
→ enroll students
→ schedule learning
→ teach
→ assess
→ monitor progress
→ reconcile pricing/payout information
```

The interface should help the user answer:

> What needs my attention today?

Do not build dashboards that are only collections of decorative metric cards.

## 3. Experience principles

- Clarity over density.
- Workflow over CRUD.
- Progressive disclosure.
- Trust and transparency.
- Consistent interaction patterns.
- Safe/reversible actions where backend semantics allow it.
- Accessibility by default.
- Islamic identity without visual excess.

## 4. Information architecture

Public:

```text
/
├── about
├── features
├── pricing
├── contact
├── login
└── register
```

Authenticated:

```text
/app
├── dashboard
├── academy
├── students
├── teachers
├── curriculum
├── scheduling
├── assessments
├── progress
├── pricing
├── payouts
├── notifications
├── imports
├── audit
└── settings
```

Routes should represent user journeys, not database tables.

## 5. Application shell

Provide:

- academy switcher/context
- role-aware navigation
- page title
- contextual actions
- notifications
- profile menu
- responsive navigation
- consistent content container
- breadcrumbs where useful
- accessible feedback/toast region

A user may belong to multiple organizations and can have different roles in different organizations. The current organization must therefore be visible and changeable.

## 6. Role experiences

### OWNER / ADMIN

Focus on:

- academy overview
- teachers
- students
- parents
- curriculum
- scheduling
- assessments
- pricing
- payouts
- notifications
- audit
- settings

### STAFF

UI depends on backend permissions. Do not invent client-only permissions.

### TEACHER / LEAD TEACHER

Focus on:

- today's schedule
- classes
- students
- attendance
- notes
- assessments
- progress
- availability
- earnings where permitted
- notifications

The active-class workflow should minimize navigation.

### PARENT

Focus on:

- children
- next class
- schedule
- learning progress
- assessments
- fees where permitted
- notifications

### STUDENT

Focus on:

- next class
- join lesson
- learning path
- progress
- assessments
- achievements
- schedule
- profile

## 7. Academy onboarding

Preferred flow:

```text
Create academy
→ academy details
→ timezone/contact configuration
→ curriculum choice
→ teachers/staff
→ students/import
→ class configuration
→ notification preferences
→ ready
```

Show progress and clearly explain what remains.

## 8. Dashboard design

Include a meaningful mix of:

- next actions
- today's schedule
- exceptions
- recent activity/progress
- relevant summary metrics

Every card must have a purpose.

## 9. Scheduling UX

Preferred views:

- month
- week
- day
- agenda/list where useful

Booking flow:

```text
student
→ track/level
→ teacher
→ availability
→ slot
→ confirmation
```

Do not reproduce backend locking or booking rules in the client.

On conflict, explain that availability changed, refresh/recheck safely, and never pretend the action succeeded.

## 10. Teaching interface

Suggested active-class structure:

```text
Today's class
→ student context
→ lesson/curriculum context
→ join class
→ attendance
→ notes
→ assessment/progress
→ schedule next action
```

## 11. Assessment and progress

Present assessment as a historical learning journey rather than a single mutable score.

Show, as appropriate:

- assessment history
- placement/current level
- progress trends
- teacher observations
- completed learning areas
- next focus

## 12. Parent experience

Make the following immediately understandable:

```text
Child
→ next class
→ teacher
→ progress
→ recent assessment
→ important notification
```

Do not force parents to understand internal academy administration.

## 13. Student experience

Prioritize:

```text
Next class
→ join
→ learning focus
→ progress
→ recent achievement
```

Use encouraging language without distracting decoration.

## 14. Financial UX

Keep distinct:

### Academy/admin

- pricing
- agreements
- pricing rules
- financial status

### Teacher

- earnings
- statements
- payout history
- payout status where permitted

Do not collapse academy pricing and teacher payouts into a vague single financial concept.

## 15. Notifications

Provide:

- notification center
- unread state
- timestamp
- category
- destination/action where relevant
- clear read/unread behavior
- useful empty state

## 16. Audit

Read-only operational experience with filters such as:

- actor
- action
- date range
- target/resource
- request correlation where exposed

Communicate that audit records are historical and immutable.

## 17. Bulk import

Use:

```text
Upload
→ map columns
→ validate
→ review errors
→ commit
→ result
```

Show clear validation errors, explicit commit, counts, and the backend's actual transaction behavior. Never invent partial-success semantics.

## 18. Visual design

Emotional qualities:

- calm
- credible
- welcoming
- focused
- contemporary
- respectful

Avoid visual noise.

### Color direction

Use semantic tokens.

```text
Primary: deep academy/Quranic green
Secondary: muted emerald
Accent: restrained gold/brass
Surface: warm off-white
Neutral: soft gray family
Text: deep neutral / dark green-neutral
Danger: accessible red
Warning: accessible amber
Success: accessible green
Info: accessible blue
```

Exact values should be finalized through prototype and accessibility testing.

### Typography

Use a modern readable Latin UI font and an Arabic-capable typeface for Arabic content.

### Spacing/density

Use a consistent spacing scale. Admin tables may use denser spacing; touch-first screens need larger targets.

## 19. Component library

Initial primitives:

- Button
- IconButton
- Link
- Input
- Textarea
- Select
- Combobox
- Checkbox
- Radio
- Switch
- FormField
- FormError
- Date/Time picker
- Dialog
- Drawer
- Sheet
- Popover
- Tooltip
- Dropdown
- Tabs
- Accordion
- Table/DataTable
- Pagination
- Badge
- Status indicator
- Avatar
- EmptyState
- ErrorState
- LoadingState/Skeleton
- Toast
- Alert
- Confirmation dialog
- Breadcrumbs
- PageHeader
- Card
- Stat
- Timeline/activity item
- Navigation shell

Prefer accessible primitives rather than custom widgets without a strong reason.

## 20. Tables

Desktop:

- sorting where useful
- filtering where supported
- pagination
- row/column actions
- readable density

Mobile:

- cards or condensed records
- horizontal scrolling only when truly unavoidable

## 21. Forms

Make required fields, errors, submitting/saving, success, server errors, and conflicts obvious.

Do not rely on color alone.

## 22. Loading, empty, and failure states

Every major feature needs:

- loading
- empty
- error
- forbidden
- not-found
- conflict
- submitting/saving
- success

## 23. Authentication

Align strictly to the backend's actual authentication system.

Do not invent refresh-token behavior.

Support:

- login
- logout
- protected routes
- unauthorized responses
- credential-safe handling
- meaningful failure states

## 24. Tenant context

Application state should explicitly know the current organization/academy context and the user's membership/role context where available.

On organization switching, invalidate/refetch tenant-scoped server state appropriately.

## 25. API architecture

Preferred:

```text
Page / feature UI
→ feature hook
→ TanStack Query
→ typed API client
→ Django REST API
```

Suggested source structure:

```text
src/
├── api/
│   ├── client/
│   ├── generated/
│   └── domains/
├── components/
│   ├── ui/
│   └── shared/
├── features/
│   ├── auth/
│   ├── organizations/
│   ├── onboarding/
│   ├── students/
│   ├── teachers/
│   ├── curriculum/
│   ├── scheduling/
│   ├── assessments/
│   ├── progress/
│   ├── pricing/
│   ├── payouts/
│   ├── notifications/
│   ├── imports/
│   └── audit/
├── lib/
│   ├── auth/
│   ├── permissions/
│   ├── dates/
│   └── utils/
└── types/
```

## 26. State management

Server state: TanStack Query.

Local UI state: React state.

Shareable/filterable state: URL/query parameters where appropriate.

Avoid global client state until a real need is proven.

## 27. Search and command palette

Useful later, but not a Phase 1 blocker.

Correct navigation and workflows come first.

## 28. RTL and Arabic

RTL must work across:

- navigation
- spacing
- icons
- tables
- forms
- dialogs
- breadcrumbs
- charts where applicable

Do not mechanically mirror every visual element.

## 29. Accessibility

Minimum expectations:

- keyboard-complete primary workflows
- visible focus
- associated labels
- programmatic form errors
- managed dialog focus
- no color-only status
- sufficient contrast
- accessible status announcements where appropriate
- reduced-motion consideration

## 30. Observability

Retain backend `X-Request-ID` when available for diagnostics.

Do not log passwords, authentication secrets, private tokens, or unnecessary sensitive data.

## 31. Testing strategy

### Unit

Pure utilities and small logic.

### Component

Forms, state transitions, dialogs, permission presentation, critical interactions.

### Integration

Feature workflows at API boundaries.

### End-to-end

Critical journeys:

- login
- organization selection
- onboarding
- student creation
- scheduling
- teacher daily workflow
- parent progress visibility
- student join-class path
- bulk import

### Accessibility

Automated checks where practical plus manual checks on primary workflows.

## 32. Deployment and CI

Support local, preview/staging, and production environments.

CI should be able to run:

```text
install
→ lint
→ typecheck
→ unit/component tests
→ build
```

Run E2E checks according to cost/runtime.

## 33. Product quality gate

Before feature completion:

- Does it solve the user's task?
- Does it match the backend contract?
- Does it fit the intended role?
- Does it respect organization context?
- Does it have all important UI states?
- Does it work responsively where required?
- Is it accessible?
- Is the copy understandable?
- Can a future AI coding agent understand the decision?

## 34. Out of scope

- native mobile application
- payment gateway implementation
- accounting platform
- analytics warehouse
- AI tutor
- event-sourcing rewrite
- microservices
- separate database per academy
- unnecessary API versioning
- second authorization system
