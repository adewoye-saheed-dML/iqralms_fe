# Phase 23 Verification

## Endpoints Used
- `POST /api/imports/organizations/{organization_pk}/validate/`
- `POST /api/imports/organizations/{organization_pk}/{id}/commit/`

## Generated Schemas Used
- `ImportJobResponse`
- `KindEnum`
- `ImportJobResponseStatusEnum`

## Routes Created/Changed
- `/app/imports` - Bulk Imports dashboard.
- Navigation (`src/lib/navigation/config.ts`) updated with "Imports" menu item, exposed only to `['owner', 'admin', 'lead']` org roles.

## Permissions Observed
- `activeRole` checks hide the Imports UI completely for non-admins (parents, students, teachers), displaying an "Access Denied" state instead.
- Backend handles actual rejection mapping to `403 Forbidden` if bypassed.
- No global caches are used; tenant isolation uses TanStack Query keys like `['academy', academyId]`. Changing academies safely clears out transient unsaved job state.

## Import Process & File Handling
- Uses `FormData` directly via `apiClient.post` (patched `client.ts` to properly bypass `JSON.stringify` for `FormData` objects, enforcing actual HTTP `multipart/form-data` behavior).
- Enforces `.csv` and `.xlsx` extension checking and `< 5MB` file limits precisely on the client side before uploading, aligned strictly with backend expectations.
- Safely splits `validate` and `commit` operations, rendering exactly the `row_count`, `valid_row_count`, `invalid_row_count`, and `error_report` that the backend provides before offering the irreversible Commit button.

## Testing & Results
- `@tanstack/react-query` successfully isolates and invalidates list data (`['academy', academyId]`) upon successful commit.
- `Imports Feature` test suite verifies:
  - Non-admins see access denied.
  - Authorized users can attach a file, validate it (simulated), view the counts, and click "Commit Import".
  - Validation errors (both string arrays and nested objects) are handled seamlessly in the DOM.
- `pnpm test run src/features/imports` passes completely.

## Deferred Work
- Did NOT invent endpoints for listing, retrying, tracking asynchronous job execution, or polling history, as those are not present in the current Phase 23 OpenAPI contract.
- Did NOT implement bulk downloads, CSV exports, mapping editors, or scheduled data syncs.
