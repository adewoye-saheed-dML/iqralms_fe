'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { teachersApi, TeacherConfigurationUpdate } from '../api/teachers';
import { teacherKeys } from '@/lib/api/query-keys';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { AlertCircle, ArrowLeft, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';
import { can } from '@/lib/permissions/capabilities';
import { Input } from '@/components/ui/input';

interface TeacherDetailProps {
  membershipId: number;
}

export function TeacherDetail({ membershipId }: TeacherDetailProps) {
  const queryClient = useQueryClient();
  const { activeAcademy, activeRole } = useAcademy();

  const {
    data: teachers,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: teacherKeys.all(activeAcademy?.id),
    queryFn: () => teachersApi.getTeacherConfigurations(activeAcademy!.id),
    enabled: !!activeAcademy,
  });

  const config = teachers?.find((t) => t.membership === membershipId);

  const updateMutation = useMutation({
    mutationFn: (data: TeacherConfigurationUpdate) => {
      if (!activeAcademy || !config) throw new Error('No context');
      return teachersApi.updateTeacherConfiguration(activeAcademy.id, config.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teacherKeys.all(activeAcademy?.id) });
    },
  });

  if (!activeAcademy) return null;

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (isError || !config) {
    return <ErrorState title="Teacher Not Found" message={error?.message || 'Configuration not found for this member.'} />;
  }

  const canManage = can('manage_teachers', { activeRole });
  const canManageFinance = can('manage_finance', { activeRole });

  const handleApprove = () => {
    if (confirm('Approve this teacher to teach at the academy?')) {
      updateMutation.mutate({ approved: true });
    }
  };

  const handleRevoke = () => {
    if (confirm('Revoke teaching privileges for this teacher?')) {
      updateMutation.mutate({ approved: false });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/app/teachers?tab=teachers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">{config.username} (Teacher)</h1>
      </div>

      {updateMutation.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Update failed</AlertTitle>
          <AlertDescription>
            {updateMutation.error instanceof Error
              ? updateMutation.error.message
              : 'Unknown error occurred'}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Activation Status</CardTitle>
            <CardDescription>Academy-level teaching approval.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {config.approved ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-green-700 dark:text-green-400">Approved & Active</span>
                  </>
                ) : (
                  <>
                    <Clock className="h-5 w-5 text-amber-500" />
                    <span className="font-medium text-amber-700 dark:text-amber-400">Pending Activation</span>
                  </>
                )}
              </div>
              {canManage && (
                <div>
                  {config.approved ? (
                    <Button variant="destructive" size="sm" onClick={handleRevoke} disabled={updateMutation.isPending}>
                      Revoke Approval
                    </Button>
                  ) : (
                    <Button variant="default" size="sm" onClick={handleApprove} disabled={updateMutation.isPending}>
                      Approve Teacher
                    </Button>
                  )}
                </div>
              )}
            </div>
            {!config.approved && (
              <p className="text-sm text-muted-foreground">
                This teacher cannot be assigned to tracks or sessions until they are approved by the academy.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Teaching Capacity</CardTitle>
            <CardDescription>Availability and limits.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-muted-foreground text-sm font-medium">Max Weekly Hours</div>
              {canManage ? (
                <div className="flex items-center space-x-2 mt-1">
                  <Input 
                    type="number" 
                    defaultValue={config.max_weekly_hours} 
                    className="w-24"
                    onBlur={(e) => {
                      const val = parseInt(e.target.value);
                      if (val !== config.max_weekly_hours && !isNaN(val)) {
                        updateMutation.mutate({ max_weekly_hours: val });
                      }
                    }}
                    disabled={updateMutation.isPending}
                  />
                  <span className="text-sm">hours/week</span>
                </div>
              ) : (
                <div className="mt-1">{config.max_weekly_hours} hours/week</div>
              )}
            </div>
          </CardContent>
        </Card>

        {canManageFinance && (
          <Card>
            <CardHeader>
              <CardTitle>Financials</CardTitle>
              <CardDescription>Payout configuration for this teacher.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-muted-foreground text-sm font-medium">Hourly Payout Rate</div>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm font-medium">$</span>
                  <Input 
                    type="number" 
                    step="0.01"
                    defaultValue={config.hourly_payout_rate || ''} 
                    className="w-32"
                    placeholder="e.g. 15.00"
                    onBlur={(e) => {
                      const val = e.target.value;
                      if (val !== (config.hourly_payout_rate || '')) {
                        updateMutation.mutate({ hourly_payout_rate: val || null });
                      }
                    }}
                    disabled={updateMutation.isPending}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Assigned Tracks</CardTitle>
            <CardDescription>Subjects this teacher is allowed to teach.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Track assignment workflow goes here.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
