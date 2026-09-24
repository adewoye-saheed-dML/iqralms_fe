# IQRA LMS Frontend / Backend SSoT Remediation Audit

**Audit date:** 2026-09-23  
**Frontend repository:** `adewoye-saheed-dML/iqralms_fe`  
**Backend repository:** `adewoye-saheed-dML/iqralms`  
**Frontend main audited at:** `af9bf02df4cfd12cc606fcbe30778349b23483fb`  
**Backend main audited at:** `fa773c695d5da825d8dddb5a1345915358770520`

---

## 1. Executive finding

The frontend is **not yet behaviorally aligned with the backend**.

The important distinction is:

- Frontend OpenAPI path inventory and backend OpenAPI path inventory both contain **86 API paths**.
- The frontend feature API layer wraps only a subset of those paths.
- Several frontend screens call the **wrong backend endpoint for the current role**.
- Several backend capabilities have no real frontend workflow.
- The frontend role model is stale and does not represent the backend academy-role system.
- The teacher dashboard is mostly a navigation summary rather than the actual teaching workspace required by the frontend master SSoT.
- The class/Jitsi flow is incomplete.
- Single-student invitation is only partially complete because the backend creates academy membership on invitation registration but does not create the separate `StudentEnrollment` record used by the backend's student-participation rules.
- Multiple stale Markdown files contradict current architecture and can cause AI-assisted implementation to follow the wrong contract.

This is therefore **not a cosmetic dashboard task**. The frontend needs a contract, role, API, workflow and testing correction.

---

## 2. Backend role model — source of truth

The backend has two distinct role systems.

### Global account role

`accounts.Role`:

| Value | Meaning |
|---|---|
| `lead` | Lead teacher account |
| `sub` | Sub-teacher account |
| `student` | Student account |
| `parent` | Parent account |

### Academy membership role

`organizations.OrganizationRole`:

| Value | Meaning |
|---|---|
| `owner` | Academy owner |
| `admin` | Academy administrator |
| `staff` | Academy staff membership |
| `teacher` | Teaching authority in that academy |
| `parent` | Parent membership |
| `student` | Student membership |

These must never be treated as the same enum.

A lead teacher is effectively:

```text
global account role = lead
academy membership role = teacher
```

A normal teacher is:

```text
global account role = sub
academy membership role = teacher
```

A `staff` membership does **not** make someone a teacher.

---

## 3. Major stale frontend guidance that should be removed

The current frontend contains:

```text
CLAUDE_teacher_invitation_frontend.md
IQRA_LMS_FRONTEND_ARCHITECTURE_RESET.md
```

`CLAUDE_teacher_invitation_frontend.md` says there is no `staff` product/domain concept. That statement is now directly contradicted by the backend, which defines `OrganizationRole.STAFF = "staff"`.

The architecture reset file also contains several older assumptions that no longer match the current backend contract.

These files should not remain as active instructions.

**Do not create another correction Markdown file to override them.** Fold any still-valid historical decisions into:

```text
CLAUDE.md
decisions.md
spec/FRONTEND_MASTER_SSoT.md
spec/tech-debt.md
```

then delete the stale instruction files.

---

## 4. Replace the frontend role model

Current frontend role types collapse too much:

```text
UserRole = lead | sub | student | parent
OrgRole = owner | admin | teacher | parent | student
RoleExperience = owner_admin | teacher | parent | student
```

This omits `staff` and cannot distinguish lead teacher from ordinary teacher.

Use an explicit model:

```text
GlobalAccountRole
    lead
    sub
    student
    parent

AcademyMembershipRole
    owner
    admin
    staff
    teacher
    parent
    student

RoleExperience
    owner_admin
    lead_teacher
    teacher
    staff
    parent
    student
    unscoped
```

Recommended resolution:

```text
no active academy                       -> unscoped
membership owner/admin                  -> owner_admin
membership teacher + global lead       -> lead_teacher
membership teacher + global sub        -> teacher
membership staff                        -> staff
membership parent                       -> parent
membership student                      -> student
```

