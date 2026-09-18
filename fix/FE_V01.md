# V01 — Cross-Repository Contract Audit

Refresh the backend contract/OpenAPI, regenerate frontend API artifacts using the project's actual command, then run lint/typecheck/test/build.

Search:
```bash
rg 'fetch\(' src
rg 'interface |type ' src/features src/types
rg 'allowedOrgRoles|allowedRoles' src
rg 'localStorage|sessionStorage|cookie' src/lib/auth src/features/auth
```

Build a mismatch table for Auth, Organizations, Teachers, Students, Curriculum, Scheduling and Finance.

Verify:
- generated types match API
- no undocumented endpoint
- no duplicate transport types
- auth matches backend
- tenant ids are present where required
- role/capability UX is consistent

Do not silently invent behavior for mismatches.
