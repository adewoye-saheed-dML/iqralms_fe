# F09 — Teacher and Staff Workflow Correction

Goal: separate teacher workflows from general organization membership administration.

Teacher workflow includes invitation/activation, availability, assigned tracks/classes, today's classes, teaching, assessment, and own finance where supported.

Audit findings:
- generic staff screens mix teacher and administrative membership concerns
- staff detail API currently works around a missing retrieve endpoint by fetching the full list and filtering locally

Instructions:
1. Inspect corrected backend invitation/membership/teacher APIs and OpenAPI.
2. Separate teacher management from generic staff membership.
3. Do not invent a teacher detail endpoint.
4. If full-list filtering remains necessary, isolate it inside the typed domain API/query layer and document why.
5. Represent real invitation lifecycle states only.
6. Carry academy context explicitly.
7. Do not give ordinary staff broad payout/finance authority by assumption.
8. Use workflow-focused UI rather than raw membership fields.

Tests:
- owner/admin teacher management
- invitation pending/accepted behavior
- teacher activation
- teacher academy context
- same person with a different role in another academy
- forbidden management actions

Acceptance:
- teacher UI is distinct from generic membership CRUD
- invitation state is accurate
- unsupported endpoint is not assumed
- role/capability layer is used
- tenant-specific tests pass

STOP.
