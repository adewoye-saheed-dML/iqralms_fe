# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: critical-journeys.spec.ts >> Critical E2E Journeys >> 11. academy switch changes tenant-scoped data cleanly
- Location: e2e/critical-journeys.spec.ts:108:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('body')
Timeout: 5000ms
- Expected substring  -  1
+ Received string     + 15

- studentA
+ 1/1Next.js 16.3.5TurbopackBuild Errorthe name `studentKeys` is defined multiple times./src/features/students/components/student-directory.tsx (3:10)Error: the name `studentKeys` is defined multiple times
+   1 | 'use client';
+   2 | import { studentKeys } from '@/lib/api/query-keys';
+ > 3 | import { studentKeys } from '@/lib/api/query-keys';
+     |          ^^^^^^^^^^^
+   4 |
+   5 | import * as React from 'react';
+   6 | import { useQuery } from '@tanstack/react-query';
+
+ Ecmascript file had an error
+
+ Import trace:
+   Server Component:
+     ./src/features/students/components/student-directory.tsx
+     ./src/app/app/students/page.tsx01 Issue

Call log:
  - Expect "toContainText" locator('body') with timeout 5000ms
  - waiting for locator('body')
    - locator resolved to <body>…</body>
    - unexpected value ""
    10 × locator resolved to <body>…</body>
       - unexpected value "1/1Next.js 16.3.5TurbopackBuild Errorthe name `studentKeys` is defined multiple times./src/features/students/components/student-directory.tsx (3:10)Error: the name `studentKeys` is defined multiple times
  1 | 'use client';
  2 | import { studentKeys } from '@/lib/api/query-keys';
> 3 | import { studentKeys } from '@/lib/api/query-keys';
    |          ^^^^^^^^^^^
  4 |
  5 | import * as React from 'react';
  6 | import { useQuery } from '@tanstack/react-query';

Ecmascript file had an error

Import trace:
  Server Component:
    ./src/features/students/components/student-directory.tsx
    ./src/app/app/students/page.tsx01 Issue"

```

```yaml
- navigation:
  - button "previous" [disabled]:
    - img "previous"
  - text: 1/ 1
  - button "next" [disabled]:
    - img "next"
- img
- text: Next.js 16.3.5 Turbopack
- dialog "Build Error":
  - text: Build Error
  - button "Copy Error Info":
    - img
  - button "No related documentation found" [disabled]:
    - img
  - button "Attach Node.js inspector":
    - img
  - text: "the name `studentKeys` is defined multiple times"
  - img
  - text: ./src/features/students/components/student-directory.tsx (3:10)
  - button "Open in editor":
    - img
  - text: "Error: the name `studentKeys` is defined multiple times 1 | 'use client'; 2 | import { studentKeys } from '@/lib/api/query-keys'; > 3 | import { studentKeys } from '@/lib/api/query-keys'; | ^^^^^^^^^^^ 4 | 5 | import * as React from 'react'; 6 | import { useQuery } from '@tanstack/react-query'; Ecmascript file had an error Import trace: Server Component: ./src/features/students/components/student-directory.tsx ./src/app/app/students/page.tsx"
- button "Open Next.js Dev Tools":
  - img
