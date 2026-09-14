'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assessmentApi } from '../api/assessment';
import { useAcademy } from '@/lib/academy/academy-provider';
import { LoadingState } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckSquare } from 'lucide-react';
import { ApiError } from '@/lib/api/errors';

export function ReviewQueue() {
  const { activeAcademy } = useAcademy();
  const queryClient = useQueryClient();

  const queryKey = ['academy', activeAcademy?.id, 'assessment', 'review-queue'];

  const { data: assessments, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => {
      if (!activeAcademy?.id) throw new Error('No active academy');
      return assessmentApi.getReviewQueue(activeAcademy.id);
    },
    enabled: !!activeAcademy?.id,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, notes }: { id: number, notes: string }) => {
      if (!activeAcademy?.id) throw new Error('No active academy');
      return assessmentApi.reviewAssessment(activeAcademy.id, id, { lead_review_note: notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  if (isLoading) return <LoadingState />;
  
  if (error) {
    if (error instanceof ApiError && error.status === 403) {
      return <ErrorState title="Access Denied" message="You don't have permission to view the review queue." />;
    }
    return <ErrorState title="Failed to load queue" message={error.message} onRetry={() => refetch()} />;
  }

  if (!assessments || assessments.length === 0) {
    return (
      <EmptyState
        title="Queue Empty"
        description="There are no assessments pending review."
        icon={<CheckSquare className="h-10 w-10 text-muted-foreground" />}
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {assessments.map((assessment) => (
        <Card key={assessment.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">Review #{assessment.id}</CardTitle>
              {assessment.flagged_for_review && (
                <Badge variant="destructive">Flagged</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="text-muted-foreground">
              Score: {assessment.overall_score}
            </div>
            <p className="italic">"{assessment.teacher_summary}"quot;{assessment.teacher_summary}"{assessment.teacher_summary}"quot;</p>
            <div className="pt-2">
              <Button 
                size="sm" 
                className="w-full"
                disabled={reviewMutation.isPending}
                onClick={() => reviewMutation.mutate({ id: assessment.id, notes: 'Reviewed by lead' })}
              >
                Mark Reviewed
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
