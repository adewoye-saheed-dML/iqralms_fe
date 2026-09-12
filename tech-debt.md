# Frontend Technical Debt

Track known limitations, deferred improvements, and architectural risks.

Status values:

- OPEN
- IN_PROGRESS
- BLOCKED
- DEFERRED
- RESOLVED

## Entry template

```md
## TD-XXX — [Title]

Status: OPEN
Priority: P0 / P1 / P2 / P3

### Problem

### Impact

### Why it exists

### Proposed resolution

### Dependencies

### Exit criteria

### Notes
```

## Initial register

### TD-001 — Final visual palette not validated

Status: OPEN
Priority: P2

The semantic palette is directional and requires prototype/accessibility validation before final values are frozen.

### TD-002 — Final information architecture needs user validation

Status: OPEN
Priority: P1

The route structure is an implementation baseline and should be validated against real academy workflows.

### TD-003 — Generated API client workflow not bootstrapped

Status: OPEN
Priority: P1

A reproducible process is needed to generate/refresh TypeScript API types from the backend OpenAPI contract.

### TD-004 — Final deployment vendor not selected

Status: OPEN
Priority: P2

Keep the architecture portable across Next.js-compatible deployment environments until operational constraints determine the vendor.
