import Link from 'next/link';
import {
  Calendar,
  GraduationCap,
  Award,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-background py-16 sm:py-24">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm mb-6">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Purpose-built Quran Academy Learning Platform
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Streamline your Quran Academy with structured learning & operations
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            Manage curriculum tracks, lesson scheduling, student assessments, teacher invitations, and progress tracking in one unified Islamic education system.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="gap-2">
              <Link href="/pricing">
                View Pricing & Access <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/login">Sign In to Academy</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Product Value Section */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Built for genuine Quranic educational workflows</h2>
          <p className="mt-4 text-muted-foreground text-base">
            Every feature is anchored in the daily realities of running Hifz, Nazirah, Tajweed, and Islamic studies programs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <GraduationCap className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-xl">Curriculum & Track Structure</CardTitle>
              <CardDescription>
                Define multi-tiered curriculum tracks (Tajweed, Memorization, Recitation) with progressive ordered levels and clear learning milestones.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-xl">Flexible Scheduling & Booking</CardTitle>
              <CardDescription>
                Coordinate 1-on-1 and cohort sessions between teachers and students, with built-in waitlist management and conflict mitigation.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Award className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-xl">Rigorous Assessment Queue</CardTitle>
              <CardDescription>
                Conduct placement tests, routine recitation assessments, and structured grading reviews with detailed rubric feedback.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Role Experiences Section */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 bg-muted/30 rounded-2xl py-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Dedicated experiences for every stakeholder</h2>
          <p className="mt-4 text-muted-foreground text-base">
            No cluttered one-size-fits-all screens. Every user role enters an experience designed strictly for their responsibilities.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="font-semibold text-primary text-sm uppercase tracking-wider mb-2">Owner / Admin</div>
            <h3 className="text-lg font-bold mb-2">Academy Operations</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Curriculum design, teacher invitations, student enrollment, academy finance, scheduling, audit history, and organizational settings.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="font-semibold text-primary text-sm uppercase tracking-wider mb-2">Teacher</div>
            <h3 className="text-lg font-bold mb-2">Teaching & Grading</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Daily schedule, assigned students, recitation assessments, review queue, availability management, and personal earnings statements.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="font-semibold text-primary text-sm uppercase tracking-wider mb-2">Parent</div>
            <h3 className="text-lg font-bold mb-2">Child Oversight</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Track children&apos;s lesson schedules, view assessment marks, review teacher feedback, and follow memorization milestones.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="font-semibold text-primary text-sm uppercase tracking-wider mb-2">Student</div>
            <h3 className="text-lg font-bold mb-2">Active Learning</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              View upcoming lessons, follow curriculum progression, see assessment history, and track Quranic memorization progress.
            </p>
          </div>
        </div>
      </section>

      {/* Academy Workflow */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Structured academy setup workflow</h2>
          <p className="mt-4 text-muted-foreground text-base">
            From academy creation to first lesson booking in a verified, multi-step onboarding journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex flex-col items-center text-center p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg mb-4">
              1
            </div>
            <h4 className="font-semibold text-base mb-1">Create Academy</h4>
            <p className="text-xs text-muted-foreground">Register your organization, choose timezone, and set up your academy profile.</p>
          </div>

          <div className="flex flex-col items-center text-center p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg mb-4">
              2
            </div>
            <h4 className="font-semibold text-base mb-1">Configure Curriculum</h4>
            <p className="text-xs text-muted-foreground">Set up tracks (Hifz, Tajweed, Arabic) and structured level progression.</p>
          </div>

          <div className="flex flex-col items-center text-center p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg mb-4">
              3
            </div>
            <h4 className="font-semibold text-base mb-1">Invite Teachers</h4>
            <p className="text-xs text-muted-foreground">Dispatch email invitations via secure tokens for teachers and qualified instructors.</p>
          </div>

          <div className="flex flex-col items-center text-center p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg mb-4">
              4
            </div>
            <h4 className="font-semibold text-base mb-1">Schedule & Teach</h4>
            <p className="text-xs text-muted-foreground">Enroll students, book lesson slots, record assessments, and monitor growth.</p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border bg-card p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-sm space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Ready to establish your Quran Academy?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            Explore access tiers and onboarding details, or connect with our support team to get your institution started.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/pricing">View Pricing & Plans</Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
