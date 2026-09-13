# Agent Instructions — Quran Academy Frontend

## Source of Truth
- `spec/FRONTEND_MASTER_SSoT.md` (Product UX/Architecture SSoT)
- `spec/CURRENT_PHASE.md` (Current Phase Tracker)
- `openapi/schema.yml` (Backend API Contract)
- `progress.md`, `decisions.md`, `learnings.md` (Tracking & Evidence)

## Rules
1. Inspect before changing.
2. Search before creating.
3. Use the backend/API contract as authority.
4. Use the Frontend Master SSoT as UX/architecture authority.
5. Do not invent API fields.
6. Do not invent permissions.
7. Do not invent authentication behavior.
8. Do not create duplicate API clients.
9. Do not create duplicate UI primitives.
10. Do not introduce Redux for ordinary server state.
11. Do not weaken tests.
12. Ensure academy-context logic follows the multi-tenant model without unsafe assumptions.
