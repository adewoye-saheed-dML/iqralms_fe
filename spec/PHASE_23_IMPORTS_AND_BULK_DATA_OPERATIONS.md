# Phase 23 — Imports & Bulk Data Operations

## Status

NEXT PHASE — implement after Phase 22 Notifications & Academy Communication is verified complete.

## Verified repo state

Phase 22 is now implemented on the live frontend `main` branch:

- `src/app/app/notifications/page.tsx` exists.
- `spec/verification/phase-22-notifications.md` exists.
- The receipt records notification endpoints, permissions, tenant-scoped TanStack Query keys, and passing tests.

The next backend-supported domain is Imports.

The live frontend currently has no:

- `/app/imports` route
- verified frontend import feature
- Phase 23 verification receipt

Do not skip directly to Audit History.

## Backend source of truth

Before implementation, re-read:

- `quran_acad/imports/urls.py`
- `quran_acad/imports/views.py`
- `quran_acad/imports/serializers.py`
- `quran_acad/imports/models.py`
- `quran_acad/imports/services.py`
- `quran_acad/imports/permissions.py`
- `openapi/schema.yml`
- `spec/FRONTEND_MASTER_SSoT.md`

The backend remains authoritative for validation, tenancy, permissions, import semantics, and created/updated records.

## Exact endpoints

### Validate / upload

`POST /api/imports/organizations/{organization_pk}/validate/`

Multipart/form-data request:

- `file` — required
- `kind` — required import kind from the generated/backend enum
- `column_mapping` — optional JSON object

Accepted file types:

- `.csv`
- `.xlsx`

Current backend file-size limit:

- 5 MB

The backend parses the file, guesses column mapping when one is not supplied, creates an import job, validates rows, records audit metadata, and returns the import job response.

### Commit

`POST /api/imports/organizations/{organization_pk}/{id}/commit/`

The job must be in the backend's validated state.

The backend locks the job during commit to prevent concurrent commits.

A job outside the validated state must produce the backend's validation/error response rather than being committed optimistically by the client.

## Import job response

The backend currently exposes these response fields:

- `id`
- `organization`
- `created_by`
- `kind`
- `file_name`
- `file_size`
- `file_type`
- `status`
- `column_mapping`
- `row_count`
- `valid_row_count`
- `invalid_row_count`
- `created_count`
- `updated_count`
- `skipped_count`
- `error_count`
- `error_report`
- `created_at`
- `started_at`
- `completed_at`

Use the generated API schema/types where available.

Do not invent additional job state fields.

## Required frontend route

Create:

`/app/imports`

The page should provide a safe, understandable bulk-import workflow rather than exposing the backend as raw CRUD.

Recommended flow:

1. Select import kind.
2. Select CSV/XLSX file.
3. Optionally configure/confirm column mapping using fields supported by the backend.
4. Upload and validate.
5. Review validation counts and `error_report`.
6. Commit only a successfully validated job.
7. Show final created/updated/skipped/error counts.

Do not automatically commit immediately after upload. The backend deliberately separates validation from commit.

## Permissions

Use the backend's `CanImportRecords` permission as the source of truth.

The frontend should hide the workflow for roles that are not expected to import records, but must still handle a backend `403 Forbidden`.

Do not create a client-side permission system that can authorize operations the backend rejects.

## Tenant safety

All requests must use the active academy context.

Use an academy-scoped query/mutation pattern such as:

- `['academy', academyId, 'imports', ...]`

Do not use a global import-job cache.

A job id must never be treated as globally sufficient without the active academy context.

If an academy is switched while an import screen is open:

- clear or re-scope the active job state
- do not display the previous academy's import result as though it belonged to the new academy

## File handling

The frontend must use multipart upload exactly as required by the backend.

Do not:

- base64-encode the file unless the existing generated client requires it
- silently change the file
- accept extensions the backend rejects
- claim a larger size limit than the backend supports

Before upload, provide clear client-side guidance that CSV and XLSX are supported and the backend currently enforces a 5 MB limit.

The backend remains authoritative even when the client performs convenience validation.

## Column mapping

The backend accepts an optional `column_mapping` object and may infer one automatically.

Build UI only around the actual import kinds and mapping keys exposed by the generated contract/backend implementation.

Do not invent a universal schema designer.

When the backend returns the resolved `column_mapping`, show it as part of the validation summary where helpful.

