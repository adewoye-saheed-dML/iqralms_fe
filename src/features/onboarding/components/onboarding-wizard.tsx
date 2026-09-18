'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAcademy } from '@/lib/academy/academy-provider';
import { onboardingApi } from '../api/onboarding';
import { staffApi } from '@/features/staff/api/staff';
import { studentsApi } from '@/features/students/api/students';
import { curriculumKeys, staffKeys, studentKeys } from '@/lib/api/query-keys';
import { can } from '@/lib/permissions/capabilities';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, Circle, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';

export function OnboardingWizard() {
  const { activeAcademy, activeRole } = useAcademy();
  const router = useRouter();

  const { data: tracks = [], isLoading: isLoadingTracks, error: tracksError } = useQuery({
    queryKey: curriculumKeys.tracks(activeAcademy?.id),
    queryFn: () => onboardingApi.getTracks(activeAcademy!.id),
    enabled: !!activeAcademy,
  });

  const { data: staff = [], isLoading: isLoadingStaff, error: staffError } = useQuery({
    queryKey: staffKeys.all(activeAcademy?.id),
    queryFn: () => staffApi.getMemberships(activeAcademy!.id),
    enabled: !!activeAcademy,
  });

  const { data: students = [], isLoading: isLoadingStudents, error: studentsError } = useQuery({
    queryKey: studentKeys.all(activeAcademy?.id),
    queryFn: () => studentsApi.getStudents(activeAcademy!.id),
    enabled: !!activeAcademy,
  });

  if (!activeAcademy) return null;

  if (isLoadingTracks || isLoadingStaff || isLoadingStudents) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (tracksError || staffError || studentsError) {
    return (
      <div className="mx-auto max-w-4xl p-8">
        <ErrorState title="Failed to load onboarding status" message="An error occurred while fetching your setup progress." />
      </div>
    );
  }

  // Local progress model based on supported data
  const isCurriculumSetup = tracks.length > 0;
  // A new academy has at least 1 staff (the creator). So we check for > 1 or specific roles if needed.
  // We'll just assume > 1 means they invited someone.
  const isStaffSetup = staff.length > 1;
  const isStudentsSetup = students.length > 0;

  // We define readiness as having setup the foundation features (curriculum, staff, students)
  const isAcademyReady = isCurriculumSetup && isStaffSetup && isStudentsSetup;

  const steps = [
    {
      id: 'details',
      title: 'Academy Details',
      description: 'Name, URL slug, and timezone configured.',
      status: 'complete' as const,
      action: null,
    },
    {
      id: 'curriculum',
      title: 'Curriculum',
      description: 'Define tracks and subjects taught at your academy.',
      status: isCurriculumSetup ? ('complete' as const) : ('current' as const),
      action: {
        label: 'Add First Track',
        onClick: () => router.push('/app/onboarding/curriculum'),
        disabled: !can('manage_curriculum', { activeRole }),
        disabledReason: 'Owner or admin permissions required.',
      },
    },
    {
      id: 'teachers',
      title: 'Teachers & Staff',
      description: 'Invite teachers and staff members.',
      status: !isCurriculumSetup ? ('pending' as const) : isStaffSetup ? ('complete' as const) : ('current' as const),
      action: {
        label: 'Invite Staff',
        onClick: () => router.push('/app/teachers/add'),
        disabled: !can('manage_staff', { activeRole }),
        disabledReason: 'Owner or admin permissions required.',
      },
    },
    {
      id: 'students',
      title: 'Students',
      description: 'Import or invite students.',
      status: !isCurriculumSetup || !isStaffSetup ? ('pending' as const) : isStudentsSetup ? ('complete' as const) : ('current' as const),
      action: {
        label: 'Add Students',
        onClick: () => router.push('/app/students/add'),
        disabled: !can('manage_students', { activeRole }),
        disabledReason: 'Owner, admin, or staff permissions required.',
      },
    },
    {
      id: 'class_config',
      title: 'Class Configuration',
      description: 'Set up class durations and schedules.',
      status: 'pending' as const,
      isFuturePhase: true,
      action: null,
    },
    {
      id: 'notifications',
      title: 'Notification Preferences',
      description: 'Configure automated emails and alerts.',
      status: 'pending' as const,
      isFuturePhase: true,
      action: null,
    },
  ];

  const currentStep = steps.find(s => s.status === 'current');

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
                {isAcademyReady ? 'Foundation complete' : 'Complete setup to launch'}
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
                              Open
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
          {!isAcademyReady && currentStep ? (
            <Card>
              <CardHeader>
                <CardTitle>{currentStep.title}</CardTitle>
                <CardDescription>{currentStep.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
                  {currentStep.action && (
                    <>
                      {currentStep.action.disabled ? (
                        <div className="text-sm font-medium text-amber-600">
                          {currentStep.action.disabledReason}
                        </div>
                      ) : (
                        <Button onClick={currentStep.action.onClick} className="gap-2">
                          {currentStep.action.label}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      )}
                    </>
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
                    You have successfully defined the curriculum, invited staff, and added students.
                    The academy is now operational!
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
