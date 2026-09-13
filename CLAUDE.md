# Agent Instructions — Frontend Foundation Remediation

## Current task

Close the missing frontend foundation implementation in `quran_fe`.

This is SaaS Phase 13.0 foundation work.

Do not jump ahead to scheduling, teaching, finance or other later workflows.

## Read first

- `PHASE_13_0_FRONTEND_FOUNDATION_REMEDIATION.md`
- `PHASE_13_0_FOUNDATION_VERIFICATION.md`
- `FRONTEND_PRODUCT_AND_DESIGN_SPEC.md`
- `openapi/schema.yml`
- `progress.md`
- `decisions.md`
- `learnings.md`
- `AGENTS.md`

## Rules

1. Inspect before changing.
2. Search before creating.
3. Use the backend/API contract as authority.
4. Do not invent API fields.
5. Do not invent authentication behaviour.
6. Do not invent permissions.
7. Do not treat navigation visibility as security.
8. Do not assume one academy per user.
9. Do not create duplicate API clients.
10. Do not create duplicate UI primitives.
11. Do not introduce Redux for ordinary server state.
12. Do not weaken/remove tests to make the suite pass.
13. Keep changes small.
14. Update tracking files with evidence.
15. Run focused tests after meaningful changes.
16. Run the full foundation verification before declaring success.

## Recovery rule

When confused:

```text
STOP
→ inspect the existing code
→ inspect the OpenAPI contract
→ identify the earliest wrong assumption
→ record the correction
→ make the smallest fix
→ run the focused test
→ run the full foundation gate
```

Do not layer new abstractions on uncertain assumptions.

## Next-stage restriction

Do not begin the following until Phase 13.0 passes:

- full authentication workflow
- academy onboarding
- admin CRUD
- scheduling
- teaching
- parent/student workflows
- finance
- imports

The objective is a stable foundation, not a large amount of visible screens.
