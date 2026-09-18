# F04 — Central Capability Layer

Goal: centralize frontend capability decisions.

Audit findings:
- student/staff management is exposed to roles that may receive backend 403s
- payout visibility does not clearly separate academy finance from teacher self-service

Create/extend a permissions module with capability checks such as:
- manage academy
- manage teachers
- manage students/enrollment
- manage curriculum
- manage scheduling
- view audit
- manage finance
- view own payouts

Do not invent backend capabilities. Base the UX matrix on the current backend permissions/OpenAPI and the SSoT role table.

Prefer:
`can('manage_teachers', context)`
over scattered role comparisons.

Backend remains the security boundary.

Tests: table-driven coverage for Owner, Admin, Lead Teacher, Teacher, Parent, Student, including page/action visibility.

Acceptance:
- capability logic is centralized
- academy context is required where relevant
- staff is not automatically treated as admin
- unauthorized actions are not presented as ordinary available actions
- tests pass

STOP.
