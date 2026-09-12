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
