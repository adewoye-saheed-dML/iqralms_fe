# V02 — Tenant Isolation Regression

Prove academy A data cannot appear as academy B after switching context.

Check all query keys:
```bash
rg 'useQuery|useInfiniteQuery|useMutation|queryKey|invalidateQueries|removeQueries' src/features src/lib
```

Test:
1. load academy A
2. capture A data
3. switch to B
4. ensure A queries are invalidated/removed
5. fetch B
6. ensure mutations use B
7. deliberately exercise invalid cross-tenant API behavior and confirm friendly 403/404 handling

Cover students, teachers, curriculum, scheduling, payouts, notifications/audit where implemented.

Acceptance: tests prove tenant cache separation and correct error behavior.
