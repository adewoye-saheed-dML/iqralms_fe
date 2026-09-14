# Phase 22 Verification

## Endpoints Used
- `GET /api/notifications/organizations/{organization_pk}/mine/`
- `GET /api/notifications/organizations/{organization_pk}/admin/`
- `GET /api/notifications/organizations/{organization_pk}/deliveries/`
- `GET /api/notifications/organizations/{organization_pk}/{id}/` (implicitly supported via schema architecture, list view meets all read requirements initially)
- `POST /api/notifications/organizations/{organization_pk}/{id}/read/`

## Generated Schemas Used
- `Notification`
- `NotificationDelivery`
- `EventTypeEnum`
- `ChannelEnum`

## Routes Created/Changed
- `/app/notifications` - Notifications dashboard for all members and admins.
- Navigation (`src/lib/navigation/config.ts`) updated with "Notifications" menu item, exposed to all authenticated users.

## Permissions Observed
- `activeRole` drives visibility of admin tabs (`admin-history`, `admin-deliveries`).
- Students/Parents/Teachers can view only their own notifications and mark them as read via `getMyNotifications()`.
- Admins/Leads/Owners can access the academy history and delivery logs.
- `403 Forbidden` responses from the backend are gracefully captured by `ErrorState` rather than crashing the UI.

## Semantics
- Notification state is accurately queried with the `unread` flag.
- Marking as read executes `POST /read/` and immediately invalidates `['academy', academyId, 'notifications', 'mine']`.
- No arbitrary push providers or external tracking were implemented, staying strictly aligned with the backend's documented schema.

## Testing & Results
- `@tanstack/react-query` query keys are accurately isolated using `['academy', activeAcademy?.id, 'notifications', ...]`.
- `Notifications Feature` test suite verifies:
  - Member role loads empty states, lists notifications, and supports marking them as read.
  - Admin role properly renders the Admin History when selected as the default dashboard tab for privileged roles.
- `pnpm test` passes successfully.

## Deferred Work
- Notification Detail view is not explicitly placed on a separate route page, as the `summary` and `title` adequately present the complete notification payload returned in the list view, avoiding unnecessary navigational hops unless `payload` specific rendering becomes requested.
