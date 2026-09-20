'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAcademy } from '@/lib/academy/academy-provider';
import { onboardingApi } from '../api/onboarding';
import { invitationsApi } from '@/features/invitations/api/invitations';
import { studentsApi } from '@/features/students/api/students';
import { curriculumKeys, invitationKeys, studentKeys } from '@/lib/api/query-keys';
import { can } from '@/lib/permissions/capabilities';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, Circle, ArrowRight, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { Badge } from '@/components/ui/badge';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  backendFact: string;
  endpoint: string | null;
  allowedRoles: string[];
  status: 'configured' | 'action_available' | 'uncontracted';
  statusLabel: string;
  actionLabel?: string;
  actionHref?: string;
  capability?: 'manage_curriculum' | 'manage_staff' | 'manage_students';
}

export function OnboardingWizard() {
  const { activeAcademy, activeRole } = useAcademy();
  const router = useRouter();
  const [selectedStepId, setSelectedStepId] = React.useState<string>('curriculum');

  const { data: tracks = [], isLoading: isLoadingTracks, error: tracksError } = useQuery({
    queryKey: curriculumKeys.tracks(activeAcademy?.id),
    queryFn: () => onboardingApi.getTracks(activeAcademy!.id),
    enabled: !!activeAcademy,
  });

  const { data: invitations = [], isLoading: isLoadingInvitations, error: invitationsError } = useQuery({
    queryKey: invitationKeys.all(activeAcademy?.id),
    queryFn: () => invitationsApi.list(activeAcademy!.id),
    enabled: !!activeAcademy,
  });

  const { data: students = [] , = [], isLoading: isLoadingStudents, error: studentsError } = useQuery({
    queryKey: studentKeys.all(activeAcademy?.id),
    queryFn: () => studentsApi.getStudents(activeAcademy!.id),
    enabled: !!activeAcademy,
  });

  if (!activeAcademy) return null;

  if (isLoadingTracks || isLoadingInvitations || isLoadingStudents) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (tracksError || invitationsError || studentsError) {
    return (
      <div className="mx-auto max-w-4xl p-8">
        <ErrorState
          title="Failed to load onboarding status"
          message="An error occurred while fetching your setup progress."
        />
      </div>
    );
  }

  const steps: OnboardingStep[] = [
    {
      id: 'academy_details',
      title: 'Academy Details',
      description: 'Name, URL slug, and timezone configured for the organization.',
      backendFact: 'Organization entity exists with valid name, slug, and timezone',
      endpoint: 'GET /api/organizations/{id}/',
      allowedRoles: ['owner', 'admin'],
      status: 'configured',
      statusLabel: 'Configured',
    },
    {
      id: 'curriculum',
      title: 'Curriculum',
      description: `Define tracks and levels taught at your academy (${tracks.length} track${tracks.length === 1 ? '' : 's'} recorded).`,
      backendFact: 'Academic tracks configured in organization',
      endpoint: 'GET /api/curriculum/organizations/{organization_pk}/tracks/',
      allowedRoles: ['owner', 'admin'],
      status: 'action_available',
      statusLabel: 'Action Available',
      actionLabel: tracks.length === 0 ? 'Add First Track' : 'Configure Tracks',
      actionHref: '/app/onboarding/curriculum',
      capability: 'manage_curriculum',
    },
    {
      id: 'teachers',
      title: 'Teachers',
      description: `Invite teachers by email or upload a teacher list (${invitations.filter((item) => item.role === 'teacher' && item.status === 'pending').length} pending invitation${invitations.filter((item) => item.role === 'teacher' && item.status === 'pending').length === 1 ? '' : 's'}).`,
      backendFact: 'Organization invitations dispatched or memberships active',
      endpoint: 'POST /api/organizations/{organization_pk}/invitations/',
      allowedRoles: ['owner', 'admin'],
      status: 'action_available',
      statusLabel: 'Action Available',
      actionLabel: 'Invite Teachers',
      actionHref: '/app/teachers/add',
      capability: 'manage_invitations',
    },
    {
      id: 'students',
      title: 'Students',
      description: `Enroll students into the academy (${students.length} student${students.length === 1 ? '' : 's'} enrolled).`,
      backendFact: 'Student enrollment records created in organization',
      endpoint: 'GET /api/academic/students/?organization={id}',
      allowedRoles: ['owner', 'admin'],
      status: 'action_available',
      statusLabel: 'Action Available',
      actionLabel: 'Add Students',
      actionHref: '/app/students/add',
      capability: 'manage_students',
    },
    {
      id: 'class_configuration',
      title: 'Class Configuration',
      description: 'Set up class durations, schedules, and routing preferences.',
      backendFact: 'OPEN / NOT YET CONTRACTED',
      endpoint: null,
      allowedRoles: ['owner', 'admin'],
      status: 'uncontracted',
      statusLabel: 'Not available in the current academy setup',
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Configure automated emails and notification delivery preferences.',
      backendFact: 'OPEN / NOT YET CONTRACTED',
      endpoint: null,
      allowedRoles: ['owner', 'admin'],
      status: 'uncontracted',
      statusLabel: 'Not available in the current academy setup',
    },
    {
      id: 'ready',
      title: 'Ready',
      description: 'Final academy readiness assessment and operational verification.',
      backendFact: 'OPEN / NOT YET CONTRACTED',
      endpoint: null,
      allowedRoles: ['owner', 'admin'],
      status: 'uncontracted',
      statusLabel: 'Not available in the current academy setup',
    },
  ];

  const selectedStep = steps.find((s) => s.id === selectedStepId) || steps[1];
  const canPerformAction = selectedStep.capability
    ? can(selectedStep.capability, { activeRole })
    : true;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Academy Setup"
        description={`Welcome to ${activeAcademy.name}. Explicit onboarding steps backed by backend facts.`}
      />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-4 md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Setup Checklist</CardTitle>
              <CardDescription>
                Tracked against verified backend capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <nav aria-label="Progress" className="space-y-3">
                {steps.map((step) => {
                  const isSelected = step.id === selectedStep.id;
                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setSelectedStepId(step.id)}
                      className={`flex w-full items-start rounded-lg p-2 text-left transition-colors ${
                        isSelected
                          ? 'bg-muted font-medium'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex h-5 items-center">
                        {step.status === 'configured' ? (
                          <CheckCircle2 className="text-primary h-5 w-5" aria-hidden="true" />
                        ) : step.status === 'action_available' ? (
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
                            isSelected
                              ? 'text-primary'
                              : step.status === 'configured'
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                          }`}
                        >
                          {step.title}
                        </span>
                        {step.status === 'uncontracted' ? (
                          <span className="block text-xs text-muted-foreground">
                            Not yet configured
                          </span>
                        ) : (
                          <span className="block text-xs text-muted-foreground">
                            {step.statusLabel}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedStep.title}</CardTitle>
                  <CardDescription>{selectedStep.description}</CardDescription>
                </div>
                <Badge
                  variant={
                    selectedStep.status === 'configured'
                      ? 'default'
                      : selectedStep.status === 'action_available'
                        ? 'secondary'
                        : 'outline'
                  }
                >
                  {selectedStep.statusLabel}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border bg-muted/40 p-4 space-y-2 text-sm">
                <div>
                  <span className="font-semibold">Backend Fact: </span>
                  <span className="text-muted-foreground">{selectedStep.backendFact}</span>
                </div>
                <div>
                  <span className="font-semibold">Endpoint: </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {selectedStep.endpoint || 'None (Uncontracted)'}
                  </span>
                </div>
                <div>
                  <span className="font-semibold">Authorized Roles: </span>
                  <span className="text-muted-foreground">
                    {selectedStep.allowedRoles.join(', ')}
                  </span>
                </div>
              </div>

              {selectedStep.status === 'uncontracted' ? (
                <div className="rounded-lg border border-dashed p-6 text-center space-y-2">
                  <Info className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="font-medium text-muted-foreground">
                    Not available in the current academy setup
                  </p>
                  <p className="text-xs text-muted-foreground">
                    This step is OPEN / NOT YET CONTRACTED on the backend API. No false readiness is inferred.
                  </p>
                </div>
              ) : selectedStep.actionLabel && selectedStep.actionHref ? (
                <div className="flex flex-col items-center justify-center space-y-4 py-4 text-center">
                  {!canPerformAction ? (
                    <div className="flex items-center gap-2 text-sm font-medium text-amber-600">
                      <AlertCircle className="h-4 w-4" />
                      Owner or admin permissions required.
                    </div>
                  ) : (
                    <Button
                      onClick={() => router.push(selectedStep.actionHref!)}
                      className="gap-2"
                    >
                      {selectedStep.actionLabel}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border p-4 text-sm text-green-700 bg-green-50 dark:bg-green-950/20 dark:text-green-400">
                  Step is verified and active for {activeAcademy.name}.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
