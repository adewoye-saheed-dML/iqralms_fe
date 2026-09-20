import Link from 'next/link';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Users,
  Award,
  Shield,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function FeaturesPage() {
  const featureGroups = [
    {
      title: 'Curriculum & Track Management',
      description: 'Design comprehensive educational paths tailored to student proficiency.',
      icon: BookOpen,
      capabilities: [
        'Organize custom tracks: Hifz, Nazirah, Tajweed, Islamic Studies',
        'Define sequential, ordered levels with clear completion criteria',
        'Configure track prerequisites and target competencies',
        'Track curriculum completion across student cohorts',
      ],
    },
    {
      title: 'Scheduling & Booking Engine',
      description: 'Seamless coordination for individual lessons and group classes.',
      icon: Calendar,
      capabilities: [
        '1-on-1 private lesson and group cohort bookings',
        'Automated waitlist management for high-demand teachers',
        'Calendar-based lesson management and conflict detection',
        'Direct cancellation and rescheduling workflows',
      ],
    },
    {
      title: 'Assessment & Grading Queue',
      description: 'Standardized evaluation mechanisms for placement and progression.',
      icon: Award,
      capabilities: [
        'Placement assessments for incoming student leveling',
        'Periodic recitation reviews and Tajweed evaluation',
        'Structured review queues for lead teachers and instructors',
        'Detailed notes and rubric scores saved to student record',
      ],
    },
    {
      title: 'Teacher Management & Earnings',
      description: 'Streamlined onboarding, scheduling, and hourly compensation.',
      icon: Users,
      capabilities: [
        'Secure email invitation token workflow',
        'Configurable weekly hours caps and teaching availability',
        'Hourly payout rate tracking and reconciliation statements',
        'Direct assignment to curriculum tracks and cohorts',
      ],
    },
    {
      title: 'Progress Monitoring & Snapshots',
      description: 'Granular visibility into student Quranic learning journeys.',
      icon: TrendingUp,
      capabilities: [
        'Surah and Ayah memorization progress logs',
        'Level progression tracking and milestone achievement records',
        'Historical snapshots for parent reviews and academic reporting',
        'Transparent feedback loops between teacher and student',
      ],
    },
    {
      title: 'Security, Tenancy & Audit Trails',
      description: 'Enterprise-grade isolation for multi-academy operations.',
      icon: Shield,
      capabilities: [
        'Strict tenant-scoped query caching and data isolation',
        'Role-based capability permissions (Owner, Teacher, Parent, Student)',
        'Immutable operational audit logs for compliance',
        'Automated notifications for key academic and scheduling events',
      ],
    },
  ];

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Complete features for your Quran Academy
        </h1>
        <p className="text-muted-foreground text-lg">
          Designed specifically to meet the academic, pedagogical, and administrative requirements of modern Quran institutions.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featureGroups.map((group) => {
          const Icon = group.icon;
          return (
            <Card key={group.title} className="flex flex-col justify-between">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl">{group.title}</CardTitle>
                <CardDescription>{group.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  {group.capabilities.map((cap) => (
                    <li key={cap} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* CTA */}
      <div className="border-t pt-12 text-center max-w-xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold">Ready to see it in action?</h2>
        <p className="text-muted-foreground text-sm">
          Review our pricing tiers or reach out to our team for custom institutional deployment.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild>
            <Link href="/pricing">View Pricing</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
