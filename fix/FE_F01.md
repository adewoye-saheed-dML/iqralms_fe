# F01 — OpenAPI-Generated API Architecture

Goal: establish the canonical path:
UI → feature hook/mutation → TanStack Query → generated typed API client → Django REST API.

Audit finding: `src/lib/api/client.ts` is a generic handwritten fetch client while feature modules also define handwritten API interfaces. The SSoT requires generated OpenAPI client/types to be canonical.

Inspect:
```bash
rg 'fetch\(' src
rg 'fetchClient|apiClient|axios|http' src
rg 'interface |type ' src/features src/types
rg 'openapi|generated|schema' src package.json
```

Instructions:
1. Inspect current OpenAPI and generation scripts.
2. Determine whether a generated client already exists or only generated types.
3. Build the smallest adapter around the generated artifacts.
4. Keep base URL/env/auth/error handling in the API layer.
5. Feature hooks consume typed clients.
6. Presentation components do not call fetch.
7. Do not invent endpoint names or response shapes.

Prove the pattern with at least one representative feature; migrate additional affected API modules only where the contract is clear.

Tests:
- typed request construction
- auth header handling
- non-2xx error normalization
- one migrated feature request/mutation

Acceptance:
- generated API types/client are canonical
- no new handwritten transport layer
- no API calls in presentation components
- TanStack Query remains above the API client
- lint/typecheck/tests pass

STOP.
