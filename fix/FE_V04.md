# V04 — Production UX, Accessibility and Documentation

Accessibility:
- keyboard navigation and visible focus
- semantic labels/headings/landmarks
- accessible dialogs/forms/tables
- error announcements
- contrast
- reduced motion
- Arabic/Quranic direction and typography

Responsive:
- desktop
- tablet
- mobile

Verify major pages have loading, empty, error, forbidden and success states.

Security/UX:
- no client secrets
- no invented auth flow
- no direct fetch in presentation components
- no cross-tenant cache leakage
- no unauthorized action presented as available

Update the frontend master specification/status ledger only to reflect verified reality.

Run actual project scripts:
```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
Also run the project's Playwright/accessibility checks.

Final acceptance:
- contract audit passes
- tenant isolation passes
- critical E2E passes
- responsive/accessibility review passes
- documentation is truthful
- no high-impact correction from F01–F12 remains silently unresolved
