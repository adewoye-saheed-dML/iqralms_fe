# Phase 17 Verification Receipt

**Phase Name**: Curriculum & Placement Management
**Date Completed**: 2026-09-14
**Status**: COMPLETE

## Review Notes
The frontend curriculum workflow has been established using the existing `openapi/schema.yml` endpoints.

We have implemented:
- **Track Management**: List, retrieve, create, and update tracks under an academy (`Track`, `TrackWrite`, `PatchedTrackWrite`).
- **Level Management**: List, create, and update levels attached to a track (`Level`, `LevelCreate`, `PatchedLevelUpdate`).

**Limitations & Deferred Work**:
- Placements: While the backend exposes endpoints for placement reviews and submissions (`/api/curriculum/organizations/{id}/placements/`), building a full placement UI flow requires more context on the student testing journey. We have deferred Placements implementation for a subsequent phase focusing specifically on testing and assessments.
- Track Deletion / Level Deletion: Not supported in the frontend because the API explicitly does not expose DELETE endpoints for these resources, preserving referential integrity.

## UI Components Built
- `CurriculumDirectory`: Displays all tracks and their associated levels. Includes appropriate empty, loading, and 403 Forbidden states.
- `TrackForm`: Form for creating and editing a Track with frontend validation and robust API error handling (e.g. Slug uniqueness collisions).
- `TrackDetail` & `LevelList`: Shows a specific track's levels and allows Academy managers (owner/admin) to manage them.
- `LevelForm`: Form for appending a level to a track, mapping correctly to `curriculum_organizations_levels_create` which appends automatically.

## Test Coverage
Full unit testing achieved using React Testing Library and Vitest:
- Verifies initial loading, successful data rendering, and empty states.
- Validates 403 Forbidden and 404 Not Found error states.
- Validates `TrackForm` and `LevelForm` validation handling (e.g., HTTP 400 with slug errors).
- Verifies successful mutations.
- Uses academy-scoped query keys like `['academy', academyId, 'curriculum', 'tracks']`.

Phase 17 completes the prerequisite for scheduling.
