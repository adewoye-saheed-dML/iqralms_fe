# Phase 22 — Notifications & Academy Communication

## Status

NEXT REQUIRED PHASE — Phase 22 is not yet complete on the live frontend `main` branch.

## Verified current state

The backend already provides a tenant-scoped notification domain:

- `GET /api/notifications/organizations/{organization_pk}/mine/`
- `GET /api/notifications/organizations/{organization_pk}/mine/?unread=true`
- `GET /api/notifications/organizations/{organization_pk}/admin/`
- `GET /api/notifications/organizations/{organization_pk}/deliveries/`
- `GET /api/notifications/organizations/{organization_pk}/{id}/`
- `POST /api/notifications/organizations/{organization_pk}/{id}/read/`

The frontend currently has no committed `/app/notifications` route and no verified Phase 22 implementation on `main`.

## Source of truth

Before implementation, re-check:

- Frontend: `adewoye-saheed-dML/quran_fe` `main`
- Backend: `adewoye-saheed-dML/quran_acad` `main`
- `spec/FRONTEND_MASTER_SSoT.md`
- `openapi/schema.yml`
- backend `notifications/views.py`, `serializers.py`, `permissions.py`, `models.py`

Do not invent notification behavior that is not supported by the backend contract.

## Required route

Create:

`/app/notifications`

The authenticated application shell should expose Notifications according to the existing navigation/role system.

## Member notification experience

Use:

`GET /api/notifications/organizations/{organization_pk}/mine/`

Support the backend's optional unread filter.

The member view should provide:

- unread/read distinction
- notification title/content as returned by backend
- timestamp/state fields from the actual generated schema
- academy context
- empty state
- loading state
- error state
- `403 Forbidden` handling

For an individual notification, use the tenant-scoped detail endpoint.

For marking a notification read:

`POST /api/notifications/organizations/{organization_pk}/{id}/read/`

Do not locally mark records as read without synchronizing with the backend.

## Admin notification experience

For users authorized by the backend's `CanManageAcademyNotifications`, support:

`GET /api/notifications/organizations/{organization_pk}/admin/`

This is academy-wide notification history.

Also support:

`GET /api/notifications/organizations/{organization_pk}/deliveries/`

for the delivery log view, using the exact generated schema.

Do not expose academy-wide notification history or delivery logs to ordinary members.

## Permission model

The backend remains authoritative.

Member notification access:

- authenticated
- active organization member
- own notifications only

Admin notification management:

- authenticated
- active organization member
- backend `CanManageAcademyNotifications`

Notification detail must preserve backend behavior:

- owner/admin may read academy-wide notification detail
- ordinary members may read only their own notification
- cross-academy and other-user records must not be surfaced

## Tenant safety

Every notification query and mutation must be scoped by active academy.

Use the established TanStack Query pattern, for example:

`['academy', academyId, 'notifications', ...]`

Never use a global notification cache key.

Include filters such as `unread` in the query key.

When marking a notification read, invalidate or update only the appropriate academy-scoped notification queries.

## API/data architecture

Follow the existing project layering:

- API/data functions own HTTP calls.
- Components render server state.
- TanStack Query owns caching and synchronization.
- Do not place raw `fetch` calls inside presentation components.
- Use generated API schemas/types where the repository already generates them.

Do not invent:

- push-notification providers
- SMS integrations
- email campaign management
- notification scheduling
- arbitrary preference systems
- delivery channels not represented by the current backend contract

## Suggested UI structure

Build reusable pieces for:

- notification list
- unread filter
- notification row
- notification detail
- mark-read action
- admin notification history
- delivery log
- loading/error/empty/forbidden states

Keep the UI consistent with the existing design system.

The dashboard/application shell may surface unread notification counts only through data actually available from the backend contract. Do not invent a new unread-count endpoint.

## States and error handling

Must handle:

- loading
- empty
- success
- `403 Forbidden`
- `404 Not Found`
- `400` validation response where applicable
- generic server failure

A forbidden admin surface must not appear as an empty successful history.

## Testing

Add or update tests for:

### Member behavior

- member notification list loads
- unread filtering uses the backend query parameter
- read/unread presentation is correct
- notification detail is tenant-scoped
- marking read calls the exact backend endpoint
- empty state works
- `403` is handled correctly

### Admin behavior

- authorized admin can see academy notification history
- authorized admin can see delivery logs
- ordinary members cannot see admin history
- tenant switching changes notification query keys
- one academy's notifications never appear under another academy

### Regression

Run the normal project test suite and production build.

## Verification gate

Do not mark Phase 22 complete until:

1. `/app/notifications` exists.
2. Exact backend notification endpoints are used.
3. Generated schemas/types are used where available.
4. Member notification list and detail work.
5. Mark-as-read works through the backend.
6. Admin history and delivery logs respect backend permissions.
7. Academy-scoped TanStack Query keys are correct.
8. Loading/empty/403/404/error states are covered.
9. Tests pass.
10. Production build passes.
11. A verification receipt exists at:
    `spec/verification/phase-22-notifications.md`
12. The receipt records endpoints used, route(s), permission behavior, tenant isolation, tests, build result, and any explicitly deferred work.

## Next phase

Only after this receipt exists and the live repo confirms Phase 22 complete should the roadmap advance to:

**Phase 23 — Imports / Bulk Data Operations**

Do not skip Phase 22 merely because the backend already contains notification endpoints.