Frontend role helpers are only presentation/routing aids. Backend authorization remains authoritative.

---

# 5. P0 — Teacher dashboard is missing the real teaching workflow

Current:

```text
src/features/dashboard/teacher-dashboard.tsx
```

loads:

- teaching bookings
- review queue
- own payout statement

but mainly displays cards and links.

The master SSoT expects:

```text
today's class
  -> student context
  -> lesson/curriculum
  -> join
  -> attendance
  -> notes
  -> assessment
  -> progress
  -> next action
```

The current dashboard does not provide a proper class/session workspace.

### Required

Create a dedicated class/session experience, e.g.:

```text
/app/scheduling/[bookingId]
```

or an equivalent route.

It should expose:

```text
class time
student
teacher
track
level
booking status
join class
attendance
teacher notes
assessment
progress
next action
```

The dashboard should make the next class and next teacher action actionable, not just link to broad feature pages.

---

# 6. P0 — Jitsi class flow is incomplete

## Backend already has the contract

Booking contains:

```text
video_provider
video_provider_meeting_id
video_join_url
```

The backend also exposes:

```text
GET /api/scheduling/organizations/{organization_pk}/bookings/{id}/meeting/
```

`BookingMeetingView` authorizes the booking party and returns:

```text
provider
provider_meeting_id
join_url
```

The backend uses a provider abstraction and currently has Jitsi configured by default.

## Frontend problem

The frontend scheduling API does **not** implement the meeting endpoint.

`booking-list.tsx` simply checks:

```text
booking.video_join_url
```

and opens a raw external link.

There is no:

- meeting API wrapper
- class session page
- provider abstraction in the frontend
- proper meeting loading/error state
- authorized meeting retrieval
- real Jitsi room UI/integration
- teacher/student join end-to-end test

### Required

Add a scheduling meeting API method:

```text
getMeeting(organizationId, bookingId)
```

calling:

```text
GET /api/scheduling/organizations/{organization_pk}/bookings/{id}/meeting/
```

Then create the class-session UI.

If the product wants Jitsi embedded inside the app, implement that explicitly. If it wants an external meeting, make that the deliberate UX. Do not just bypass the provider endpoint.

### Do not reintroduce

The backend migration removed the old room-name concept. Do not add back:

```text
video_room_name
```

---

# 7. P0 — Teacher "Assigned Students" uses the wrong backend endpoint

Current frontend student API uses:

```text
GET /api/organizations/{organization_pk}/students/
```

for the general student directory.

The backend explicitly provides:

```text
GET /api/organizations/{organization_pk}/students/mine/
```

with role-specific behavior:

```text
owner/admin          -> all enrolled students
teacher/lead teacher -> assigned students
parent               -> linked children
student              -> denied
```

Therefore the teacher dashboard's **View Students** flow can send a teacher into an owner/admin collection.

### Required

Add:

```text
studentsApi.getMyStudents()
```

and make the directory role-aware:

```text
owner/admin          -> students/
teacher/lead teacher -> students/mine/
parent               -> students/mine/
student              -> no academy student directory
```

---

# 8. P0 — Student assessment calls the teacher endpoint

Frontend currently has:

```text
getMyAssessments()
```

but it calls:

```text
/api/assessment/organizations/{organization_pk}/teacher/mine/
```

The backend defines a distinct student endpoint:

```text
GET /api/assessment/organizations/{organization_pk}/mine/
```

### Required API split

Use explicit methods:

```text
getStudentAssessments()
    -> /assessment/.../mine/

getTeacherAssessments()
    -> /assessment/.../teacher/mine/

getChildAssessments(studentId)
    -> /assessment/.../child/?student_id=...
```

Do not have one method change meaning based on caller.

This also affects the parent dashboard, which should use linked-child assessment data rather than the teacher endpoint.

---

# 9. P0 — Student invitation UI is stale

Current student enrollment UI still says that parent/student invitations are awaiting a backend contract.

That is stale.

The backend already supports organization invitations for:

```text
admin
teacher
parent
student
```

and invitation registration maps:

