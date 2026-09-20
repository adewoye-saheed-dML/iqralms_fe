'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-provider';
import { useAcademy } from '@/lib/academy/academy-provider';
import { invitationsApi, type InvitationPreview } from '@/features/invitations/api/invitations';
import { ApiError } from '@/lib/api/errors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Mail, LogIn, ArrowRight } from 'lucide-react';

function AcceptInvitationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { refreshAcademies, setActiveAcademy } = useAcademy();

  const tokenParam = searchParams.get('token') || '';
  const orgParam = searchParams.get('org') || searchParams.get('organization') || '';

  const [token, setToken] = React.useState(tokenParam);
  const [orgId, setOrgId] = React.useState(orgParam);
  const [preview, setPreview] = React.useState<InvitationPreview | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [successRole, setSuccessRole] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!token.trim() || !orgId.trim()) return;
    const parsedOrgId = Number(orgId);
    if (!Number.isInteger(parsedOrgId) || parsedOrgId <= 0) return;

    let cancelled = false;
    setIsPreviewLoading(true);
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
          setError(err instanceof Error ? err.message : 'Unable to load invitation.');
        }
      })
      .finally(() => {
        if (!cancelled) setIsPreviewLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, orgId]);

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
      setSuccessRole(membership.role_display || membership.role);
      await refreshAcademies();
      if (membership.organization) {
        const academy = (await refreshAcademies())?.find?.((item) => item.id === membership.organization);
        if (academy) setActiveAcademy(academy);
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

  if (!user) {
    const returnUrl = encodeURIComponent(
      `/accept-invitation?token=${encodeURIComponent(token)}&org=${encodeURIComponent(orgId)}`,
    );

    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Mail className="h-5 w-5" />
          </div>
          <CardTitle className="text-2xl">Academy Invitation</CardTitle>
          <CardDescription>
            You have received an invitation to join a Quran Academy.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {preview && (
            <Alert>
              <AlertDescription>
                You are invited to join <strong>{preview.organization_name}</strong> as a{' '}
                <strong className="capitalize">{preview.role}</strong>.
              </AlertDescription>
            </Alert>
          )}
          <p className="text-muted-foreground">
            Sign in with the same email address that received the invitation, then return here to accept it.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href={`/login?returnUrl=${returnUrl}`}>
              <LogIn className="mr-2 h-4 w-4" /> Sign In to Accept Invitation
            </Link>
          </Button>
          <Button variant="ghost" asChild className="w-full text-xs">
            <Link href="/">Back to Home</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (successRole) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">Invitation Accepted!</CardTitle>
          <CardDescription>You are now a member of the academy.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center text-sm">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-xs text-muted-foreground">Assigned Role</p>
            <p className="mt-0.5 text-lg font-semibold capitalize text-foreground">{successRole}</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => router.push('/app/dashboard')}>
            Go to Your Dashboard <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Accept Academy Invitation</CardTitle>
        <CardDescription>
          Logged in as <span className="font-medium text-foreground">{user.email || user.username}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAccept} className="space-y-4">
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
            <Alert>
              <AlertDescription>
                Join <strong>{preview.organization_name}</strong> as{' '}
                <strong className="capitalize">{preview.role}</strong>.{' '}
                This invitation expires {new Date(preview.expires_at).toLocaleString()}.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="orgId">Academy ID</Label>
            <Input
              id="orgId"
              type="number"
              required
              placeholder="e.g. 1"
              value={orgId}
              onChange={(event) => setOrgId(event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
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

          <Button type="submit" className="w-full" disabled={isSubmitting || !token || !orgId}>
            {isSubmitting ? 'Accepting...' : 'Accept Invitation'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-4">
        <Link href="/app/dashboard" className="text-xs text-muted-foreground hover:underline">
          Return to Dashboard
        </Link>
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
