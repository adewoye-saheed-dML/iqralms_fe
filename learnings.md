# Frontend Learnings

Durable memory for discoveries made during development.

Record:

- backend/frontend contract discoveries
- failed assumptions
- AI-generated mistakes and corrections
- reusable implementation lessons
- testing lessons
- accessibility findings
- responsive findings
- deployment lessons

## Entry template

```md
## YYYY-MM-DD — [Title]

### Context

### Finding

### Evidence

### Correction

### Rule going forward
```

## Initial baseline

- Backend behavior is authoritative.
- Frontend is not a security boundary.
- Tenant context must be explicit.
- A user may belong to multiple organizations.
- API behavior must not be invented in the UI.
- Significant architecture changes belong in `decisions.md`.
\n## Phase 13.0 Foundation
- When rendering academy selection or routing, we must fetch the organizations the current user belongs to from `/api/organizations/mine/` because user object doesn't include academy context.
- Shadcn components required minor adaptations to match Tailwind v4 configuration seamlessly.
