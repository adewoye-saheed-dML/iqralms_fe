# F03 — Separate Global and Academy Roles

Goal: prevent global user roles from being treated as academy membership roles.

The product allows one person to have different roles in different academies. Current navigation already has `UserRole` and `OrgRole`, but the audit found role leakage such as `lead` appearing where an organization role is expected.

Search:
```bash
rg 'UserRole|OrgRole|role|allowedOrgRoles|allowedRoles' src/lib src/features src/app
```

Establish explicit concepts:
- global user identity role
- selected academy membership
- selected academy role
- UX capabilities derived from that context

Never infer academy authority from a global role.

Add tests for:
- same user, different academy roles
- academy switch role changes
- invalid mixed-role configuration

Acceptance:
- role namespaces are explicit
- global roles cannot silently become academy roles
- selected academy context controls academy UX
- no backend authorization logic is reimplemented in React

STOP.