```text
teacher -> global sub
parent  -> global parent
student -> global student
```

The frontend should use the invitation flow as the canonical single-student onboarding path rather than making the academy admin enter a global User ID as the main product workflow.

---

# 10. P0 backend dependency — student invitation is not the same as enrollment

There is a second issue that must remain explicit.

The backend treats:

```text
OrganizationMembership
```

and:

```text
StudentEnrollment
```

as different concepts.

The invitation registration service currently creates:

```text
User
OrganizationMembership
accepted invitation
DRF token
```

but its `consume_invitation()` service does not create `StudentEnrollment`.

The backend's student-participation helpers rely on `StudentEnrollment`.

Therefore the frontend must **not** fake an enrollment locally.

A real product decision/backend contract is still needed for:

```text
student invitation acceptance
    -> StudentEnrollment creation
```

Possible backend decisions are:

```text
A. invitation acceptance for a student also creates StudentEnrollment
```

or:

```text
B. acceptance creates membership, followed by a documented enrollment action/API
```

The frontend should follow the accepted backend contract. Until then, student invitation UI can be wired to the invitation API, but should not claim full academic participation is complete if the backend has not created enrollment.

---

# 11. P0 — Lead teacher permissions are incomplete in frontend

Backend permissions explicitly distinguish:

```text
owner
admin
lead teacher
teacher
```

for different operations.

The frontend capability layer often reduces this to owner/admin only.

Examples affected include:

- academy-wide payout operations
- pricing operations
- assessment review
- curriculum/placement responsibilities
- academy-level scheduling

The frontend must derive UX capability from:

```text
active membership role
+
global account role where backend requires it
```

Do not simply check:

```text
activeRole === teacher
```

for every teacher action.

---

# 12. P0 — Add `staff` without inventing permissions

Backend has:

```text
staff
```

The frontend must represent it.

But the frontend must **not invent** a broad staff dashboard.

Backend permission code makes staff a valid academy membership while restricting staff/teacher access to some membership-management surfaces.

So use a controlled `staff` experience based only on real backend-supported operations.

Do not automatically give staff:

```text
teacher dashboard
owner dashboard
admin membership management
payout management
curriculum management
```

unless the corresponding backend endpoint actually allows it.

---

# 13. P1 — Scheduling needs a real calendar/workspace

Current scheduling is mostly tabs, lists, waitlist and a booking form.

The master SSoT expects:

```text
month
week
day
agenda
```

and a complete booking flow:

```text
student
 -> track/level
 -> teacher
 -> availability
 -> slot
 -> confirmation
```

Backend already exposes an academy-wide schedule endpoint:

```text
GET /api/scheduling/organizations/{organization_pk}/bookings/academy/
```

but the frontend API layer does not wrap it.

Also missing from frontend scheduling API:

```text
GET /api/scheduling/organizations/{organization_pk}/cohorts/{id}/
```

Add these before building a richer schedule UI.

---

# 14. P1 — Availability UI must be honest

The teacher dashboard links to:

```text
/app/scheduling?tab=availability
```

But backend documentation states teacher-facing availability write is a deliberate gap. The scheduling availability endpoint is effectively read-only.

Therefore the frontend must not offer working-looking controls for creating/editing availability unless a real backend write endpoint exists.

Do not build fake local persistence.

---

# 15. P1 — Teacher class workflow needs attendance, notes, assessment and progress

The teacher class page should orchestrate the domain features rather than leaving the teacher to jump between unrelated dashboard cards.

Required sequence:

```text
open class
 -> student context
 -> track / level
 -> join
 -> attendance
 -> notes
 -> assessment
 -> progress
 -> next action
```

Each step should call its real backend endpoint and show backend errors.

Do not reproduce backend locking, routing or eligibility logic in React.

---

# 16. P1 — Assessment API is incomplete

Backend assessment endpoints include:

