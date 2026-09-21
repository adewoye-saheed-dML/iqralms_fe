# Quran Academy — First-Time Teacher Invitation Onboarding (Frontend)

## Goal

Implement the frontend experience for a teacher who receives an invitation email but does **not** already have a Quran Academy account.

The desired experience is:

```text
Invitation email
  ↓
Click link
  ↓
Invitation preview
  ↓
Create account
  ↓
Account is automatically joined to inviting academy as Teacher
  ↓
Authenticated dashboard
```

The teacher should not have to create a generic public account first, search for the academy, or request access manually.

## Repository facts already verified

Repository: `adewoye-saheed-dML/iqralms_fe`

Working branch checked: `feat/frontend-invitations-personas`

Relevant existing code:

- `src/features/invitations/api/invitations.ts`
  - already contains list/create/accept/preview/resend/revoke APIs.
- `src/app/(auth)/accept-invitation/page.tsx`
  - already loads invitation preview publicly.
  - for unauthenticated users it currently shows only **Sign In to Accept Invitation**.
  - for authenticated users it calls the existing invitation accept endpoint.
  - this is the main file that needs the new first-time signup experience.
- `src/lib/auth/auth-provider.tsx`
  - existing `login()` stores the DRF token and refreshes the auth query.
  - existing `register()` calls `POST /api/auth/register/`, but that public registration flow is intentionally not the teacher invitation path.
- `src/lib/api/client.ts`
  - sends `Authorization: Token <token>` automatically.
  - throws `ApiError` on non-2xx responses.
- `src/app/(auth)/register/page.tsx`
  - public self-registration is intentionally not presented as the teacher onboarding route.
  - it already points users toward invitation acceptance.
- Invitation roles in the current generated API are product-level organization roles such as `teacher`, `parent`, `student`, `admin`.

## Product/domain rule

There is **no product/domain concept called `staff`**.

Do not display, type, import, route, or test anything as `staff`.

The teacher's product-facing role is always:

```text
Teacher
```

The frontend must never ask the teacher to choose `sub` vs `lead`. That distinction belongs to the backend account model and is not an invitation UI choice.

## Required UX

### 1. Invitation URL

The email already sends users to the invitation page with organization + token.

The page must support the current parameter forms already present:

```text
?token=<token>&org=<organization_id>
```

and continue accepting the existing `organization` query name as a compatibility fallback.

Do not make the teacher manually type/paste the token when it is already in the URL.

Manual token entry may remain as a fallback for a user who lands on the page without a complete query string.

### 2. Public invitation preview

Keep the existing public preview call.

Before authentication, display at least:

- academy name
- invited role = Teacher
- invitation expiry
- invited email

The email should come from the backend invitation preview response or a safe equivalent after the backend endpoint exposes it. Do not derive authoritative invitation identity from arbitrary URL text.

### 3. New teacher with no account

Replace the current unauthenticated-only sign-in message with a first-time account creation option.

Recommended layout:

```text
You're invited to join [Academy Name]

Role: Teacher
Email: teacher@example.com

Create your account

First name       [____________]
Last name        [____________]
Password         [____________]
Confirm password [____________]

[Create Account & Join Academy]

Already have an account? Sign in instead.
```

The invitation email should be displayed as read-only text. Do not ask the teacher to type another email address.

### 4. Timezone

The backend's User registration model requires a timezone.

For invitation registration, populate it from the browser where available:

```ts
Intl.DateTimeFormat().resolvedOptions().timeZone
```

Send the IANA timezone string, e.g. `Africa/Lagos`.

Do not make the teacher manually type a timezone unless browser detection fails. A safe fallback can use the app's existing default convention.

### 5. Account registration call

Add a new API method to:

`src/features/invitations/api/invitations.ts`

Use the backend endpoint defined by the backend task, expected to be:

```text
POST /api/organizations/{organization_pk}/invitations/register/
```

Suggested request:

```ts
{
  token: string;
  first_name: string;
  last_name: string;
  password: string;
  timezone: string;
  date_of_birth?: string | null;
}
```

The frontend should not send an invitation email as an authoritative field.

The backend invitation owns the email.

### 6. Successful registration

The backend will return a DRF authentication token plus user/membership data.

On success:

1. Store the returned token using the existing token helper used by `auth-provider`.
2. Refresh/invalidate the existing `['auth', 'user']` query through the existing auth provider mechanism.
3. Refresh academy context using the existing `useAcademy()` provider.
4. Set the invited organization as the active academy when possible.
5. Redirect the teacher to `/app/dashboard`.

