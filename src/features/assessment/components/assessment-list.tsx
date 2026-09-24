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

type AnyAssessment = (FamilyAssessment | TeacherAssessment) & {
  lead_reviewed?: boolean;
  overall_score?: string;
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
        return (
          <Card key={assessment.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">Assessment #{assessment.id}</CardTitle>
                {isReviewed && (
                  <Badge variant="secondary">Reviewed</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {score && (
                <div className="text-muted-foreground">
                  Score: {score}
                </div>
              )}
              {assessment.teacher_summary && (
                <p className="italic">&ldquo;{assessment.teacher_summary}&rdquo;</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
