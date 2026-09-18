# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: critical-journeys.spec.ts >> Critical E2E Journeys >> 1. register/login → current user → academy selection
- Location: e2e/critical-journeys.spec.ts:70:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[type="text"]')

```

# Page snapshot

```yaml
- generic:
  - generic [active]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - navigation [ref=e6]:
          - button [disabled] [ref=e7]:
            - img "previous" [ref=e8]
          - generic [ref=e10]:
            - generic [ref=e11]: 1/
            - generic [ref=e12]: "1"
          - button [disabled] [ref=e13]:
            - img "next" [ref=e14]
        - generic [ref=e17]:
          - generic "Latest available version is detected (16.3.5)." [ref=e20]: Next.js 16.3.5
          - generic [ref=e21]: Turbopack
      - dialog "Build Error" [ref=e23]:
        - generic [ref=e26]:
          - generic [ref=e28]:
            - generic [ref=e29]:
              - generic [ref=e30]: Build Error
              - generic [ref=e32]:
                - button "Copy Error Info" [ref=e33] [cursor=pointer]
                - button "No related documentation found" [disabled] [ref=e36]
                - button "Attach Node.js inspector" [ref=e39] [cursor=pointer]
            - generic [ref=e48]: "the name `studentKeys` is defined multiple times"
          - generic [ref=e51]:
            - generic [ref=e53]:
              - generic [ref=e58]: ./src/features/students/components/student-directory.tsx (3:10)
              - button "Open in editor" [ref=e59] [cursor=pointer]
            - generic [ref=e64]:
              - generic [ref=e65]: "Error: the name `studentKeys` is defined multiple times"
              - generic [ref=e66]: 1 |
              - generic [ref=e67]: "'use client'"
              - generic [ref=e68]: ;
              - generic [ref=e69]: 2 |
              - text: import
              - generic [ref=e70]: "{ studentKeys }"
              - text: from '@/lib/api/query-keys'
              - generic [ref=e71]: ;
              - text: ">"
              - generic [ref=e72]: 3 |
              - text: import
              - generic [ref=e73]: "{ studentKeys }"
              - text: from '@/lib/api/query-keys'
              - generic [ref=e74]: ;
              - generic [ref=e75]: "|"
              - text: ^^^^^^^^^^^
              - generic [ref=e76]: 4 |
              - generic [ref=e77]: 5 |
              - text: import
              - generic [ref=e78]: "*"
              - text: as React from 'react'
              - generic [ref=e79]: ;
              - generic [ref=e80]: 6 |
              - text: import
              - generic [ref=e81]: "{ useQuery }"
              - text: from '@tanstack/react-query'
              - generic [ref=e82]: "; Ecmascript file had an error Import trace: Server Component: ./src/features/students/components/student-directory.tsx ./src/app/app/students/page.tsx"
    - generic [ref=e87] [cursor=pointer]:
      - button "Open Next.js Dev Tools" [ref=e88]
      - button "Open issues overlay" [ref=e93]:
        - generic [ref=e94]:
          - generic [aria-hidden] [ref=e95]: "0"
          - generic [ref=e96]: "1"
        - generic [ref=e97]: Issue
  - alert [ref=e98]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | // Common mock data
  4   | const MOCK_USER = {
  5   |   id: 1,
  6   |   username: 'testadmin',
  7   |   first_name: 'Test',
  8   |   last_name: 'Admin',
  9   |   email: 'admin@example.com',
  10  |   role: 'admin',
  11  |   timezone: 'UTC',
  12  |   date_joined_local: '2026-01-01T00:00:00Z',
  13  |   date_of_birth: null,
  14  | };
  15  | 
  16  | const MOCK_ACADEMIES = [
  17  |   {
  18  |     id: 101,
  19  |     organization: { id: 1, name: 'Academy A', slug: 'academy-a' },
  20  |     user: 1,
  21  |     username: 'testadmin',
  22  |     role: 'owner',
  23  |     role_display: 'Owner',
  24  |     status: 'active',
  25  |     status_display: 'Active',
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
> 74  |     await page.fill('input[type="text"]', 'testadmin');
      |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
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
  126 |     await expect(page.locator('body')).toContainText('studentA');
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
```