```text
/assessment/.../mine/
/assessment/.../child/
/assessment/.../teacher/mine/
/assessment/.../review/queue/
/assessment/.../{id}/
POST /assessment/.../{id}/review/
POST /assessment/.../bookings/{booking_id}/
/assessment/.../reports/teachers/
/assessment/.../progress/teaching/
/assessment/.../snapshots/
/assessment/.../snapshots/mine/
/assessment/.../snapshots/child/
```

The frontend wraps only part of this.

Add explicit methods and role-specific screens instead of a single generic assessment API.

Lead-only review and teacher submission must remain separate.

---

# 17. P1 — Progress API is incomplete

Frontend currently exposes only a subset of backend progress/snapshot endpoints.

Add explicit methods for:

```text
getMyProgress()
getTeachingProgress(studentId, ...)
getChildProgress(studentId, ...)
getMySnapshots(...)
getChildSnapshots(studentId, ...)
getAcademySnapshots(...)
createSnapshot(...)
```

Use the backend permission model to decide who sees which operation.

---

# 18. P1 — Curriculum placement workflow is missing

Backend exposes:

```text
POST /api/curriculum/organizations/{organization_pk}/placements/
GET  /api/curriculum/organizations/{organization_pk}/placements/mine/
GET  /api/curriculum/organizations/{organization_pk}/placements/children/
GET  /api/curriculum/organizations/{organization_pk}/placements/pending/
POST /api/curriculum/organizations/{organization_pk}/placements/{id}/review/
GET  /api/curriculum/organizations/{organization_pk}/placements/{id}/audio-url/
GET  /api/curriculum/placements/{id}/audio/
```

The frontend currently lacks the corresponding feature API coverage.

Recommended placement feature:

### Student

```text
submit placement
view own placement
listen to own audio through signed URL
```

### Parent

```text
view linked child's placement
```

### Lead teacher

```text
review pending placements
listen to authorized sample
set recommended level
```

Do not give ordinary sub-teachers lead-only placement review powers.

---

# 19. P1 — Teacher assignment API is incomplete

Backend provides:

```text
/api/curriculum/organizations/{organization_pk}/teachers/mine/
/api/curriculum/organizations/{organization_pk}/teachers/{id}/
```

The frontend does not wrap these.

Add explicit methods for teacher-specific track/assignment visibility.

Do not infer teaching assignments from generic curriculum tracks.

---

# 20. P1 — Parent/family API is missing from the frontend feature layer

Backend provides:

```text
GET  /api/accounts/my-children/
GET  /api/accounts/organizations/{organization_pk}/children/
POST /api/accounts/parent-links/
```

Create a dedicated family/parent API feature rather than scattering these calls through dashboards.

Recommended feature:

```text
src/features/family/
```

with:

```text
getMyChildren()
getAcademyChildren()
createParentLink()
```

Then use those child IDs consistently for schedule, progress and assessment calls.

---

# 21. P1 — Notifications need detail support

Backend provides:

```text
GET /notifications/.../mine/
GET /notifications/.../{id}/
POST /notifications/.../{id}/read/
GET /notifications/.../admin/
GET /notifications/.../deliveries/
```

The frontend feature layer is missing a dedicated detail method.

Add:

```text
getNotification(notificationId)
```

and make the UI support:

```text
unread state
detail
mark read
navigation to related object/action
```

---

# 22. P1 — Audit should have a feature API boundary

`src/app/app/audit/page.tsx` currently calls the OpenAPI client directly.

Move that into:

```text
src/features/audit/api/audit.ts
```

Backend audit routes are:

```text
GET /api/organizations/{organization_pk}/audit-logs/
GET /api/organizations/{organization_pk}/audit-logs/{id}/
```

No frontend write operations should be invented.

---

# 23. P1 — AcademyProvider silently picks the first academy

Current behavior is effectively:

```text
stored valid academy
or
memberships[0]
```

That violates the master SSoT requirement that a multi-academy user can see and change the current organization.

Required behavior:

```text
one academy
 -> auto-select

multiple + valid saved academy
 -> use saved academy

multiple + no valid saved academy
 -> require explicit selection
```

Do not silently pick the first academy when multiple memberships exist.

---

