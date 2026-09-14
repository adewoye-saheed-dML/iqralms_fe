'use client';

import * as React from 'react';
import { useAcademy } from '@/lib/academy/academy-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AssessmentList } from './assessment-list';
import { ReviewQueue } from './review-queue';

export function AssessmentDashboard() {
  const { activeRole } = useAcademy();

  const isStudentOrParent = activeRole && ['student', 'parent'].includes(activeRole);
  const isTeacher = activeRole && ['teacher', 'sub', 'lead'].includes(activeRole);
  const isLeadOrAdmin = activeRole && ['lead', 'admin', 'owner'].includes(activeRole);

  const defaultTab = isStudentOrParent ? 'my-assessments' : (isLeadOrAdmin ? 'review-queue' : 'my-submissions');

  return (
    <div className="space-y-4">
      <Tabs defaultValue={defaultTab}>
        <TabsList>
          {isStudentOrParent && <TabsTrigger value="my-assessments">My Assessments</TabsTrigger>}
          {isTeacher && <TabsTrigger value="my-submissions">My Submissions</TabsTrigger>}
          {isLeadOrAdmin && <TabsTrigger value="review-queue">Review Queue</TabsTrigger>}
        </TabsList>

        {isStudentOrParent && (
          <TabsContent value="my-assessments" className="pt-4">
            <AssessmentList type="family" />
          </TabsContent>
        )}
        
        {isTeacher && (
          <TabsContent value="my-submissions" className="pt-4">
            <AssessmentList type="teacher" />
          </TabsContent>
        )}

        {isLeadOrAdmin && (
          <TabsContent value="review-queue" className="pt-4">
            <ReviewQueue />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