- button "Open issues overlay": 1 Issue
- alert
```

# Test source

```ts
  26  |     created_at: '2026-01-01T00:00:00Z',
  27  |     updated_at: '2026-01-01T00:00:00Z',
  28  |   },
  29  |   {
  30  |     id: 102,
  31  |     organization: { id: 2, name: 'Academy B', slug: 'academy-b' },
  32  |     user: 1,
  33  |     username: 'testadmin',
  34  |     role: 'teacher',
  35  |     role_display: 'Teacher',
  36  |     status: 'active',
  37  |     status_display: 'Active',
  38  |     created_at: '2026-01-01T00:00:00Z',
  39  |     updated_at: '2026-01-01T00:00:00Z',
  40  |   }
  41  | ];
  42  | 
  43  | test.describe('Critical E2E Journeys', () => {
  44  | 
  45  |   test.beforeEach(async ({ page }) => {
  46  |     // Intercept common auth endpoints
  47  |     await page.route('**/api/auth/login/', async route => {
  48  |       const body = route.request().postDataJSON();
  49  |       if (body?.username === 'testadmin' && body?.password === 'password') {
  50  |         await route.fulfill({ status: 200, json: { key: 'mock-token-123' } });
  51  |       } else {
  52  |         await route.fulfill({ status: 400, json: { non_field_errors: ['Invalid credentials'] } });
  53  |       }
  54  |     });
  55  | 
  56  |     await page.route('**/api/accounts/me/', async route => {
  57  |       const auth = route.request().headers()['authorization'];
  58  |       if (auth === 'Token mock-token-123') {
  59  |         await route.fulfill({ status: 200, json: MOCK_USER });
  60  |       } else {
  61  |         await route.fulfill({ status: 401, json: { detail: 'Unauthorized' } });
  62  |       }
  63  |     });
  64  | 
  65  |     await page.route('**/api/organizations/mine/', async route => {
  66  |       await route.fulfill({ status: 200, json: MOCK_ACADEMIES });
  67  |     });
  68  |   });
  69  | 
  70  |   test('1. register/login → current user → academy selection', async ({ page }) => {
  71  |     await page.goto('/login');
  72  |     
  73  |     // Fill credentials
  74  |     await page.fill('input[type="text"]', 'testadmin');
  75  |     await page.fill('input[type="password"]', 'password');
  76  |     await page.click('button[type="submit"]');
  77  | 
  78  |     // Should redirect to dashboard
  79  |     await page.waitForURL('**/app/dashboard');
  80  |     
  81  |     // Verify user is visible (e.g. through a sidebar or header)
  82  |     // We expect the first academy "Academy A" to be auto-selected
  83  |     await expect(page.locator('body')).toContainText('Academy A');
  84  |   });
  85  | 
  86  |   test('2. owner/admin academy setup', async ({ page }) => {
  87  |     // Intercept creation
  88  |     await page.route('**/api/organizations/', async route => {
  89  |       await route.fulfill({ 
  90  |         status: 201, 
  91  |         json: { id: 3, name: 'New Academy', slug: 'new-academy' } 
  92  |       });
  93  |     });
  94  | 
  95  |     await page.addInitScript(() => {
  96  |       window.localStorage.setItem('quran_fe_selected_academy_id', '1');
  97  |       window.localStorage.setItem('quran_fe_token', 'mock-token-123');
  98  |     });
  99  | 
  100 |     // Assume there is an onboarding or setup page
  101 |     await page.goto('/app/onboarding');
  102 |     
  103 |     // We don't have the exact DOM structure, but we can verify the API contract is respected
  104 |     // Wait for the app to load
  105 |     await expect(page.locator('body')).toContainText('Academy');
  106 |   });
  107 | 
  108 |   test('11. academy switch changes tenant-scoped data cleanly', async ({ page }) => {
  109 |     // Setup specific endpoints for Academy A and Academy B
  110 |     await page.route('**/api/organizations/1/students/', async route => {
  111 |       await route.fulfill({ status: 200, json: [{ id: 10, username: 'studentA' }] });
  112 |     });
  113 |     
  114 |     await page.route('**/api/organizations/2/students/', async route => {
  115 |       await route.fulfill({ status: 200, json: [{ id: 20, username: 'studentB' }] });
  116 |     });
  117 | 
  118 |     await page.addInitScript(() => {
  119 |       window.localStorage.setItem('quran_fe_selected_academy_id', '1');
  120 |       window.localStorage.setItem('quran_fe_token', 'mock-token-123');
  121 |     });
  122 | 
  123 |     await page.goto('/app/students');
  124 |     
  125 |     // Should see studentA
> 126 |     await expect(page.locator('body')).toContainText('studentA');
      |                                        ^ Error: expect(locator).toContainText(expected) failed
  127 |     await expect(page.locator('body')).not.toContainText('studentB');
  128 | 
  129 |     // Assuming we have an academy switcher in the UI
  130 |     // For now, since we know we built tenant isolation, we can trigger the switch via localStorage and reload
  131 |     // or simulate a click if we know the selector. We will just use the DOM selector if possible.
  132 |     // If the academy switcher is a select or dropdown, we'd click it.
  133 |     // We can also just set local storage and reload to prove the tenant changes cleanly.
  134 |     
  135 |     await page.evaluate(() => {
  136 |       window.localStorage.setItem('quran_fe_selected_academy_id', '2');
  137 |     });
  138 |     await page.reload();
  139 | 
  140 |     // Should see studentB
  141 |     await expect(page.locator('body')).toContainText('studentB');
  142 |     await expect(page.locator('body')).not.toContainText('studentA');
  143 |   });
  144 | });
  145 | 
  146 | test.describe('Additional Workflows', () => {
  147 |   test.beforeEach(async ({ page }) => {
  148 |     // Authenticate by default
  149 |     await page.addInitScript(() => {
  150 |       window.localStorage.setItem('quran_fe_token', 'mock-token-123');
  151 |       window.localStorage.setItem('quran_fe_selected_academy_id', '1');
  152 |     });
  153 |     
  154 |     await page.route('**/api/accounts/me/', async route => {
  155 |       await route.fulfill({ status: 200, json: MOCK_USER });
  156 |     });
  157 |     
  158 |     await page.route('**/api/organizations/mine/', async route => {
  159 |       await route.fulfill({ status: 200, json: MOCK_ACADEMIES });
  160 |     });
  161 |   });
  162 | 
  163 |   test('3. admin invites/activates teacher', async ({ page }) => {
  164 |     await page.route('**/api/organizations/1/memberships/', async route => {
  165 |       if (route.request().method() === 'POST') {
  166 |         await route.fulfill({ status: 201, json: { id: 103, user: 2, role: 'teacher', status: 'active' } });
  167 |       } else {
  168 |         await route.fulfill({ status: 200, json: [] });
  169 |       }
  170 |     });
  171 | 
  172 |     await page.goto('/app/staff');
  173 |     await expect(page.locator('body')).toContainText('Staff');
  174 |   });
  175 | 
  176 |   test('4. admin adds/enrolls student', async ({ page }) => {
  177 |     await page.route('**/api/organizations/1/students/', async route => {
  178 |       if (route.request().method() === 'POST') {
  179 |         await route.fulfill({ status: 201, json: { id: 10, username: 'newstudent' } });
  180 |       } else {
  181 |         await route.fulfill({ status: 200, json: [] });
  182 |       }
  183 |     });
  184 | 
  185 |     await page.goto('/app/students');
  186 |     await expect(page.locator('body')).toContainText('Students');
  187 |   });
  188 | 
  189 |   test('6. teacher opens today\'s class/scheduling workflow', async ({ page }) => {
  190 |     await page.route('**/api/scheduling/organizations/1/bookings/mine/', async route => {
  191 |       await route.fulfill({ status: 200, json: [] });
  192 |     });
  193 |     await page.goto('/app/scheduling');
  194 |     await expect(page.locator('body')).toContainText('Scheduling');
  195 |   });
  196 | 
  197 |   test('7. teacher submits supported assessment/class data', async ({ page }) => {
  198 |     await page.route('**/api/assessment/organizations/1/teacher/mine/', async route => {
  199 |       await route.fulfill({ status: 200, json: [] });
  200 |     });
  201 |     await page.goto('/app/assessment/teacher');
  202 |     // Basic structural check
  203 |     await expect(page.locator('body')).toBeVisible();
  204 |   });
  205 | 
  206 |   test('8. lead reviews supported assessment data', async ({ page }) => {
  207 |     await page.route('**/api/assessment/organizations/1/review/queue/', async route => {
  208 |       await route.fulfill({ status: 200, json: [] });
  209 |     });
  210 |     await page.goto('/app/assessment/queue');
  211 |     await expect(page.locator('body')).toBeVisible();
  212 |   });
  213 | 
  214 |   test('9. parent/student sees historical progress where supported', async ({ page }) => {
  215 |     await page.route('**/api/assessment/organizations/1/progress/mine/', async route => {
  216 |       await route.fulfill({ status: 200, json: [] });
  217 |     });
  218 |     await page.goto('/app/progress');
  219 |     await expect(page.locator('body')).toContainText('Progress');
  220 |   });
  221 | 
  222 |   test('10. admin views audit without edit', async ({ page }) => {
  223 |     await page.route('**/api/notifications/organizations/1/deliveries/', async route => {
  224 |       await route.fulfill({ status: 200, json: [] });
  225 |     });
  226 |     await page.goto('/app/audit');
```