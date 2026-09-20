import Link from 'next/link';
import { Check, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function PricingPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Transparent Pricing & Institutional Access
        </h1>
        <p className="text-muted-foreground text-lg">
          Clear, structured academy tiers designed to scale with your Quranic teaching staff and student body.
        </p>
      </div>

      <Alert className="max-w-3xl mx-auto border-blue-200 bg-blue-50/50 text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
        <HelpCircle className="h-5 w-5" />
        <AlertTitle className="font-semibold">Institutional Access Notice</AlertTitle>
        <AlertDescription className="text-xs sm:text-sm mt-1">
          Direct online payment checkout is pending payment gateway contract integration. Currently, academy access credentials and institutional onboarding are provisioned directly by our support team or via authorized invitation.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Starter Plan */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-xl">Standard Academy</CardTitle>
            <CardDescription>For growing madrasahs and local community Quran circles.</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$49</span>
              <span className="text-muted-foreground text-sm"> / month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Up to 5 Instructors & Teachers</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Full Curriculum & Tracks Management</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Scheduling & 1-on-1 Lesson Bookings</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Assessment Review & Grading Queue</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Progress Tracking & Milestones</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/login">Access with Credentials</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Growth Plan */}
        <Card className="flex flex-col justify-between border-primary shadow-md relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider">
            Most Popular
          </div>
          <CardHeader>
            <CardTitle className="text-xl">Professional Academy</CardTitle>
            <CardDescription>For established Quran academies with dedicated staff and cohorts.</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$129</span>
              <span className="text-muted-foreground text-sm"> / month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Unlimited Instructors & Staff</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Multi-track Hifz & Tajweed Curricula</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Cohort & Group Class Scheduling</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Teacher Hourly Rate & Earnings Reconciliation</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Audit Logging & Staff Permission Controls</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/contact">Request Academy Setup</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Institutional Plan */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-xl">Institutional</CardTitle>
            <CardDescription>For regional Islamic schools, universities, and multi-branch networks.</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">Custom</span>
              <span className="text-muted-foreground text-sm"> / institutional</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Multi-organization Tenancy & Switching</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Custom Student CSV & Data Imports</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Dedicated Onboarding & Curriculum Setup</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Priority Technical & Pedagogical Support</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link href="/contact">Contact Institutional Team</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
