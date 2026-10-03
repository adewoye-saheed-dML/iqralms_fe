'use client';

import * as React from 'react';
import { useAcademy } from '@/lib/academy/academy-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/ui/page-header';
import { AssessmentList } from './assessment-list';
import { ReviewQueue } from './review-queue';
import { RubricsList } from './rubrics-list';
import { AssignmentsListView } from './assignments-list-view';
import { TeacherGradingQueue } from './teacher-grading-queue';
import { ParentWardAssessmentView } from './parent-ward-assessment-view';
import { OwnerAssessmentOversight } from './owner-assessment-oversight';
import { StudentPersonalLearningSpace } from './student-personal-learning-space';
import { useAuth } from '@/lib/auth/auth-provider';
import { can } from '@/lib/permissions/capabilities';
import { resolveRoleExperience } from '@/lib/navigation/config';
import { BookOpen, CheckSquare, ClipboardCheck, FileCheck, GraduationCap, Layers, ListChecks, Users } from 'lucide-react';

export function AssessmentDashboard() {
  const { activeRole } = useAcademy();
  const { user } = useAuth();

  const roleExp = resolveRoleExperience({ activeRole, userRole: user?.role });
  const isLeadOrAdmin =
    roleExp === 'owner_admin' ||
    activeRole === 'owner' ||
    activeRole === 'admin' ||
    can('review_assessments', { activeRole, userRole: user?.role });

  const isTeacher =
    !isLeadOrAdmin &&
    (roleExp === 'teacher' ||
      roleExp === 'lead_teacher' ||
      activeRole === 'teacher' ||
      user?.role === 'lead' ||
      user?.role === 'sub');

  const isParent =
    !isLeadOrAdmin &&
    !isTeacher &&
    (roleExp === 'parent' || activeRole === 'parent' || user?.role === 'parent');

  const isStudent =
    !isLeadOrAdmin &&
    !isTeacher &&
    !isParent &&
    (roleExp === 'student' || activeRole === 'student' || user?.role === 'student');

  const [selectedAssignmentIdForGrading, setSelectedAssignmentIdForGrading] =
    React.useState<number | undefined>(undefined);
  const [activeTab, setActiveTab] = React.useState<string>(
    isParent
      ? 'ward-progress'
      : isStudent
      ? 'my-learning-space'
      : isLeadOrAdmin
      ? 'academy-oversight'
      : 'assignments'
  );

  // Sync active tab whenever the active role changes across tenants
  React.useEffect(() => {
    setActiveTab(
      isParent
        ? 'ward-progress'
        : isStudent
        ? 'my-learning-space'
        : isLeadOrAdmin
        ? 'academy-oversight'
        : 'assignments'
    );
  }, [activeRole, isParent, isStudent, isLeadOrAdmin]);

  const handleSelectAssignmentForGrading = (assignmentId: number) => {
    setSelectedAssignmentIdForGrading(assignmentId);
    setActiveTab('grading-queue');
  };

  const pageTitle = isLeadOrAdmin
    ? 'Assessments & Oversight'
    : isTeacher
    ? 'Assessments & Grading'
    : isStudent
    ? 'Personal Learning Space & Assessments'
    : "Children's Evaluations & Homework";

  const pageDescription = isLeadOrAdmin
    ? 'Monitor homework assignments, grading queues, and recitation evaluations across the academy.'
    : isTeacher
    ? 'Assign homework, evaluate student recitations, and grade submissions for your attached students.'
    : isStudent
    ? 'Your confidential personal learning space: all recitation evaluations, continuous homework feedback, and session records joined in one place.'
    : "Review your children's homework submissions, recitation grades, and teacher remarks.";

  return (
    <div className="space-y-6">
      <PageHeader title={pageTitle} description={pageDescription} />
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
            <TabsTrigger value="my-learning-space" className="flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4" />
              Personal Learning Space
            </TabsTrigger>
          )}
          {isStudent && (
            <TabsTrigger value="my-homework" className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              Assignments &amp; Tasks
            </TabsTrigger>
          )}
          {isStudent && (
            <TabsTrigger value="my-session-assessments" className="flex items-center gap-1.5">
              <FileCheck className="h-4 w-4" />
              Session Evaluations
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
            <TabsContent value="my-learning-space" className="pt-4">
              <StudentPersonalLearningSpace />
            </TabsContent>
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