Do not make the teacher log in again after successful invitation registration.

### 7. Existing account path

If the backend says an account already exists for the invitation email, do not show a confusing registration failure.

Display:

```text
An account already exists for this invitation email.
Sign in to continue.
```

The sign-in link must preserve the complete invitation return URL, e.g.:

```text
/login?returnUrl=/accept-invitation?token=...&org=...
```

Use safe URL construction. Preserve the existing login page's open-redirect protection.

After login, the existing authenticated acceptance path should automatically be usable with the invitation parameters preserved.

### 8. Authenticated user path

Keep the current authenticated acceptance flow.

When a logged-in user opens the invitation:

- show their current account email
- show the invitation email
- call the existing accept endpoint
- let the backend enforce the authoritative email match
- show the successful role and academy
- redirect to the academy dashboard

If the logged-in email does not match the invitation email, show a clear message and provide a safe sign-out/login path rather than trying to bypass the backend check.

### 9. Invitation API typing

After the backend endpoint is merged, regenerate the OpenAPI schema used by the frontend.

Do **not** hand-edit generated enum/schema content.

Then update:

`src/features/invitations/api/invitations.ts`

with the generated operation types if the project convention uses typed paths/components.

### 10. Do not create a second auth implementation

Use the existing auth stack:

- `useAuth()`
- `setToken()` / `removeToken()` from the existing token helper
- `apiClient`
- `ApiError`
- React Query auth query

Do not introduce a new cookie/session abstraction for invitation registration.

### 11. Current compile issue to fix while touching invitation flow

The checked branch still contains a stale teacher-member detail fallback in:

```text
src/app/app/teachers/[memberId]/page.tsx
```

It still references the deleted `StaffDetail` component.

Replace the stale fallback with the existing error-state behavior for unsupported non-teacher memberships.

The page must not import or reference `StaffDetail` after this change.

### 12. UI terminology cleanup

All invitation-facing text must use:

- Teacher
- Parent
- Student
- Administrator/Administrator role where applicable

Do not use:

- Staff
- Teacher / Staff
- Invite Staff
- Teachers & Staff

The invitation flow should make the teacher role explicit and simple.

### 13. Tests required

Add/update frontend tests for the invitation page and invitation API.

At minimum:

#### New user

- URL contains token + organization.
- Preview loads successfully.
- Unauthenticated page shows invitation details and Create Account form.
- Email is displayed from invitation data and cannot be edited.
- Password and confirm-password mismatch prevents submission.
- Browser timezone is sent.
- Invitation registration API is called with token + account data.
- Returned auth token is stored.
- Auth state is refreshed.
- Academy context is refreshed.
- Invited academy becomes active when possible.
- User is redirected to `/app/dashboard`.

#### Existing account

- Backend existing-account response shows sign-in guidance.
- Sign-in URL preserves the invitation token and organization.

#### Authenticated user

- Existing acceptance API is still used.
- Success message shows Teacher role.
- User can go to dashboard.
- Email mismatch is shown clearly.

#### Invalid invitation

- expired invitation
- revoked invitation
- invalid token
- missing organization/token

All should produce useful UI errors using the repository's existing `ApiError` conventions.

### 14. Accessibility and UX

- labels must be associated with inputs
- password fields use `type="password"`
- submit button is disabled while the request is in flight
- errors are visible and not only logged
- success state should not require a second manual action before dashboard redirect
- mobile layout must remain usable for invitation email links opened on a phone

## Expected end-to-end flow

### New teacher

```text
Admin invites teacher@example.com
        ↓
Invitation email
        ↓
Teacher clicks link
        ↓
/accept-invitation?org=18&token=abc
        ↓
Public invitation preview
        ↓
Create Account & Join Academy
        ↓
POST invitation registration
        ↓
Backend creates User(role=sub)
        ↓
Backend creates Membership(role=teacher)
        ↓
Backend accepts invitation
        ↓
Backend returns DRF token
        ↓
Frontend stores token
        ↓
Frontend refreshes auth + academy
        ↓
/app/dashboard
```

### Existing teacher

```text
Invitation link
        ↓
Preview
        ↓
Sign in
        ↓
Return to invitation URL
        ↓
POST existing invitation accept endpoint
        ↓
Teacher membership created
        ↓
Dashboard
```

## Definition of done

The frontend is done only when a teacher with **zero previous account history** can open a real invitation URL and complete onboarding without manually entering an email, choosing a role, searching for the academy, or logging in again after registration.

Final product wording must consistently say `Teacher`; never `Staff`.
