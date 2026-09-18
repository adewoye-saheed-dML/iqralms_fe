# F11 — Scheduling Alignment

Goal: align scheduling UI with the corrected backend's explicit organization context.

Booking workflow:
student → track/level → teacher → availability → slot → confirmation.

Instructions:
1. Inspect corrected scheduling OpenAPI.
2. Pass the selected academy id explicitly wherever required.
3. Never infer an academy from “single membership”, first membership, teacher choice, or browser-local assumptions.
4. Ensure teacher/student/track/level relationships are presented only when they belong to the active academy.
5. Let the backend own overlap/routing/booking rules.
6. Handle time zones using the project's date utilities and backend contract.

Tests:
- academy A scheduling
- academy switch
- cross-academy teacher not offered
- cross-academy student/level not offered
- unavailable slot
- successful booking
- 409/403 mapping

Acceptance:
- scheduling is tenant-aware end-to-end
- no membership-count guessing
- backend remains authoritative
- query keys are tenant-safe
- critical scheduling flow is tested

STOP.
