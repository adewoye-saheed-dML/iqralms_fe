# Cross-Repository Contract Audit Mismatch Table

| Domain | Frontend Expectation | Backend OpenAPI Contract | Status / Action |
| --- | --- | --- | --- |
| **Auth** | Uses DRF Token Auth. Expects `POST /api/auth/logout/` to exist. | `auth_logout_create` exists. | Match. |
| **Organizations / Staff** | Expects `POST /api/organizations/{org_id}/memberships/` to add members. | Only `GET /api/organizations/{org_id}/memberships/` is documented. | **Mismatch**: Cannot add or update members via the documented API. (Also lacks a single `GET .../memberships/{id}/`) |
| **Teachers** | Expects `GET /api/teachers/{org_id}/configurations/` or similar. | Evaluated via standard memberships, configurations endpoint exists. | Match. |
| **Students** | Expects `POST /api/organizations/{org_id}/students/` taking `{ user: number }`. | Documented as such. However, the GET response schema for Students is missing. | **Mismatch**: `StudentEnrollmentView` response schema missing. |
| **Curriculum** | Uses `POST` and `PATCH` for Tracks and Levels. | Track and Level mutations are fully documented. | Match. |
| **Scheduling** | Expects `RouteRequest` duration to be optional. | `duration_minutes` is strictly required as an integer in OpenAPI. | **Mismatch**: OpenAPI requires duration integer. |
| **Finance** | Uses specific endpoints for academy payouts vs teacher payouts. | Endpoints match `lead` vs `mine`. | Match. |
