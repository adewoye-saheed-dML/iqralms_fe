'use client';

import * as React from 'react';
import { useAcademy } from '@/lib/academy/academy-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AssessmentList } from './assessment-list';
import { ReviewQueue } from './review-queue';
import { RubricsList } from './rubrics-list';
import { AssignmentsListView } from './assignments-list-view';
import { TeacherGradingQueue } from './teacher-grading-queue';
import { ParentWardAssessmentView } from './parent-ward-assessment-view';
import { OwnerAssessmentOversight } from './owner-assessment-oversight';
import { useAuth } from '@/lib/auth/auth-provider';
import { can } from '@/lib/permissions/capabilities';
import { BookOpen, CheckSquare, ClipboardCheck, FileCheck, Layers, ListChecks, Users } from 'lucide-react';

export function AssessmentDashboard() {
  const { activeRole } = useAcademy();
  const { user } = useAuth();

  const isParent = user?.role === 'parent';
  const isStudent = user?.role === 'student';
  const isTeacher =
    activeRole === 'teacher' ||
    user?.role === 'lead' ||
    user?.role === 'sub';
  const isLeadOrAdmin =
    activeRole === 'owner' ||
    activeRole === 'admin' ||
    can('review_assessments', { activeRole, userRole: user?.role });

  const [selectedAssignmentIdForGrading, setSelectedAssignmentIdForGrading] =
    React.useState<number | undefined>(undefined);
  const [activeTab, setActiveTab] = React.useState<string>(
    isParent
      ? 'ward-progress'
      : isStudent
      ? 'my-homework'
      : isLeadOrAdmin
      ? 'academy-oversight'
      : 'assignments'
  );

  const handleSelectAssignmentForGrading = (assignmentId: number) => {
    setSelectedAssignmentIdForGrading(assignmentId);
    setActiveTab('grading-queue');
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          {/* Owner / Admin Tabs */}
          {isLeadOrAdmin && (
            <TabsTrigger value="academy-oversight" className="flex items-center gap-1.5">
              <ClipboardCheck className="h-4 w-4" />
              Academy Oversight
            </TabsTrigger>
          )}
          {isLeadOrAdmin && (
            <TabsTrigger value="assignments-manager" className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              Assignments Manager
            </TabsTrigger>
          )}
          {isLeadOrAdmin && (
            <TabsTrigger value="review-queue" className="flex items-center gap-1.5">
              <ListChecks className="h-4 w-4" />
              Review Queue
            </TabsTrigger>
          )}
          {isLeadOrAdmin && (
            <TabsTrigger value="rubrics" className="flex items-center gap-1.5">
              <Layers className="h-4 w-4" />
              Rubrics & Criteria
            </TabsTrigger>
          )}

          {/* Teacher Specific Tabs */}
          {!isLeadOrAdmin && isTeacher && (
            <TabsTrigger value="assignments" className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              Assignments & Tasks
            </TabsTrigger>
          )}
          {!isLeadOrAdmin && isTeacher && (
            <TabsTrigger value="grading-queue" className="flex items-center gap-1.5">
              <CheckSquare className="h-4 w-4" />
              Grading Queue
            </TabsTrigger>
          )}
          {!isLeadOrAdmin && isTeacher && (
            <TabsTrigger value="my-submissions" className="flex items-center gap-1.5">
              <ClipboardCheck className="h-4 w-4" />
              Session Assessments
            </TabsTrigger>
          )}

          {/* Student Specific Tabs */}
          {isStudent && (
            <TabsTrigger value="my-homework" className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              Assignments & Homework
            </TabsTrigger>
          )}
          {isStudent && (
            <TabsTrigger value="my-session-assessments" className="flex items-center gap-1.5">
              <FileCheck className="h-4 w-4" />
              Session Assessments
            </TabsTrigger>
          )}

          {/* Parent Specific Tabs */}
          {isParent && (
            <TabsTrigger value="ward-progress" className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              Ward Homework & Submissions
            </TabsTrigger>
          )}
          {isParent && (
            <TabsTrigger value="child-session-assessments" className="flex items-center gap-1.5">
              <FileCheck className="h-4 w-4" />
              Child Session Assessments
            </TabsTrigger>
          )}
        </TabsList>

        {/* Owner / Admin Content */}
        {isLeadOrAdmin && (
          <>
            <TabsContent value="academy-oversight" className="pt-4">
              <OwnerAssessmentOversight />
            </TabsContent>
            <TabsContent value="assignments-manager" className="pt-4">
              <AssignmentsListView
                onSelectAssignmentForGrading={(id) => {
                  setSelectedAssignmentIdForGrading(id);
                  setActiveTab('academy-oversight');
                }}
              />
            </TabsContent>
            <TabsContent value="review-queue" className="pt-4">
              <ReviewQueue />
            </TabsContent>
            <TabsContent value="rubrics" className="pt-4">
              <RubricsList />
            </TabsContent>
          </>
        )}

        {/* Teacher Content */}
        {!isLeadOrAdmin && isTeacher && (
          <>
            <TabsContent value="assignments" className="pt-4">
              <AssignmentsListView
                onSelectAssignmentForGrading={handleSelectAssignmentForGrading}
              />
            </TabsContent>
            <TabsContent value="grading-queue" className="pt-4">
              <TeacherGradingQueue initialAssignmentId={selectedAssignmentIdForGrading} />
            </TabsContent>
            <TabsContent value="my-submissions" className="pt-4">
              <AssessmentList type="teacher" />
            </TabsContent>
          </>
        )}

        {/* Student Content */}
        {isStudent && (
          <>
            <TabsContent value="my-homework" className="pt-4">
              <AssignmentsListView />
            </TabsContent>
            <TabsContent value="my-session-assessments" className="pt-4">
              <AssessmentList type="family" />
            </TabsContent>
          </>
        )}

        {/* Parent Content */}
        {isParent && (
          <>
            <TabsContent value="ward-progress" className="pt-4">
              <ParentWardAssessmentView />
            </TabsContent>
            <TabsContent value="child-session-assessments" className="pt-4">
              <AssessmentList type="family" />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
