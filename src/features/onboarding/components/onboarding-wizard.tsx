'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAcademy } from '@/lib/academy/academy-provider';
import { onboardingApi } from '../api/onboarding';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function OnboardingWizard() {
  const { activeAcademy, activeRole } = useAcademy();
  const router = useRouter();

  const { data: tracks = [] } = useQuery({
    queryKey: ['academy', activeAcademy?.id, 'tracks'],
    queryFn: () => onboardingApi.getTracks(activeAcademy!.id),
    enabled: !!activeAcademy,
  });

  // If no academy, this shouldn't be rendered, but safe check
  if (!activeAcademy) return null;

  const isCurriculumSetup = tracks.length > 0;
  const isAcademyReady = isCurriculumSetup; // Foundation ready for Phase 14

  const steps = [
    {
      id: 'details',
      title: 'Academy Details',
      description: 'Name, URL slug, and timezone configured.',
      status: 'complete' as const,
    },
    {
      id: 'curriculum',
      title: 'Curriculum',
      description: 'Define tracks and subjects taught at your academy.',
      status: isCurriculumSetup ? ('complete' as const) : ('current' as const),
    },
    {
      id: 'teachers',
      title: 'Teachers & Staff',
      description: 'Invite teachers and staff members.',
      status: 'pending' as const,
      isFuturePhase: true,
    },
    {
      id: 'students',
      title: 'Students',
      description: 'Import or invite students.',
      status: 'pending' as const,
      isFuturePhase: true,
    },
    {
      id: 'class_config',
      title: 'Class Configuration',
      description: 'Set up class durations and schedules.',
      status: 'pending' as const,
      isFuturePhase: true,
    },
    {
      id: 'notifications',
      title: 'Notification Preferences',
      description: 'Configure automated emails and alerts.',
      status: 'pending' as const,
      isFuturePhase: true,
    },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Academy Setup"
        description={`Welcome to ${activeAcademy.name}. Let's get your academy ready.`}
      />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-4 md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Setup Progress</CardTitle>
              <CardDescription>
                {isAcademyReady ? 'Foundation complete' : '1 / 2 foundation steps'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <nav aria-label="Progress" className="space-y-4">
                {steps.map((step) => {
                  return (
                    <div key={step.id} className="flex items-start">
                      <div className="flex h-5 items-center">
                        {step.status === 'complete' ? (
                          <CheckCircle2 className="text-primary h-5 w-5" aria-hidden="true" />
                        ) : step.status === 'current' ? (
                          <Circle
                            className="text-primary h-5 w-5 fill-current"
                            aria-hidden="true"
                          />
                        ) : (
                          <Circle className="text-muted-foreground h-5 w-5" aria-hidden="true" />
                        )}
                      </div>
                      <div className="ml-3 text-sm">
                        <span
                          className={`font-medium ${
                            step.status === 'current'
                              ? 'text-primary'
                              : step.status === 'complete'
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                          }`}
                        >
                          {step.title}
                          {step.isFuturePhase && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                              <Clock className="mr-1 h-3 w-3" />
                              Coming soon
                            </span>
                          )}
                        </span>
                        <p className="text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 md:col-span-2">
          {!isCurriculumSetup ? (
            <Card>
              <CardHeader>
                <CardTitle>Curriculum Setup</CardTitle>
                <CardDescription>Start by adding your first subject or track.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
                  <div className="text-muted-foreground max-w-sm">
                    A track is a subject area your academy teaches, like Quran Reading,
                    Memorization, or Arabic.
                  </div>
                  {activeRole === 'owner' || activeRole === 'admin' ? (
                    <Button onClick={() => router.push('/app/onboarding/curriculum')}>
                      Add First Track
                    </Button>
                  ) : (
                    <div className="text-sm font-medium text-amber-600">
                      You need owner or admin permissions to set up the curriculum.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Academy Ready</CardTitle>
                <CardDescription>Your academy setup foundation is complete.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    You have successfully created the academy and defined its curriculum tracks.
                    Additional setup features like teacher invitations and class scheduling will be
                    available soon.
                  </p>
                  <Button onClick={() => router.push('/app/dashboard')}>
                    Continue to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
