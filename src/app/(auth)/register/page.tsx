'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, ArrowRight, User, Users, Mail, ShieldCheck } from 'lucide-react';
import { ApiError } from '@/lib/api/errors';

export default function RegisterPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, register } = useAuth();

  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [age, setAge] = React.useState('');
  const [parentEmail, setParentEmail] = React.useState('');

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [registeredResult, setRegisteredResult] = React.useState<{
    isMinor: boolean;
    parentEmail?: string;
    signupCode?: string;
  } | null>(null);

  React.useEffect(() => {
    if (user && !isAuthLoading) {
      router.push('/app/dashboard');
    }
  }, [user, isAuthLoading, router]);

  const parsedAge = age.trim() ? parseInt(age, 10) : null;
  const isMinor = parsedAge !== null && !isNaN(parsedAge) && parsedAge < 18;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!age.trim() || parsedAge === null || isNaN(parsedAge) || parsedAge <= 0) {
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
      if (parentEmail.trim().toLowerCase() === email.trim().toLowerCase()) {
        setError('Parent email cannot be the same as the student email.');
        return;
      }
    }

    let timezone = 'UTC';
    try {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
      timezone = 'UTC';
    }

    setIsSubmitting(true);

    try {
      const generatedUsername = email.trim().split('@')[0] + Math.floor(1000 + Math.random() * 9000);
      const res = await register({
        username: generatedUsername,
        email: email.trim().toLowerCase(),
        password,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        role: 'student',
        timezone,
        age: parsedAge,
        parent_email: isMinor ? parentEmail.trim().toLowerCase() : undefined,
      });

      setRegisteredResult({
        isMinor,
        parentEmail: isMinor ? parentEmail.trim() : undefined,
        signupCode: res?.user?.signup_code,
      });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message || 'Registration failed. Please check your details.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during registration.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading) return null;

  if (registeredResult) {
    return (
      <div className="bg-muted/40 flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <CardTitle className="text-2xl">Registration Successful!</CardTitle>
            <CardDescription className="text-sm">
              Your student account has been created.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {registeredResult.isMinor ? (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm space-y-2">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Parent Invitation Sent
                </div>
                <p className="text-xs text-muted-foreground">
                  An invitation email has been sent to{' '}
                  <span className="font-semibold text-foreground">{registeredResult.parentEmail}</span>. Once your
                  parent or guardian verifies, your student profile will be fully linked.
                </p>
                {registeredResult.signupCode && (
                  <div className="pt-2 text-xs">
                    <span className="text-muted-foreground">Your Student Code: </span>
                    <span className="font-mono font-bold text-foreground">{registeredResult.signupCode}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground">
                Your account is ready. You can now sign in to your student dashboard.
              </p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link href="/login">
                Sign In to Your Account <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-muted/40 flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-sm">
        <CardHeader>
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <User className="h-5 w-5" />
          </div>
          <CardTitle className="text-2xl">Student Registration</CardTitle>
          <CardDescription>
            Create your student profile to begin your Quranic learning journey.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Registration error</AlertTitle>
              <AlertDescription className="text-xs mt-1">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  type="text"
                  required
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  type="text"
                  required
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="studentAge">Age</Label>
              <Input
                id="studentAge"
                type="number"
                min={1}
                max={120}
                required
                placeholder="e.g. 14"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Students under 18 require parent or guardian verification.
              </p>
            </div>

            {isMinor && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <Label htmlFor="parentEmail" className="font-semibold text-foreground text-sm">
                    Parent / Guardian Email
                  </Label>
                </div>
                <Input
                  id="parentEmail"
                  type="email"
                  required
                  placeholder="guardian@example.com"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  Because you are under 18, we will send an invitation to your parent or guardian to link and verify your student account.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="Choose password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !email || !password || !confirmPassword || !age}
            >
              {isSubmitting ? 'Creating Student Profile...' : 'Complete Student Registration'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 border-t pt-4 text-center text-xs text-muted-foreground">
          <p>
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
          <p>
            Have an academy invitation link?{' '}
            <Link href="/accept-invitation" className="font-medium text-primary hover:underline">
              Accept Invitation Token
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
