'use client';

import { assessmentKeys } from '@/lib/api/query-keys';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { assessmentApi } from '../api/assessment';
import { useAcademy } from '@/lib/academy/academy-provider';
import { LoadingState } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckSquare } from 'lucide-react';
import { ApiError } from '@/lib/api/errors';

import type { FamilyAssessment, TeacherAssessment } from '../api/assessment';

interface AssessmentListProps {
  type: 'family' | 'teacher';
  studentId?: number;
}

import { getDisplayName } from '../api/assessment';

type AnyAssessment = (FamilyAssessment | TeacherAssessment) & {
  lead_reviewed?: boolean;
  overall_score?: string;
  student?: any;
};

export function AssessmentList({ type, studentId }: AssessmentListProps) {
  const { activeAcademy } = useAcademy();

  const queryKey = assessmentKeys.list(activeAcademy?.id, studentId ? `${type}-${studentId}` : type);

  const { data: assessments, isLoading, error, refetch } = useQuery<AnyAssessment[]>({
    queryKey,
    queryFn: async (): Promise<AnyAssessment[]> => {
      if (!activeAcademy?.id) throw new Error('No active academy');
      if (type === 'family') {
        const data = studentId
          ? await assessmentApi.getChildAssessments(activeAcademy.id, studentId)
          : await assessmentApi.getStudentAssessments(activeAcademy.id);
        return data as AnyAssessment[];
      }
      const data = await assessmentApi.getTeacherAssessments(activeAcademy.id);
      return data as AnyAssessment[];
    },
    enabled: !!activeAcademy?.id,
  });

  if (isLoading) return <LoadingState />;
  
  if (error) {
    if (error instanceof ApiError && error.status === 403) {
      return <ErrorState title="Access Denied" message="You don't have permission to view these assessments." />;
    }
    return <ErrorState title="Failed to load assessments" message={error.message} onRetry={() => refetch()} />;
  }

  if (!assessments || assessments.length === 0) {
    return (
      <EmptyState
        title="No assessments"
        description="There are no assessments to display here."
        icon={<CheckSquare className="h-10 w-10 text-muted-foreground" />}
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {assessments.map((assessment) => {
        const isReviewed = assessment.lead_reviewed || ('lead_reviewed_at' in assessment && !!assessment.lead_reviewed_at);
        const score = assessment.overall_score || assessment.overall_average;
        const studentDisplayName = assessment.student ? getDisplayName(assessment.student) : null;
        const levelName = assessment.booking?.level?.name;

        return (
          <Card key={assessment.id} className="hover:border-primary/40 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">
                    {studentDisplayName || levelName || `Assessment #${assessment.id}`}
                  </CardTitle>
                  {assessment.track && (
                    <Badge variant="outline" className="text-[11px] mt-1">
                      {assessment.track}
                    </Badge>
                  )}
                </div>
                {isReviewed && (
                  <Badge variant="secondary">Reviewed</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {score && (
                <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  Score: {score} / 10
                </div>
              )}
              {assessment.booking?.start_time_utc && (
                <div className="text-xs text-muted-foreground">
                  Session: {new Date(assessment.booking.start_time_utc).toLocaleDateString()}
                </div>
              )}
              {assessment.teacher_summary && (
                <p className="italic text-xs bg-muted/30 p-2 rounded text-muted-foreground">&ldquo;{assessment.teacher_summary}&rdquo;</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
