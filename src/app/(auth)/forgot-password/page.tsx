'use client';

import * as React from 'react';
import Link from 'next/link';
import { passwordResetApi } from '@/features/auth/api/password-reset';
import { ApiError } from '@/lib/api/errors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';

function ForgotPasswordForm() {
  const [email, setEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submittedEmail, setSubmittedEmail] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      await passwordResetApi.requestReset(email);
      setSubmittedEmail(email.trim());
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Unable to process password reset.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-sm">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <KeyRound className="h-5 w-5" />
          </div>
          <CardTitle className="text-xl">Forgot password?</CardTitle>
        </div>
        <CardDescription>
          No worries. Enter your registered email address and we&apos;ll send you instructions to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {submittedEmail ? (
          <div className="space-y-4">
            <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <AlertTitle>Reset instructions sent</AlertTitle>
              <AlertDescription className="text-xs mt-1">
                If an account exists with <strong className="font-semibold">{submittedEmail}</strong>, you will receive an email shortly with a password reset link.
              </AlertDescription>
            </Alert>
            <p className="text-xs text-muted-foreground text-center">
              Didn&apos;t receive an email? Check your spam folder or try again with a different email.
            </p>
            <Button
              variant="outline"
              className="w-full text-xs"
              onClick={() => {
                setSubmittedEmail(null);
                setEmail('');
              }}
            >
              Send another link
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
              <Label htmlFor="reset-email">Email Address</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting || !email.trim()}>
              {isSubmitting ? 'Sending Instructions...' : 'Send Reset Instructions'}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-4">
        <Link
          href="/login"
          className="inline-flex items-center text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Sign In
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="bg-muted/40 flex min-h-screen items-center justify-center p-4">
      <React.Suspense fallback={null}>
        <ForgotPasswordForm />
      </React.Suspense>
    </div>
  );
}
