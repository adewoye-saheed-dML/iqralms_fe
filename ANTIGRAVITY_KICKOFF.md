# Antigravity Kickoff — Phase 1 Execution Plan

How to actually delegate Phase 1 to Antigravity's Manager View given the docs already in this repo.

## 0. One-time workspace setup

- Open this repo as the Antigravity workspace root so it auto-loads `AGENTS.md`.
- Set the artifact review policy to **review-driven** (not "always proceed") for Phase 1. The choices made here — state management, folder structure, API client shape — get baked in for the whole project. Read and comment on every `implementation_plan.md` before it executes.
- If you also use Claude Code in this repo, leave `CLAUDE.md` untouched — `AGENTS.md` just points to it.

## 1. Resolve the real blocker before UI work: TD-003

`tech-debt.md` already flags this as P1, and it blocks the API architecture section of Phase 1 for real, not just on paper:

- Export the OpenAPI schema from `quran_acad` (drf-spectacular or equivalent) and commit it into this repo, e.g. `openapi/schema.json`.
- Pick and wire a type-generation command (`openapi-typescript` or `orval`) so the typed client is generated from that schema, not handwritten.
- Make this Agent A's first task. Everything touching `src/api/` after this should treat the generated types as the actual contract, not the aspirational shape in the product spec.

## 2. Suggested split (start with 3 agents, not 5)

Bootstrap → tokens → primitives → shell is a real dependency chain; the role-UX matrix and API architecture writeup are not. Split along that line. Maxing out parallelism here mostly just creates merge conflicts on shared config.

**Agent A — Bootstrap & tooling** (sequential backbone)
> Bootstrap the Next.js/TS/Tailwind repo per `FRONTEND_REPO_BOOTSTRAP_CHECKLIST.md` and the stack in `CLAUDE.md`. Set up pnpm, ESLint, Vitest, Testing Library, Playwright scaffolding, and the OpenAPI type-generation command from `openapi/schema.json` (see §1 above). Produce an implementation_plan.md before running any generator. Stop and ask if a tool choice conflicts with `decisions.md`. Update `progress.md` and validate D-003 in `decisions.md` when done.

**Agent B — Design tokens & shared primitives** (start once Agent A's plan is approved — don't wait for A to fully finish)
> Implement the semantic color/typography/spacing/radii tokens from `FRONTEND_PRODUCT_AND_DESIGN_SPEC.md` §18 as Tailwind theme config, then build the initial primitives in §19 (Button, Input, Dialog, Table, EmptyState, ErrorState, LoadingState, Toast, etc.) with shadcn/ui + Radix. Every primitive needs loading/empty/error states where applicable per §22. Walkthrough should show each primitive in both LTR and a representative Arabic/RTL render.

**Agent C — Architecture & role-UX documentation** (fully parallel, no code dependency)
> Turn spec §6 (role experiences) into the actual Role UX Matrix deliverable Phase 1 requires, and formalize the API integration architecture (§25–26) as a dated entry appended to `decisions.md`. Where the matrix would depend on a permission the backend contract doesn't confirm, list it as an open question in `tech-debt.md` instead of guessing.

Once A and B land, spawn:

**Agent D — Application shell prototype**
> Build the responsive shell (sidebar/nav, top bar, academy switcher, breadcrumbs, feedback/toast region) from spec §5, using Agent B's primitives. Desktop and mobile both need a walkthrough. Mock the academy-switcher state — no real auth or API calls yet.

## 3. Recovery workflow

Save as `.agent/workflows/recover.md` (or `.agents/workflows/recover.md`, depending on your IDE version) so any agent can invoke it by name:

```
# /recover

Use when an earlier assumption turns out wrong, or you're unsure the current approach is sound.

1. STOP. Don't write more code on top of the uncertain part.
2. State plainly, in the task artifact, what you assumed and why it's now in question.
3. Re-read the actual source of truth for that assumption — backend API/tests, or the
   relevant section of FRONTEND_PRODUCT_AND_DESIGN_SPEC.md / decisions.md.
4. Record the finding in learnings.md: what was assumed, what's actually true, evidence.
5. Fix the smallest thing that addresses the root cause, not the symptom.
6. Re-run focused tests for the affected area, then the full verification gate
   (lint, typecheck, tests, build).
7. Update progress.md. If this changes an architectural decision, add a new dated
   entry to decisions.md rather than editing the old one.
```

## 4. What "done" looks like for a Phase 1 task

Before marking anything complete, the walkthrough should show — not just claim — what `CLAUDE.md`'s Definition of Done asks for: typecheck/lint/tests passing, the relevant loading/empty/error/forbidden/not-found/conflict states, a responsive check, and at minimum a keyboard-nav + visible-focus accessibility pass. If a state genuinely doesn't apply to a given task, say why in the walkthrough rather than leaving it out silently.
