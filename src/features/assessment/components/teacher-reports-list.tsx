'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { assessmentApi, TeacherReport } from '../api/assessment';
import { useAcademy } from '@/lib/academy/academy-provider';
import { LoadingState } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, AlertTriangle, Clock } from 'lucide-react';
import { ApiError } from '@/lib/api/errors';

export function TeacherReportsList() {
  const { activeAcademy } = useAcademy();

  const {
    data: reports = [],
    isLoading,
    error,
    refetch,
  } = useQuery<TeacherReport[]>({
    queryKey: ['assessment', activeAcademy?.id, 'reports', 'teachers'],
    queryFn: () => {
      if (!activeAcademy?.id) throw new Error('No active academy');
      return assessmentApi.getTeacherReports(activeAcademy.id);
    },
    enabled: !!activeAcademy?.id,
  });

  if (isLoading) return <LoadingState />;

  if (error) {
    if (error instanceof ApiError && error.status === 403) {
      return (
        <ErrorState
          title="Access Denied"
          message="You don't have permission to view teacher assessment quality reports."
        />
      );
    }
    return (
      <ErrorState
        title="Failed to load teacher reports"
        message={error.message || 'An error occurred'}
        onRetry={() => refetch()}
      />
    );
  }

  if (reports.length === 0) {
    return (
      <EmptyState
        title="No teacher reports available"
        description="No teachers have recorded assessments in the current period."
        icon={<BarChart3 className="h-10 w-10 text-muted-foreground" />}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => {
          const teacherName =
            typeof report.teacher === 'object'
              ? `${(report.teacher as { first_name?: string; last_name?: string }).first_name || ''} ${(report.teacher as { first_name?: string; last_name?: string }).last_name || ''}`.trim() ||
                (report.teacher as { username?: string }).username ||
                'Teacher'
              : String(report.teacher);

          return (
            <Card key={report.teacher.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base font-semibold">{teacherName}</CardTitle>
                  <Badge variant="outline">{report.assessed_sessions} Assessed</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Overall Average:</span>
                  <span className="font-semibold">
                    {report.overall_average ? `${report.overall_average}/5` : 'N/A'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Flagged:
                  </span>
                  <span className="font-medium">{report.flagged}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-blue-500" /> Awaiting Review:
                  </span>
                  <span className="font-medium">{report.awaiting_lead_review}</span>
                </div>

                {report.by_track && report.by_track.length > 0 && (
                  <div className="pt-2 border-t mt-2">
                    <span className="text-xs text-muted-foreground font-medium block mb-1">
                      By Track:
                    </span>
                    <div className="space-y-1">
                      {report.by_track.map((tReport) => (
                        <div key={tReport.track.id} className="flex justify-between text-xs">
                          <span>{tReport.track.name}:</span>
                          <span>
                            {tReport.overall_average ? `${tReport.overall_average}/5` : 'N/A'} ({tReport.assessed_sessions} sessions)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
