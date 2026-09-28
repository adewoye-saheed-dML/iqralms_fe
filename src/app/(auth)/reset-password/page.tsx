'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { passwordResetApi } from '@/features/auth/api/password-reset';
import { ApiError } from '@/lib/api/errors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, CheckCircle2, KeyRound, ShieldAlert } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const uid = searchParams.get('uid') || searchParams.get('uidb64') || '';
  const token = searchParams.get('token') || '';

  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!uid || !token) {
      setError('Invalid or expired password reset link. Please request a new one.');
      return;
    }

    setIsSubmitting(true);

    try {
      await passwordResetApi.confirmReset({
        uid,
        token,
        new_password1: password,
        new_password2: confirmPassword,
      });
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Unable to reset password. The link may have expired.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasParams = !!(uid && token);

  return (
    <Card className="w-full max-w-md shadow-sm">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <KeyRound className="h-5 w-5" />
          </div>
          <CardTitle className="text-xl">Set New Password</CardTitle>
        </div>
        <CardDescription>
          Choose a secure new password for your academy account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasParams ? (
          <div className="space-y-4">
            <Alert variant="destructive">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Missing or Invalid Reset Link</AlertTitle>
              <AlertDescription className="text-xs mt-1">
                The password reset link appears incomplete or invalid. Please request a new reset link.
              </AlertDescription>
            </Alert>
            <Button asChild className="w-full" variant="outline">
              <Link href="/forgot-password">Request New Reset Link</Link>
            </Button>
          </div>
        ) : isSuccess ? (
          <div className="space-y-4">
            <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <AlertTitle>Password Reset Successfully</AlertTitle>
              <AlertDescription className="text-xs mt-1">
                Your password has been updated. Redirecting you to sign in...
              </AlertDescription>
            </Alert>
            <Button asChild className="w-full">
              <Link href="/login">Sign In Now</Link>
            </Button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Repeat your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting || !password}>
              {isSubmitting ? 'Updating Password...' : 'Save New Password'}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-4">
        <Link
          href="/login"
          className="inline-flex items-center text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Return to Sign In
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="bg-muted/40 flex min-h-screen items-center justify-center p-4">
      <React.Suspense fallback={null}>
        <ResetPasswordForm />
      </React.Suspense>
    </div>
  );
}
