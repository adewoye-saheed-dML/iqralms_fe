import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  GraduationCap,
  Award,
  ArrowRight,
  BookOpen,
  Languages,
  Compass,
  Video,
  ShieldCheck,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-background py-16 sm:py-24">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3.5 py-1 text-xs font-medium text-muted-foreground shadow-xs mb-6">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Purpose-Built for Quran &amp; Islamic Studies Academies
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
            Streamline your Quran &amp; Islamic Studies Academy with structured learning &amp; operations
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            From Quran memorization (Hifz) and Tajweed to Arabic literacy, Hadith, Fiqh, and foundational Islamic studies—manage multi-level curricula, flexible lesson scheduling, recitation grading, and family oversight in one unified Islamic education platform.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
              <Link href="/pricing">
                View Pricing &amp; Access <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/login">Sign In to Academy</Link>
            </Button>
          </div>

          {/* Hero Visual Showcase */}
          <div className="mt-14 mx-auto max-w-4xl">
            <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-sm text-left">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b">
                <div className="flex items-center gap-4">
                  <Image
                    src="/images/iqralms-icon.jpeg"
                    alt="IQRA LMS"
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-xl object-contain border bg-white p-1 shadow-xs"
                    priority
                  />
                  <div>
                    <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                      <span>iqra<span className="text-emerald-600">lms</span></span>
                      <Badge variant="outline" className="text-[10px] text-emerald-700 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/50">
                        Academy Operating System
                      </Badge>
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Unified management for traditional madrasahs, online institutes, and Islamic schools
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Multi-Tenant
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border">
                    <ShieldCheck className="h-3.5 w-3.5" /> Role Segregated
                  </span>
                </div>
              </div>

              {/* Pillars Highlight Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-center sm:text-left">
                <div className="p-3 rounded-lg bg-muted/30 border border-muted/50">
                  <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1">
                    <BookOpen className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>Quran &amp; Tajweed</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Hifz, Tilawah, Makharij &amp; Muraja&apos;ah</p>
                </div>

                <div className="p-3 rounded-lg bg-muted/30 border border-muted/50">
                  <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1">
                    <Languages className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>Arabic Language</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Qaida, Reading &amp; Grammar tracks</p>
                </div>

                <div className="p-3 rounded-lg bg-muted/30 border border-muted/50">
                  <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1">
                    <Compass className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>Islamic Studies</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Hadith, Fiqh, Seerah &amp; Tarbiyyah</p>
                </div>

                <div className="p-3 rounded-lg bg-muted/30 border border-muted/50">
                  <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1">
                    <Video className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>Virtual Classroom</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">1-on-1 &amp; cohort video sessions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Educational Scope Section */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground mb-3">
            Comprehensive Islamic Pedagogy
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Rooted in the Quran, Built for Comprehensive Islamic Education</h2>
          <p className="mt-4 text-muted-foreground text-base">
            While Quran memorization and recitation are at the heart of our platform, IQRA LMS supports your academy’s full curriculum across Arabic literacy, Hadith studies, Fiqh, and character building.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="flex flex-col justify-between">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/50 flex items-center justify-center mb-3">
                <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <CardTitle className="text-lg">Quran &amp; Hifz Memorization</CardTitle>
              <CardDescription className="text-xs leading-relaxed pt-1">
                Structured Hifz milestones from Juz&apos; Amma to complete Khatm. Systematize daily new lesson (Sabaq), recent revision (Sabqi), and retention review (Manzil).
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Includes:</span> Tajweed rule rubrics, audio recitation submissions, and oral testing queues.
            </CardContent>
          </Card>

          <Card className="flex flex-col justify-between">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/50 flex items-center justify-center mb-3">
                <Languages className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <CardTitle className="text-lg">Arabic Literacy &amp; Language</CardTitle>
              <CardDescription className="text-xs leading-relaxed pt-1">
                From beginner Noorani Qaida phonetics and letter recognition to Quranic vocabulary, basic morphology (Sarf), and grammar (Nahw) for lasting comprehension.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Includes:</span> Progressive reader levels, pronunciation checks, and syllabus textbooks.
            </CardContent>
          </Card>

          <Card className="flex flex-col justify-between">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/50 flex items-center justify-center mb-3">
                <Compass className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <CardTitle className="text-lg">Islamic Studies &amp; Ethics</CardTitle>
              <CardDescription className="text-xs leading-relaxed pt-1">
                Systematic courses covering Prophetic Seerah, authentic Hadith, essential Fiqh of worship (Taharah, Salah, Sawm), Aqeedah, and daily Adhkar (Tarbiyyah).
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Includes:</span> Modular lessons, written evaluations, and character-building milestones.
            </CardContent>
          </Card>

          <Card className="flex flex-col justify-between">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/50 flex items-center justify-center mb-3">
                <Video className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <CardTitle className="text-lg">Live Interactive Classrooms</CardTitle>
              <CardDescription className="text-xs leading-relaxed pt-1">
                Built-in secure video classrooms, interactive whiteboard, live Quran recitation coaching, session attendance logging, and recording archives.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Includes:</span> 1-on-1 private sessions and group cohort halaqat with zero external links.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Institutional LMS Operations Section */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Modern operations for Islamic educational institutions</h2>
          <p className="mt-4 text-muted-foreground text-base">
            Eliminate administrative clutter with tools engineered specifically for managing madrasahs, Islamic institutes, and online Quran academies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Calendar className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-xl">Flexible Scheduling &amp; Booking</CardTitle>
              <CardDescription>
                Coordinate 1-on-1 recitation slots and group cohorts between teachers and students, with automatic timezone conversion and intelligent waitlists.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Award className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-xl">Rubric Assessment &amp; Grading</CardTitle>
              <CardDescription>
                Conduct audio recitation evaluations, Tajweed grading, and written homework reviews with transparent rubric criteria and audio playback.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <GraduationCap className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-xl">Curriculum &amp; Track Structure</CardTitle>
              <CardDescription>
                Define multi-tiered curriculum tracks across Quran, Arabic, and Islamic studies with sequential ordered levels and clear graduation milestones.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Curriculum Tracks Showcase */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 bg-muted/20 border rounded-2xl p-8 sm:p-12">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-8">
          <h3 className="text-2xl font-bold tracking-tight">Curriculum tracks designed for authentic madrasah syllabi</h3>
          <p className="text-muted-foreground text-sm">
            Configure any subject track your academy offers, or choose from our established Islamic curriculum templates.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
          <div className="rounded-lg border bg-card p-3 shadow-2xs">
            <span className="text-xs font-semibold text-foreground block">Tajweed Rules</span>
            <span className="text-[11px] text-muted-foreground">Makharij &amp; Sifaat</span>
          </div>
          <div className="rounded-lg border bg-card p-3 shadow-2xs">
            <span className="text-xs font-semibold text-foreground block">Quran Hifz</span>
            <span className="text-[11px] text-muted-foreground">Memorization &amp; Review</span>
          </div>
          <div className="rounded-lg border bg-card p-3 shadow-2xs">
            <span className="text-xs font-semibold text-foreground block">Noorani Qaida</span>
            <span className="text-[11px] text-muted-foreground">Foundational Reading</span>
          </div>
          <div className="rounded-lg border bg-card p-3 shadow-2xs">
            <span className="text-xs font-semibold text-foreground block">Quranic Arabic</span>
            <span className="text-[11px] text-muted-foreground">Vocabulary &amp; Grammar</span>
          </div>
          <div className="rounded-lg border bg-card p-3 shadow-2xs">
            <span className="text-xs font-semibold text-foreground block">Hadith &amp; Seerah</span>
            <span className="text-[11px] text-muted-foreground">Prophetic Teachings</span>
          </div>
          <div className="rounded-lg border bg-card p-3 shadow-2xs">
            <span className="text-xs font-semibold text-foreground block">Fiqh of Worship</span>
            <span className="text-[11px] text-muted-foreground">Salah, Taharah, Adab</span>
          </div>
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
          <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="font-semibold text-primary text-xs uppercase tracking-wider mb-2">Owner / Admin</div>
              <h3 className="text-base font-bold mb-2">Academy Operations</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Curriculum design, teacher invitations, student enrollments, academy finances, teacher payout calculations, audit history, and multi-tenant settings.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t text-[11px] text-muted-foreground">
              Institutional Governance
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="font-semibold text-primary text-xs uppercase tracking-wider mb-2">Teacher / Scholar</div>
              <h3 className="text-base font-bold mb-2">Teaching &amp; Evaluation</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Weekly teaching availability, assigned student rosters, live recitation classes, audio homework grading, and transparent compensation statements.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t text-[11px] text-muted-foreground">
              Pedagogical Delivery
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="font-semibold text-primary text-xs uppercase tracking-wider mb-2">Parent / Family</div>
              <h3 className="text-base font-bold mb-2">Family Oversight</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Manage all registered children in one portal, book recitation sessions on their behalf, view graded rubrics, and follow Islamic studies progress.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t text-[11px] text-muted-foreground">
              Parental Engagement
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="font-semibold text-primary text-xs uppercase tracking-wider mb-2">Student / Seeker</div>
              <h3 className="text-base font-bold mb-2">Active Learning</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Join live video classes in one click, review lesson materials, record and submit recitation homework, and track Quran memorization achievements.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t text-[11px] text-muted-foreground">
              Knowledge Acquisition
            </div>
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
            <p className="text-xs text-muted-foreground">Register your institution, configure timezone, and personalize academy settings.</p>
          </div>

          <div className="flex flex-col items-center text-center p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg mb-4">
              2
            </div>
            <h4 className="font-semibold text-base mb-1">Configure Curriculum</h4>
            <p className="text-xs text-muted-foreground">Set up tracks in Quran, Arabic, and Islamic Studies with sequential level progression.</p>
          </div>

          <div className="flex flex-col items-center text-center p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg mb-4">
              3
            </div>
            <h4 className="font-semibold text-base mb-1">Invite Teachers</h4>
            <p className="text-xs text-muted-foreground">Dispatch email invitations via secure tokens for qualified Quran and Islamic studies instructors.</p>
          </div>

          <div className="flex flex-col items-center text-center p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg mb-4">
              4
            </div>
            <h4 className="font-semibold text-base mb-1">Schedule &amp; Teach</h4>
            <p className="text-xs text-muted-foreground">Enroll students, book lesson slots, evaluate homework, and nurture academic growth.</p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border bg-card p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-sm space-y-6">
          <div className="flex justify-center">
            <Image
              src="/images/iqralms-seal.jpeg"
              alt="IQRA LMS Seal"
              width={72}
              height={72}
              className="h-16 w-16 rounded-full object-contain border bg-white p-1 shadow-xs"
            />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Ready to establish your Quran &amp; Islamic Studies Academy?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            Explore institutional access tiers and onboarding details, or connect with our support team to get your madrasah or institute started.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Link href="/pricing">View Pricing &amp; Plans</Link>
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
