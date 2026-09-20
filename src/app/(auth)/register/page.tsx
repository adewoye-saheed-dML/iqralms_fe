'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  React.useEffect(() => {
    if (user && !isLoading) {
      router.push('/app/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) return null;

  return (
    <div className="bg-muted/40 flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Academy Access & Registration</CardTitle>
          <CardDescription>
            IQRA LMS uses an institutional access and invitation model.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="border-blue-200 bg-blue-50/50 text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
            <Info className="h-5 w-5" />
            <AlertTitle className="font-semibold">Public Self-Registration Disabled</AlertTitle>
            <AlertDescription className="text-xs sm:text-sm mt-1">
              Public self-registration into arbitrary roles (Student, Parent, Teacher) is not permitted. Access is provisioned strictly through structured workflows:
            </AlertDescription>
          </Alert>

          <div className="space-y-3 text-sm">
            <div className="rounded-lg border p-3">
              <div className="font-medium text-foreground">Teachers & Instructors</div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Join your academy via the email invitation link sent by your academy owner or administrator.
              </p>
            </div>

            <div className="rounded-lg border p-3">
              <div className="font-medium text-foreground">Students & Parents</div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Enrolled directly by your academy administration or invited via an official guardian link.
              </p>
            </div>

            <div className="rounded-lg border p-3">
              <div className="font-medium text-foreground">Academy Owners & Madrasahs</div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Review available academy plans and access tiers to provision an organization.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button asChild className="w-full">
              <Link href="/login">Sign In with Existing Account</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/accept-invitation">Accept an Invitation Token</Link>
            </Button>
            <Button variant="ghost" asChild className="w-full">
              <Link href="/pricing" className="text-xs">
                View Pricing & Access Information <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
