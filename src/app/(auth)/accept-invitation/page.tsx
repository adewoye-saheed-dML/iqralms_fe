'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-provider';
import { useAcademy } from '@/lib/academy/academy-provider';
import { setToken as setAuthToken } from '@/lib/auth/token';
import { invitationsApi, type InvitationPreview } from '@/features/invitations/api/invitations';
import { ApiError } from '@/lib/api/errors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Mail, LogIn, ArrowRight, Link2, Users } from 'lucide-react';
import { familyApi } from '@/features/family/api/family';

function formatRole(role?: string | null): string {
  if (!role) return '';
  const r = role.toLowerCase();
  if (r === 'teacher') return 'Teacher';
  if (r === 'parent') return 'Parent';
  if (r === 'student') return 'Student';
  if (r === 'admin' || r === 'administrator') return 'Administrator';
  if (r === 'owner') return 'Owner';
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function AcceptInvitationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: isAuthLoading, refreshAuth, logout } = useAuth();
  const { refreshAcademies, setActiveAcademy } = useAcademy();

  const tokenParam = searchParams?.get('token') || '';
  const orgParam = searchParams?.get('org') || searchParams?.get('organization') || '';

  const [tokenInput, setTokenInput] = React.useState<string | null>(null);
  const [orgInput, setOrgInput] = React.useState<string | null>(null);
  const [prevParams, setPrevParams] = React.useState({ tokenParam, orgParam });

  if (prevParams.tokenParam !== tokenParam || prevParams.orgParam !== orgParam) {
    setPrevParams({ tokenParam, orgParam });
    setTokenInput(null);
    setOrgInput(null);
  }

  const token = tokenInput ?? tokenParam;
  const orgId = orgInput ?? orgParam;
  const setToken = (val: string) => setTokenInput(val);
  const setOrgId = (val: string) => setOrgInput(val);

  // Form fields for new account creation
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [age, setAge] = React.useState('');
  const [parentEmail, setParentEmail] = React.useState('');

  const [preview, setPreview] = React.useState<InvitationPreview | null>(null);
  const initialLoading = Boolean(tokenParam.trim() && orgParam.trim() && Number(orgParam) > 0);
  const [isPreviewLoading, setIsPreviewLoading] = React.useState(initialLoading);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [successRole, setSuccessRole] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [accountExistsError, setAccountExistsError] = React.useState(false);

  // Student code linking state (for parent role)
  const [studentCode, setStudentCode] = React.useState('');
  const [isLinkingChild, setIsLinkingChild] = React.useState(false);
  const [childLinked, setChildLinked] = React.useState(false);
  const [linkError, setLinkError] = React.useState<string | null>(null);

  // Load invitation preview
  React.useEffect(() => {
    const parsedOrgId = Number(orgId);
    if (!token.trim() || !orgId.trim() || !Number.isInteger(parsedOrgId) || parsedOrgId <= 0) {
      return;
    }

    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) setIsPreviewLoading(true);
    });

    invitationsApi
      .preview(parsedOrgId, token.trim())
      .then((data) => {
        if (!cancelled) {
          setPreview(data);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setPreview(null);
          if (err instanceof ApiError) {
            setError(err.message || 'Unable to load invitation.');
          } else if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('Unable to load invitation.');
          }
        }
      })
      .finally(() => {
        if (!cancelled) setIsPreviewLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, orgId]);

  // Construct return URL for sign-in redirect
  const returnUrl = `/accept-invitation?token=${encodeURIComponent(token.trim())}&org=${encodeURIComponent(orgId.trim())}`;
  const signInUrl = `/login?returnUrl=${encodeURIComponent(returnUrl)}`;

  // Handle student code linking for parent role
  const handleLinkChild = async (event: React.FormEvent) => {
    event.preventDefault();
    setLinkError(null);

    if (!studentCode.trim()) {
      setLinkError('Please enter the student code provided by your child.');
      return;
    }

    setIsLinkingChild(true);

    try {
      await familyApi.createParentLink({ student_code: studentCode.trim() });
      setChildLinked(true);
      await refreshAuth();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        const msg = err.message || '';
        const errData = err.data as Record<string, unknown> | undefined;
        const errDataStr = errData ? JSON.stringify(errData).toLowerCase() : '';
        const isAlreadyLinked =
          msg.toLowerCase().includes('already exists') ||
          msg.toLowerCase().includes('already linked') ||
          errDataStr.includes('already exists') ||
          errDataStr.includes('already linked');

        if (isAlreadyLinked) {
          setChildLinked(true);
          await refreshAuth();
          return;
        }

        if (err.status === 404 || msg.toLowerCase().includes('not found')) {
          setLinkError('No student found with that code. Please check the code and try again.');
        } else {
          setLinkError(msg || 'Failed to link student. Please try again.');
        }
      } else if (err instanceof Error) {
        const msg = err.message;
        if (msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('already linked')) {
          setChildLinked(true);
          await refreshAuth();
          return;
        }
        setLinkError(err.message);
      } else {
        setLinkError('An unexpected error occurred while linking the student.');
      }
    } finally {
      setIsLinkingChild(false);
    }
  };

  // Handle first-time registration and invitation acceptance
  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!password) {
      setError('Password is required.');
      return;
    }

    if (!token.trim() || !orgId.trim()) {
      setError('Please provide both an Academy ID and an Invitation Token.');
      return;
    }

    const parsedOrgId = Number(orgId);
    if (!Number.isInteger(parsedOrgId) || parsedOrgId <= 0) {
      setError('Invalid Academy ID.');
      return;
    }

    let timezone = 'UTC';
    try {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
      timezone = 'UTC';
    }

    const parsedAge = age.trim() ? parseInt(age, 10) : null;
    const isStudent = preview?.role?.toLowerCase() === 'student';
    const isMinor = isStudent && parsedAge !== null && !isNaN(parsedAge) && parsedAge < 18;

    if (isStudent && (parsedAge === null || isNaN(parsedAge) || parsedAge <= 0)) {
      setError('Please specify your age.');
      return;
    }

    if (isMinor) {
      if (!parentEmail.trim()) {
        setError('Parent or guardian email is required for minor students.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(parentEmail.trim())) {
        setError('Please enter a valid parent email address.');
        return;
      }
      if (preview?.email && parentEmail.trim().toLowerCase() === preview.email.toLowerCase()) {
        setError('Parent email cannot be the same as your student email.');
        return;
      }
    }

    setError(null);
    setAccountExistsError(false);
    setIsSubmitting(true);

    try {
      const res = await invitationsApi.register(parsedOrgId, {
        token: token.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        password,
        timezone,
        age: parsedAge !== null && !isNaN(parsedAge) ? parsedAge : undefined,
        parent_email: isMinor ? parentEmail.trim() : undefined,
      });

      setAuthToken(res.key);
      await refreshAuth();
      await refreshAcademies();
      setActiveAcademy(parsedOrgId);
      router.push('/app/dashboard');
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        const errMsg = err.message || '';
        const errData = err.data as Record<string, unknown> | undefined;
        const isExisting =
          errMsg.toLowerCase().includes('already exists') ||
          (errData &&
            typeof errData === 'object' &&
            JSON.stringify(errData).toLowerCase().includes('already exists'));

        if (isExisting) {
          setAccountExistsError(true);
          setError('An account already exists for this invitation email. Sign in to continue.');
        } else {
          setError(errMsg || 'Failed to complete registration.');
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during registration.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle acceptance for an already authenticated user
  const handleAccept = async (event?: React.FormEvent) => {
    event?.preventDefault();

    if (!token.trim() || !orgId.trim()) {
      setError('Please provide both an Academy ID and an Invitation Token.');
      return;
    }

    const parsedOrgId = Number(orgId);
    if (!Number.isInteger(parsedOrgId) || parsedOrgId <= 0) {
      setError('Invalid Academy ID.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const membership = await invitationsApi.accept(parsedOrgId, { token: token.trim() });
      const roleName = formatRole(membership.role_display || membership.role);
      setSuccessRole(roleName);
      await refreshAcademies();
      setActiveAcademy(parsedOrgId);

      if (roleName.toLowerCase() === 'parent') {
        try {
          const kids = await familyApi.getMyChildren();
          if (kids.length > 0) {
            setChildLinked(true);
          }
        } catch {
          // ignore
        }
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(
          err.message ||
            'This invitation is invalid, expired, revoked, or was sent to a different email address.',
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while accepting the invitation.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          Checking authentication status...
        </CardContent>
      </Card>
    );
  }

  // State: Invitation Accepted successfully (authenticated flow)
  if (successRole) {
    const isParentRole = successRole.toLowerCase() === 'parent';

    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">Invitation Accepted!</CardTitle>
          <CardDescription>
            You are now a member of {preview?.organization_name || 'the academy'}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="rounded-lg bg-muted p-4 text-center">
            <p className="text-xs text-muted-foreground">Assigned Role</p>
            <p className="mt-0.5 text-lg font-semibold capitalize text-foreground">{successRole}</p>
          </div>

          {/* Parent: Student code linking step */}
          {isParentRole && !childLinked && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
              <div className="flex items-center gap-2 font-medium text-foreground text-sm">
                <Link2 className="h-5 w-5 text-primary" />
                Link Your Child&apos;s Account
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the <strong>Student Code</strong> provided by your child to link their account. This code was given to them during registration and is visible on their dashboard.
              </p>

              {linkError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">{linkError}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleLinkChild} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="studentCode">Student Code</Label>
                  <Input
                    id="studentCode"
                    type="text"
                    required
                    placeholder="e.g. ABC123XY"
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value.toUpperCase())}
                    disabled={isLinkingChild}
                    className="font-mono tracking-wider text-center text-lg"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLinkingChild || !studentCode.trim()}
                >
                  {isLinkingChild ? 'Linking...' : 'Link Child Account'}
                </Button>
              </form>
            </div>
          )}

          {/* Parent: Child linked successfully */}
          {isParentRole && childLinked && (
            <div className="rounded-lg border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 p-4 space-y-2">
              <div className="flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-300 text-sm">
                <Users className="h-5 w-5" />
                Child Account Linked Successfully!
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Your child&apos;s student account is now verified and fully activated. You can view their progress, schedule, and assessments from your parent dashboard.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button className="w-full" onClick={() => router.push('/app/dashboard')}>
            Go to Your Dashboard <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          {isParentRole && !childLinked && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => router.push('/app/dashboard')}
            >
              Skip — I&apos;ll link later from the dashboard
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }

  // State: Authenticated user viewing invitation
  if (user) {
    const emailMismatch =
      Boolean(preview?.email && user.email && preview.email.toLowerCase() !== user.email.toLowerCase());

    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Accept Academy Invitation</CardTitle>
          <CardDescription>
            Logged in as <span className="font-medium text-foreground">{user.email || user.username}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Unable to continue</AlertTitle>
              <AlertDescription className="mt-1 text-xs">{error}</AlertDescription>
            </Alert>
          )}

          {isPreviewLoading && (
            <p className="text-sm text-muted-foreground">Checking invitation...</p>
          )}

          {preview && (
            <div className="rounded-lg border bg-muted/50 p-4 text-sm space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Academy:</span>
                <span className="font-medium">{preview.organization_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role:</span>
                <span className="font-medium capitalize">{formatRole(preview.role)}</span>
              </div>
              {preview.email && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invited Email:</span>
                  <span className="font-medium">{preview.email}</span>
                </div>
              )}
              {preview.expires_at && (
                <div className="flex justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
                  <span>Expires:</span>
                  <span>{new Date(preview.expires_at).toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

          {emailMismatch && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Email Mismatch</AlertTitle>
              <AlertDescription className="mt-1 flex flex-col gap-2 text-xs">
                <p>
                  This invitation was sent to <strong>{preview?.email}</strong>, but you are currently signed in as <strong>{user.email}</strong>.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  onClick={async () => {
                    await logout();
                    router.push(signInUrl);
                  }}
                >
                  <LogIn className="mr-1.5 h-3.5 w-3.5" /> Sign in with a different account
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleAccept} className="space-y-4">
            {(!tokenParam || !orgParam) && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="authOrgId">Academy ID</Label>
                  <Input
                    id="authOrgId"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    placeholder="e.g. 1"
                    value={orgId}
                    onChange={(event) => setOrgId(event.target.value.replace(/[^0-9]/g, ''))}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="authToken">Invitation Token</Label>
                  <Input
                    id="authToken"
                    type="text"
                    required
                    placeholder="Paste invitation token from email"
                    value={token}
                    onChange={(event) => setToken(event.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !token || !orgId || emailMismatch}
            >
              {isSubmitting ? 'Accepting...' : 'Accept Invitation'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={async () => {
              await logout();
              router.push(signInUrl);
            }}
          >
            Sign out
          </Button>
          <Link href="/app/dashboard" className="text-xs text-muted-foreground hover:underline">
            Return to Dashboard
          </Link>
        </CardFooter>
      </Card>
    );
  }

  // State: Unauthenticated user with or without invitation preview (first-time teacher signup)
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Mail className="h-5 w-5" />
        </div>
        <CardTitle className="text-2xl">
          {preview ? `You're invited to join ${preview.organization_name}` : 'Academy Invitation'}
        </CardTitle>
        <CardDescription>
          {preview
            ? 'Create your account to join the academy.'
            : 'You have received an invitation to join a Quran Academy.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isPreviewLoading && (
          <p className="text-sm text-muted-foreground">Checking invitation...</p>
        )}

        {preview && (
          <div className="rounded-lg border bg-muted/50 p-4 text-sm space-y-1.5">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role:</span>
              <span className="font-medium capitalize">{formatRole(preview.role)}</span>
            </div>
            {preview.email && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{preview.email}</span>
              </div>
            )}
            {preview.expires_at && (
              <div className="flex justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
                <span>Expires:</span>
                <span>{new Date(preview.expires_at).toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        {accountExistsError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Account Exists</AlertTitle>
            <AlertDescription className="mt-1 flex flex-col gap-2 text-xs">
              <p>An account already exists for this invitation email. Sign in to continue.</p>
              <Button asChild size="sm" variant="outline" className="w-fit">
                <Link href={signInUrl}>
                  <LogIn className="mr-1.5 h-3.5 w-3.5" /> Sign in to continue
                </Link>
              </Button>
            </AlertDescription>
          </Alert>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Unable to continue</AlertTitle>
            <AlertDescription className="mt-1 text-xs">{error}</AlertDescription>
          </Alert>
        ) : null}

        <form onSubmit={handleRegister} noValidate className="space-y-4">
          {(!tokenParam || !orgParam) && (
            <div className="space-y-3 pb-2 border-b">
              <div className="space-y-1.5">
                <Label htmlFor="orgId">Academy ID</Label>
                <Input
                  id="orgId"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  placeholder="e.g. 1"
                  value={orgId}
                  onChange={(event) => setOrgId(event.target.value.replace(/[^0-9]/g, ''))}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="token">Invitation Token</Label>
                <Input
                  id="token"
                  type="text"
                  required
                  placeholder="Paste invitation token from email"
                  value={token}
                  onChange={(event) => setToken(event.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                type="text"
                required
                placeholder="Your first name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                type="text"
                required
                placeholder="Your last name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {preview?.role?.toLowerCase() === 'student' && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="studentAge">Age</Label>
                  <Input
                    id="studentAge"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    placeholder="e.g. 15"
                    value={age}
                    onChange={(event) => setAge(event.target.value.replace(/[^0-9]/g, ''))}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">
                    Students under 18 will be connected with a parent or guardian.
                  </p>
                </div>

                {Boolean(age.trim() && parseInt(age, 10) < 18) && (
                  <div className="space-y-1.5 rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <Label htmlFor="parentEmail" className="font-semibold text-foreground">
                      Parent / Guardian Email
                    </Label>
                    <Input
                      id="parentEmail"
                      type="email"
                      required
                      placeholder="parent@example.com"
                      value={parentEmail}
                      onChange={(event) => setParentEmail(event.target.value)}
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-muted-foreground">
                      Because you are under 18, we will send an invitation to your parent or guardian to verify and link with your account.
                    </p>
                  </div>
                )}
              </>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                required
                placeholder="Choose a secure password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <PasswordInput
                id="confirmPassword"
                required
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !token || !orgId || !password || !confirmPassword}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account & Join Academy'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 border-t pt-4 text-center text-sm">
        <p className="text-muted-foreground text-xs">
          Already have an account?{' '}
          <Link href={signInUrl} className="font-medium text-primary hover:underline">
            Sign in instead.
          </Link>
        </p>
        <Button variant="ghost" asChild className="w-full text-xs">
          <Link href="/">Back to Home</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function AcceptInvitationPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <React.Suspense fallback={null}>
        <AcceptInvitationForm />
      </React.Suspense>
    </div>
  );
}
