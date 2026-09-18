# F10 — Student Enrollment Workflow Correction

Goal: convert the current thin student CRUD UI into an academy-aware enrollment workflow.

Intended journey:
invite/import/create → enroll → assign curriculum/placement → schedule → teach → assess → progress.

Backend roadmap expects enrollment to contain academy, student, program/track, level/placement, and enrollment status, subject to the live contract.

Audit findings:
- add-student flow uses raw User ID
- directory shows raw identifiers
- academy enrollment semantics are unclear

Instructions:
1. Inspect corrected enrollment endpoints/OpenAPI.
2. Determine which operations are actually supported.
3. Do not fabricate create/invite/placement fields.
4. If only an existing-user attach flow exists, label it honestly as adding an existing student to the academy.
5. Separate global student identity from academy enrollment.
6. Use F06 tenant-aware query keys.
7. Replace raw IDs as the main human-facing workflow element.
8. Provide empty/loading/error/forbidden/incomplete/active states.

Tests:
- student in academy A
- same student not leaking to B
- enrollment status
- unsupported action hidden
- forbidden management action
- mutation invalidation

Acceptance:
- page represents academy participation/enrollment, not generic user CRUD
- supported backend fields only
- no raw ID-centered workflow
- tenant isolation is tested

STOP.