# 24. P1 — Query-cache isolation is too heuristic

Current `AcademyProvider` tries to remove tenant queries by inspecting query-key contents and numeric values.

That is fragile.

Use a consistent tenant namespace, for example:

```text
['academy', academyId, 'students', 'list']
['academy', academyId, 'students', 'mine']
['academy', academyId, 'scheduling', 'teaching']
['academy', academyId, 'assessment', 'student']
['academy', academyId, 'assessment', 'review-queue']
```

Then academy switching naturally changes query identity.

Do not depend on scanning arbitrary feature names or numeric key positions.

---

# 25. P1 — Separate pricing and payouts

The master SSoT explicitly separates:

```text
academy pricing
```

from:

```text
teacher payouts
```

The existing frontend still has:

```text
src/features/finance/
src/app/app/finance/
```

The canonical product should instead expose separate concepts:

### Owner/Admin/Lead where backend permits

```text
Pricing
Payouts
```

### Teacher

```text
My Earnings
My Statements
```

### Parent/Student

Do not show finance management.

---

# 26. P1 — Lead teacher payout visibility is currently wrong

Backend payout permissions include:

```text
owner
admin
lead teacher
```

for academy-level payout operations.

The frontend `view_academy_payouts` capability currently treats owner/admin as the only authorized roles.

Update the frontend role/capability rules to match the backend contract.

---

# 27. P1 — Teacher configuration must remain academy-specific

Backend distinguishes:

```text
TeacherProfile
```

from:

```text
OrganizationTeacherConfiguration
```

The second is authoritative for academy-level teacher configuration such as:

```text
approval
weekly capacity
hourly payout rate
```

The frontend teacher admin UI should clearly present these as academy-specific settings, not global person attributes.

---

# 28. P1 — Onboarding is incomplete

The master SSoT defines:

```text
Create academy
 -> academy details
 -> timezone/contact configuration
 -> curriculum
 -> teachers
 -> students/import
 -> class configuration
 -> notification preferences
 -> ready
```

The frontend onboarding pages are currently thin and some are effectively wrappers only.

Finish onboarding against real backend endpoints.

Do not invent a readiness flag from arbitrary counts such as:

```text
students.length > 0
tracks.length > 0
```

unless the backend defines that state.

---

# 29. API coverage result

Both repositories' OpenAPI path inventories currently contain **86 paths**, and their path sets match.

That means the frontend schema is not the main problem.

The problem is consumption.

The frontend feature API layer is missing important backend routes including:

## Accounts / family

```text
/api/accounts/my-children/
/api/accounts/organizations/{organization_pk}/children/
/api/accounts/parent-links/
```

## Assessment

```text
/api/assessment/organizations/{organization_pk}/mine/
/api/assessment/organizations/{organization_pk}/progress/teaching/
/api/assessment/organizations/{organization_pk}/reports/teachers/
/api/assessment/organizations/{organization_pk}/snapshots/
/api/assessment/organizations/{organization_pk}/snapshots/mine/
/api/assessment/organizations/{organization_pk}/snapshots/child/
/api/assessment/organizations/{organization_pk}/{id}/
```

## Curriculum / placement

```text
/api/curriculum/organizations/{organization_pk}/placements/
/api/curriculum/organizations/{organization_pk}/placements/mine/
/api/curriculum/organizations/{organization_pk}/placements/children/
/api/curriculum/organizations/{organization_pk}/placements/pending/
/api/curriculum/organizations/{organization_pk}/placements/{id}/review/
/api/curriculum/organizations/{organization_pk}/placements/{id}/audio-url/
/api/curriculum/organizations/{organization_pk}/teachers/mine/
/api/curriculum/organizations/{organization_pk}/teachers/{id}/
/api/curriculum/placements/{id}/audio/
```

## Organizations

```text
/api/organizations/mine/
/api/organizations/{id}/
/api/organizations/{organization_pk}/students/mine/
/api/organizations/{organization_pk}/audit-logs/
/api/organizations/{organization_pk}/audit-logs/{id}/
```