## Validation result UX

Validation is a distinct state.

The UI should make these values prominent:

- total rows
- valid rows
- invalid rows
- validation errors

Use the backend `error_report` exactly as supplied.

Do not suppress errors simply to make the workflow look successful.

A job with invalid rows must not be represented as fully valid.

Whether a partially valid job is commit-eligible is determined by the backend job status. The frontend must use that state rather than inventing its own rule.

## Commit UX

Commit should be an explicit action.

Before committing, show:

- import kind
- file name
- row counts
- valid/invalid counts
- expected created/updated/skipped/error outcomes when already available
- a clear irreversible/bulk-action warning consistent with the project's design system

After commit:

- display `created_count`
- display `updated_count`
- display `skipped_count`
- display `error_count`
- display `error_report` where present
- display final job status and timestamps from the backend

Do not fake progress values.

## Error handling

Handle at minimum:

- loading
- empty initial state
- invalid file type
- file too large
- malformed upload response
- validation failure (`400`)
- forbidden (`403`)
- missing job / tenant mismatch (`404`)
- commit state error (`400`)
- generic server failure

A failed validation must remain visibly distinct from a failed network request.

A backend `404` for a job outside the current academy should not reveal information about another academy.

## Audit interaction

The backend import views already record audit events for:

- bulk import validated
- bulk import completed

The frontend should not manufacture duplicate audit records.

Phase 23 is about the import workflow; do not build the full Audit History UI in this phase.

## API architecture

Follow the established frontend architecture:

- API/data functions own HTTP calls.
- Presentation components consume query/mutation state.
- TanStack Query owns server state.
- No raw API calls in visual components.
- Use generated API schemas/types.
- Invalidate or update only academy-scoped import queries after mutations.

Because the current backend only exposes validate and commit routes, do not invent:

- import-job list endpoint
- import-job delete endpoint
- import-job retry endpoint
- import-job cancellation endpoint
- background polling endpoint

The UI can show the returned job in the current workflow without pretending additional server capabilities exist.

## Suggested component structure

Reusable components may include:

- `ImportKindSelector`
- `FileDropzone` / file picker
- `ColumnMappingEditor`
- `ValidationSummary`
- `ValidationErrorTable`
- `CommitSummary`
- `ImportResult`
- `ImportPermissionGate`
- loading/empty/error/forbidden states

Keep these aligned with the existing design system.

## Testing requirements

### Upload / validation

Test:

- CSV upload
- XLSX upload
- unsupported extension rejected client-side
- oversized file guidance
- exact multipart field names
- import kind is sent correctly
- optional column mapping is sent correctly
- successful validation renders returned counts
- backend validation errors render clearly
- error report is not discarded

### Commit

Test:

- commit uses the exact validated job id
- commit is not available for an unvalidated job
- successful commit renders created/updated/skipped/error counts
- backend commit errors render correctly
- repeated/stale commit states are handled safely

### Permissions / tenancy

Test:

- unauthorized role does not get misleading access
- `403` renders as forbidden
- academy-scoped mutation/query state changes when the active academy changes
- job results from academy A never display under academy B

### Regression

Run the normal test suite and production build.

## Verification gate

Do not mark Phase 23 complete until:

1. `/app/imports` exists.
2. Exact backend validate/commit endpoints are used.
3. Multipart upload matches backend contract.
4. Import kind and optional column mapping use generated/backend-supported values.
5. Validation and commit are separate user actions.
6. Validation results and error reports are visible.
7. Commit results expose created/updated/skipped/error counts.
8. Backend permissions are respected.
9. Academy tenant isolation is preserved.
10. No invented import-job endpoints are added.
11. Tests pass.
12. Production build passes.
13. A verification receipt exists at:
   `spec/verification/phase-23-imports.md`
14. The receipt records exact endpoints, route, permission behavior, file handling, tenant safety, tests, build result, and explicitly deferred work.

## Explicitly deferred

Do not add unless a later backend contract proves support:

- scheduled imports
- background job polling
- import history API
- import cancellation
- import rollback
- import deletion
- downloadable templates
- CSV/XLSX export
- custom field creation
- external data connectors
- automatic recurring synchronization

## Next phase

Only after Phase 23 is verified complete should the roadmap advance to:

**Phase 24 — Audit History / Activity**
