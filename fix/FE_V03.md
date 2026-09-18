# V03 — Critical E2E Journeys

Use Playwright and the actual application/backend contract.

Minimum journeys:
1. register/login → current user → academy selection
2. owner/admin academy setup
3. admin invites/activates teacher
4. admin adds/enrolls student
5. student/parent sees only permitted academy data
6. teacher opens today's class/scheduling workflow
7. teacher submits supported assessment/class data
8. lead reviews supported assessment data
9. parent/student sees historical progress where supported
10. admin views audit without edit
11. academy switch changes tenant-scoped data cleanly

Prefer user-visible workflow assertions over implementation details.

Acceptance: every implemented critical journey has a reliable automated path.
