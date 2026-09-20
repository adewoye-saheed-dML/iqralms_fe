'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-provider';
import { useAcademy } from '@/lib/academy/academy-provider';
import { staffApi } from '@/features/staff/api/staff';
import { ApiError } from '@/lib/api/errors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Mail, LogIn, ArrowRight } from 'lucide-react';

import type { Membership as OrganizationMembership } from '@/features/staff/api/staff';

function AcceptInvitationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { refreshAcademies, setActiveAcademy } = useAcademy();

  const tokenParam = searchParams.get('token') || '';
  const orgParam = searchParams.get('org') || searchParams.get('organization') || '';

  const [token, setToken] = React.useState(tokenParam);
  const [orgId, setOrgId] = React.useState(orgParam);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [successMembership, setSuccessMembership] = React.useState<OrganizationMembership | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleAccept = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!token.trim() || !orgId.trim()) {
      setError('Please provide both an Academy ID and an Invitation Token.');
      return;
    }

    const parsedOrgId = Number(orgId);
    if (isNaN(parsedOrgId) || parsedOrgId <= 0) {
      setError('Invalid Academy ID.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const membership = await staffApi.acceptInvitation(parsedOrgId, {
        token: token.trim(),
      });

      setSuccessMembership(membership);
      await refreshAcademies();
      if (membership.organization) {
        setActiveAcademy(membership.organization);
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 400) {
          setError(
            err.message ||
              'This invitation token is invalid, expired, or has already been used.'
          );
        } else if (err.status === 403) {
          setError(
            err.message ||
              'Access forbidden. Ensure you are signed in with the exact email address the invitation was sent to.'
          );
        } else {
          setError(err.message || 'Failed to accept invitation. Please verify your token.');
        }
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

  // If user is not authenticated, instruct them to log in first
  if (!user) {
    const returnUrl = encodeURIComponent(
      `/accept-invitation?token=${encodeURIComponent(token)}&org=${encodeURIComponent(orgId)}`
    );

    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
            <Mail className="h-5 w-5" />
          </div>
          <CardTitle className="text-2xl">Academy Invitation</CardTitle>
          <CardDescription>
            You have received an invitation to join a Quran Academy.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p className="text-muted-foreground">
            To accept this invitation and claim your role, please sign in with your account credentials.
          </p>
          <Alert>
            <AlertDescription className="text-xs">
              Make sure to sign in using the same email address that received the invitation link.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href={`/login?returnUrl=${returnUrl}`}>
              <LogIn className="h-4 w-4 mr-2" /> Sign In to Accept Invitation
            </Link>
          </Button>
          <Button variant="ghost" asChild className="w-full text-xs">
            <Link href="/">Back to Home</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // If successfully accepted
  if (successMembership) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300 mb-2">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl">Invitation Accepted!</CardTitle>
          <CardDescription>
            You are now a verified member of the academy.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center text-sm">
          <div className="rounded-lg bg-muted p-4">
            <p className="text-xs text-muted-foreground">Assigned Role</p>
            <p className="text-lg font-semibold capitalize text-foreground mt-0.5">
              {successMembership.role_display || successMembership.role}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Your role-specific dashboard is ready with your classes, schedule, and permissions.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={() => {
              router.push('/app/dashboard');
            }}
          >
            Go to Your Dashboard <ArrowRight className="h-4 w-4 ml-2" />
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
              <AlertTitle>Unable to accept</AlertTitle>
              <AlertDescription className="text-xs mt-1">{error}</AlertDescription>
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
              onChange={(e) => setOrgId(e.target.value)}
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
              onChange={(e) => setToken(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting || !token || !orgId}>
            {isSubmitting ? 'Verifying & Accepting...' : 'Accept Invitation'}
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
    <div className="bg-muted/40 flex min-h-screen items-center justify-center p-4">
      <React.Suspense fallback={null}>
        <AcceptInvitationForm />
      </React.Suspense>
    </div>
  );
}
