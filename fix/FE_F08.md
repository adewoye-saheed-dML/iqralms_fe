# F08 — Onboarding Workflow Correction

Goal: replace the incorrect `tracks.length > 0` readiness rule with the real academy setup workflow.

Intended flow:
1. create academy
2. details/timezone/contact
3. curriculum/program configuration
4. teachers/staff
5. students/import
6. class/session configuration
7. notifications
8. ready

Audit finding: current `onboarding-wizard.tsx` treats having at least one track as readiness and several steps are marked “Coming soon”.

Instructions:
1. Inspect current onboarding API and live backend/OpenAPI.
2. Map each step to an actual supported operation.
3. Derive readiness from real setup state.
4. If the backend has no readiness endpoint, do not invent one silently; use a clearly documented local progress model based only on supported data.
5. Remove misleading “Coming soon” states for supported capabilities.
6. Keep unsupported steps explicitly staged.
7. Use progressive disclosure and recoverable form state.
8. Add loading/empty/error/forbidden/success states.

Tests:
- new academy
- partially configured academy
- completed academy
- failed mutation
- re-entry
- academy switch during onboarding

Acceptance:
- readiness is not track-count based
- each step maps to real backend support or OPEN status
- partial setup is recoverable
- tests pass

STOP.
