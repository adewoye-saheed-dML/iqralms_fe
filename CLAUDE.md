# Agent Instructions — IQRA LMS Frontend

## Source of Truth

- `spec/FRONTEND_MASTER_SSoT.md` — product UX and frontend architecture SSoT
- `openapi/schema.yml` — backend API contract
- `decisions.md` — accepted architecture decisions
- `learnings.md` — implementation lessons
- `spec/tech-debt.md` — known technical debt

## Rules

1. Inspect before changing.
2. Search before creating.
3. Follow the frontend SSoT for product flow, routes, role UX and architecture.
4. Follow OpenAPI for endpoint and schema details.
5. Treat backend permissions/querysets/tests as the security and business-rule authority.
6. Do not invent API fields, endpoints, permissions, subscription state or invitation behaviour.
7. Do not expose academy-management UI to teachers, parents or students unless the backend contract explicitly permits it.
8. Do not build one universal dashboard for all roles.
9. Do not put finance management in parent or student navigation.
10. Teachers, parents and students enter through invitation workflows; do not create a public role-selection registration flow.
11. Keep marketing, authentication/invitation, and authenticated academy experiences in separate route groups.
12. OpenAPI-generated types/client are canonical. Do not add handwritten duplicate API types.
13. TanStack Query owns server state; do not introduce Redux for ordinary application state.
14. Do not create parallel roadmap, phase, correction, verification or archive Markdown files in the repository.
15. Add or update tests for behaviour changes.
16. Run lint, typecheck, tests and build before declaring work complete.
