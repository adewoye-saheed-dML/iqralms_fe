'use client';

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

interface AssessmentListProps {
  type: 'family' | 'teacher';
}

export function AssessmentList({ type }: AssessmentListProps) {
  const { activeAcademy } = useAcademy();

  const queryKey = ['academy', activeAcademy?.id, 'assessment', type];

  const { data: assessments, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => {
      if (!activeAcademy?.id) throw new Error('No active academy');
      return type === 'family'
        ? assessmentApi.getMyAssessments(activeAcademy.id)
        : assessmentApi.getTeacherAssessments(activeAcademy.id);
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
      {assessments.map((assessment: any) => (
        <Card key={assessment.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">Assessment #{assessment.id}</CardTitle>
              {assessment.lead_reviewed && (
                <Badge variant="secondary">Reviewed</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="text-muted-foreground">
              Score: {assessment.overall_score}
            </div>
            {assessment.teacher_summary && (
              <p className="italic">"{assessment.teacher_summary}"</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