Some organization routes are currently handled directly by providers/pages, which is another architecture issue: centralize feature data access.

## Scheduling

```text
/api/scheduling/organizations/{organization_pk}/bookings/academy/
/api/scheduling/organizations/{organization_pk}/bookings/{id}/meeting/
/api/scheduling/organizations/{organization_pk}/cohorts/{id}/
```

These scheduling gaps are especially important because they directly affect the broken teacher/class/Jitsi workflow.

---

# 30. API method naming rules

Avoid ambiguous names such as:

```text
getMyAssessments()
```

when that means different things for different roles.

Prefer:

```text
getStudentAssessments()
getTeacherAssessments()
getChildAssessments()
getMyStudents()
getAcademyStudents()
getMyChildren()
getAcademyChildren()
getMyBookings()
getTeachingBookings()
getAcademyBookings()
```

The method name should make the backend contract obvious.

---

# 31. Recommended frontend target structure

```text
src/
├── app/
│   ├── (marketing)/
│   ├── (auth)/
│   │   ├── login/
│   │   └── accept-invitation/
│   └── app/
│       ├── dashboard/
│       ├── academy/
│       │   └── invitations/
│       ├── students/
│       ├── teachers/
│       ├── curriculum/
│       │   └── placements/
│       ├── scheduling/
│       │   ├── [bookingId]/
│       │   └── book/
│       ├── assessments/
│       ├── progress/
│       ├── pricing/
│       ├── payouts/
│       ├── notifications/
│       ├── audit/
│       ├── imports/
│       ├── settings/
│       └── profile/
│
├── components/
│   ├── ui/
│   ├── layout/
│   └── shared/
│
├── features/
│   ├── academy/
│   ├── dashboard/
│   ├── family/
│   ├── students/
│   ├── teachers/
│   ├── curriculum/
│   ├── scheduling/
│   ├── assessment/
│   ├── progress/
│   ├── pricing/
│   ├── payouts/
│   ├── notifications/
│   ├── invitations/
│   ├── imports/
│   └── audit/
│
└── lib/
    ├── api/
    ├── auth/
    ├── academy/
    ├── identity/
    ├── navigation/
    └── utils/
```

---

# 32. Files that should be created/changed first

## Identity

Create:

```text
src/lib/identity/roles.ts
```

Change:

```text
src/lib/navigation/config.ts
src/lib/permissions/capabilities.ts
```

## Academy context

Change:

```text
src/lib/academy/academy-provider.tsx
```

## Scheduling / Jitsi

Change:

```text
src/features/scheduling/api/scheduling.ts
src/features/scheduling/components/booking-list.tsx
src/features/scheduling/components/scheduling-dashboard.tsx
src/features/scheduling/components/booking-form.tsx
```

Add:

```text
src/features/scheduling/components/class-session.tsx
src/app/app/scheduling/[bookingId]/page.tsx
```

## Students

Change:

```text
src/features/students/api/students.ts
src/features/students/components/student-directory.tsx
```

## Assessment

Change:

```text
src/features/assessment/api/assessment.ts
src/features/assessment/components/assessment-dashboard.tsx
```

## Progress

Change:

```text
src/features/progress/api/progress.ts
```

## Curriculum

Change:

```text
src/features/curriculum/api/curriculum.ts
```

Add placement UI/API.

## Family

Create:

```text
src/features/family/
```

## Notifications

Change:

```text
src/features/notifications/api/notifications.ts
```

## Audit

Create:

```text
src/features/audit/api/audit.ts
```

## Invitations

Keep:

```text
src/features/invitations/
```

but make it the one canonical invitation workflow for teacher, parent and student invitations supported by the backend.

---

# 33. Invitation flows that the frontend should implement

## Teacher

```text
owner/admin
 -> invite teacher
 -> email
 -> accept invitation
 -> public preview
 -> create account OR sign in
 -> accept
 -> membership = teacher
 -> global role = sub for a new invited teacher
 -> teacher dashboard
```

Do not expose `lead` or `sub` as teacher-facing choices.

## Student

