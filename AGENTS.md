# AGENTS.md — Antigravity Entry Point

Antigravity loads this file automatically for every agent spawned in this workspace. Read it first.

## The full rules live in CLAUDE.md

This project's complete engineering, product, and process rules are maintained in `CLAUDE.md` at the repository root — not duplicated here, so the two never drift out of sync.

Before doing anything else, in this order:

1. Read `CLAUDE.md` in full.
2. Read the current phase document (currently `PHASE_01_FOUNDATION.md`).
3. Read `FRONTEND_PRODUCT_AND_DESIGN_SPEC.md` for product/UX/design context relevant to the task.
4. Read `decisions.md` before touching anything architectural.
5. Read `learnings.md` and `tech-debt.md` for prior findings that bear on this task.
6. Check `progress.md` to see what's actually done vs. outstanding.

## Non-negotiables

- The Django/DRF backend (`adewoye-saheed-dML/quran_acad`) is the source of truth for domain behavior, auth, tenancy, and validation. Never invent API fields, permissions, or behavior it doesn't actually have — if you're unsure what it does, say so and stop rather than guessing.
- This frontend is not a security boundary. Frontend permission checks are UX only.
- For architecture-sensitive work (state management, API client shape, folder structure, auth flow) — produce your `implementation_plan.md` artifact and wait for review before executing. Don't skip straight to code.
- If a task uncovers a wrong assumption, changes an architectural decision, or leaves debt, update `learnings.md`, `decisions.md`, or `tech-debt.md` respectively as part of the task — not as a follow-up someone else has to remember.
- Confused, or a prior step's assumption turned out wrong? STOP. Don't patch symptoms. Run `.agent/workflows/recover.md` instead of layering more code on an uncertain foundation.
- Update `progress.md`'s checklist only when a deliverable is actually done — not when the UI merely renders.

## Current phase

Phase 1 — Product, UX & Frontend Foundation. Full deliverable list and acceptance criteria are in `PHASE_01_FOUNDATION.md`. Do not begin Phase 2 (application shell, authentication, academy context) work until the Phase 1 gate is met.
