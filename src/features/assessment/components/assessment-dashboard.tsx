'use client';

import * as React from 'react';
import { useAcademy } from '@/lib/academy/academy-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AssessmentList } from './assessment-list';
import { ReviewQueue } from './review-queue';

import { useAuth } from '@/lib/auth/auth-provider';

import { can } from '@/lib/permissions/capabilities';

export function AssessmentDashboard() {
  const { activeRole } = useAcademy();
  const { user } = useAuth();

  const isStudentOrParent = can('view_own_assessments', { userRole: user?.role, activeRole });
  const isTeacher = can('manage_assessments', { userRole: user?.role, activeRole });
  const isLeadOrAdmin = can('review_assessments', { activeRole, userRole: user?.role });

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