```text
owner/admin
 -> invite student
 -> accept invitation
 -> preview
 -> create account OR sign in
 -> student membership
 -> student enrollment
 -> student dashboard
```

The final membership-to-enrollment transition still needs the backend contract described above.

---

# 34. Direct-route guard rules

Hiding sidebar links is not enough.

Examples:

### Parent/student should not receive academy management UI

Avoid exposing routes such as:

```text
/app/teachers
/app/academy administration
/app/audit
/app/payouts
/app/pricing
```

unless a backend-supported family operation is specifically intended.

### Teacher

Ordinary teacher should not receive:

```text
membership administration
academy administration
owner/admin audit controls
academy-wide payout management
```

unless backend explicitly permits the action.

### Lead teacher

May receive additional:

```text
assessment review
placement review
pricing
payout
academy scheduling
```

only where backend permissions say so.

---

# 35. Never reimplement backend business rules in React

Do not move these into client-side authorization/business rules:

```text
booking locks
teacher capacity
routing
waitlist promotion
teacher eligibility
tenant isolation
payout calculation
pricing calculation
```

Frontend should collect intent, call the backend and present backend results/errors.

---

# 36. Stale files to remove or retire

## Frontend — safe cleanup candidates

These are generated/throwaway or clearly outdated support files:

```text
playwright-report/index.html
test-results/.last-run.json
e2e/example.spec.ts
scratch/fix-assessment.patch
scratch/remove-delete.patch
scratch/remove-delete2.patch
CLAUDE_teacher_invitation_frontend.md
IQRA_LMS_FRONTEND_ARCHITECTURE_RESET.md
```

Review before deleting:

```text
.agent/workflows/recover.md
```

Keep only if it is intentionally used by the repository's current tooling.

## Frontend — canonical files to keep

```text
CLAUDE.md
AGENTS.md
README.md
decisions.md
learnings.md
spec/FRONTEND_MASTER_SSoT.md
spec/tech-debt.md
```

Update their content instead of adding another parallel roadmap.

---

# 37. Backend stale documentation

The backend has historical instruction/correction documents including:

```text
CLAUDE_teacher_invitation_backend.md
IQRA_BE_ROLE_ONBOARDING_CLASS_STABILIZATION.md
IQRA_LMS_BACKEND_CURRENT_CORRECTION.md
QURAN_ACADEMY_INVITATION_EMAIL_IMPLEMENTATION.md
```

These are not runtime code, but they can give agents conflicting instructions.

Treat them as historical candidates for deletion after folding any still-valid facts into canonical documentation:

```text
CLAUDE.md
README.md
specs/saas/
learnings.md
tech-debt.md
```

The backend root `CLAUDE.md` itself contains a warning that an older root version was stale; clean this rather than retaining competing versions.

---

# 38. Backend files that should NOT be deleted merely because they say "legacy"

Do not remove:

```text
assessment/legacy.py
payouts/legacy.py
pricing/legacy.py
```

or migration/test files just because they contain the word `legacy`.

Those may be required for migration and regression safety.

The distinction is:

```text
stale guidance / generated artifacts -> clean

legacy migration/runtime compatibility code -> preserve unless proven unused
```

---

# 39. Recommended test matrix

## Owner/Admin

```text
login
select academy
create academy
invite teacher
invite student
view all students
manage teachers
manage curriculum
manage schedule
manage pricing
manage payouts
view audit
```

## Lead teacher

```text
login
teacher dashboard
teaching schedule
assigned students
open class
join class
attendance
notes
assessment submission
progress
review queue
placement review where permitted
payout operations where permitted
```

## Teacher / sub

```text
login
teacher dashboard
teaching schedule
assigned students
open class
join class
attendance
notes
assessment submission
assigned-student progress
own earnings
own assessments
```

## Parent

```text
login
load children
select child
child schedule
child progress
child assessments
notifications
```

## Student

```text
login
student dashboard
own schedule
open class
join class
own assessments
own progress
own snapshots
notifications
```

## Staff

```text
login
staff role resolves correctly
only backend-supported workspace appears
no automatic teacher dashboard
no automatic owner/admin controls
```

