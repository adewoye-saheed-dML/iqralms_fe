'use client';

import * as React from 'react';
import { useAcademy } from '@/lib/academy/academy-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AssessmentList } from './assessment-list';
import { ReviewQueue } from './review-queue';
import { RubricsList } from './rubrics-list';
import { TeacherReportsList } from './teacher-reports-list';

import { useAuth } from '@/lib/auth/auth-provider';

import { can } from '@/lib/permissions/capabilities';

export function AssessmentDashboard() {
  const { activeRole } = useAcademy();
  const { user } = useAuth();

  const isStudentOrParent = can('view_own_assessments', { userRole: user?.role, activeRole });
  const isTeacher =
    activeRole === 'teacher' ||
    user?.role === 'lead' ||
    user?.role === 'sub';
  const isLeadOrAdmin = can('review_assessments', { activeRole, userRole: user?.role });

  const defaultTab = isStudentOrParent
    ? 'my-assessments'
    : isLeadOrAdmin
    ? 'review-queue'
    : 'my-submissions';

  return (
    <div className="space-y-4">
      <Tabs defaultValue={defaultTab}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          {isLeadOrAdmin && <TabsTrigger value="review-queue">Review Queue</TabsTrigger>}
          {isLeadOrAdmin && <TabsTrigger value="rubrics">Rubrics & Criteria</TabsTrigger>}
          {isLeadOrAdmin && (
            <TabsTrigger value="teacher-reports">Teacher Reports</TabsTrigger>
          )}
          {isTeacher && <TabsTrigger value="my-submissions">My Submissions</TabsTrigger>}
          {isStudentOrParent && (
            <TabsTrigger value="my-assessments">My Assessments</TabsTrigger>
          )}
        </TabsList>

        {isLeadOrAdmin && (
          <TabsContent value="review-queue" className="pt-4">
            <ReviewQueue />
          </TabsContent>
        )}

        {isLeadOrAdmin && (
          <TabsContent value="rubrics" className="pt-4">
            <RubricsList />
          </TabsContent>
        )}

        {isLeadOrAdmin && (
          <TabsContent value="teacher-reports" className="pt-4">
            <TeacherReportsList />
          </TabsContent>
        )}

        {isTeacher && (
          <TabsContent value="my-submissions" className="pt-4">
            <AssessmentList type="teacher" />
          </TabsContent>
        )}

        {isStudentOrParent && (
          <TabsContent value="my-assessments" className="pt-4">
            <AssessmentList type="family" />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