---

# 40. Jitsi test matrix

### Teacher

```text
teacher login
 -> schedule
 -> booking
 -> meeting endpoint
 -> join
```

### Student

```text
student login
 -> schedule
 -> booking
 -> meeting endpoint
 -> join
```

### Parent

```text
parent login
 -> child booking
 -> meeting endpoint
 -> join where permitted
```

### Unauthorized account

```text
other academy / unrelated user
 -> meeting endpoint
 -> backend denies
 -> useful frontend access error
```

Do not consider Jitsi complete just because a URL field is present in a booking payload.

---

# 41. API-layer rule

Keep the flow:

```text
UI
↓
feature API / hook
↓
generated OpenAPI types/client
↓
backend
```

Avoid page-level calls such as direct `apiClient.GET(...)` for feature data where a feature API boundary should exist.

Avoid handwritten duplicate response types when the generated schema already defines the shape.

---

# 42. Recommended tenant query-key scheme

Use a consistent namespace:

```text
['academy', academyId, 'students', 'list']
['academy', academyId, 'students', 'mine']
['academy', academyId, 'scheduling', 'bookings', 'teaching']
['academy', academyId, 'scheduling', 'bookings', 'mine']
['academy', academyId, 'assessment', 'student']
['academy', academyId, 'assessment', 'teacher']
['academy', academyId, 'assessment', 'review-queue']
```

Then changing academy changes the query identity naturally.

---

# 43. Definition of done

The frontend correction is complete only when:

## Role model

```text
owner
admin
staff
lead teacher
teacher
parent
student
```

resolve correctly from backend data.

## Teacher

```text
dashboard
schedule
students
class session
join
attendance
notes
assessment
progress
earnings
```

form a usable workflow.

## Student

```text
invitation
membership/enrollment according to backend contract
dashboard
schedule
join
assessment
progress
```

works end-to-end.

## Parent

```text
children
schedule
assessment
progress
```

use parent-specific endpoints.

## Jitsi

```text
booking
 -> meeting endpoint
 -> authorized meeting data
 -> join
```

works for permitted attendees.

## Academy

```text
single academy
multiple academy
explicit switching
```

does not leak tenant data.

## Finance

Pricing and payouts remain separate.

## API

No role calls another role's endpoint.

## Docs

Only canonical product/architecture guidance remains.

## Verification

Run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

and add the critical role journeys above.

---

# 44. Implementation order

Do this in order:

```text
1. Remove stale guidance/generated artifacts
2. Fix identity/role model
3. Fix academy selection and tenant query keys
4. Fix student/mine endpoint
5. Fix student/teacher/parent assessment endpoints
6. Fix parent/children API
7. Implement scheduling meeting endpoint + class page
8. Implement teacher class workflow
9. Add progress teaching/snapshot flows
10. Add curriculum placement flows
11. Add teacher assignment flows
12. Fix pricing/payout role handling
13. Implement staff UX only from real backend permissions
14. Fix onboarding
15. Complete student invitation and resolve StudentEnrollment contract
16. Add role-based direct-route tests
17. Add Jitsi end-to-end tests
18. Run lint/typecheck/tests/build/e2e
```

---

# 45. Final diagnosis

The core problem is:

```text
backend domain model
        !=
frontend role model
        !=
frontend feature API coverage
        !=
frontend workflow implementation
```

The backend already exposes most of the domain primitives needed for the product.

The frontend now needs to consume those primitives correctly and expose the actual workflows described by `spec/FRONTEND_MASTER_SSoT.md`.

The most urgent path is:

```text
role model
 -> academy context
 -> assigned students
 -> student/teacher/parent assessments
 -> family/children
 -> Jitsi meeting endpoint
 -> class session
 -> teacher teaching workflow
 -> placements/assignments
 -> pricing/payouts
 -> cleanup
 -> end-to-end tests
```

This is the work required to make the frontend genuinely rhyme with the backend and the master SSoT, rather than only making the folder names and dashboard cards look aligned.
