'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { useAuth } from '@/lib/auth/auth-provider';
import {
  assessmentApi,
  StudentAssignment,
  SubmissionType,
  resolveAssessmentMediaUrl,
  getDisplayName,
  SUBMISSION_TYPE_LABELS,
} from '../api/assessment';
import { assessmentKeys } from '@/lib/api/query-keys';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertCircle,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Mic,
  Paperclip,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import { CreateAssignmentModal } from './create-assignment-modal';
import { AssignmentSubmissionModal } from './assignment-submission-modal';

interface AssignmentsListViewProps {
  onSelectAssignmentForGrading?: (assignmentId: number) => void;
}

export function AssignmentsListView({ onSelectAssignmentForGrading }: AssignmentsListViewProps) {
  const { activeAcademy, activeRole } = useAcademy();
  const academyId = activeAcademy?.id;
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isTeacher =
    activeRole === 'teacher' ||
    user?.role === 'lead' ||
    user?.role === 'sub' ||
    activeRole === 'owner' ||
    activeRole === 'admin';

  const isStudent = user?.role === 'student';

  const [typeFilter, setTypeFilter] = React.useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [selectedAssignmentForSubmission, setSelectedAssignmentForSubmission] =
    React.useState<StudentAssignment | null>(null);

  // Fetch Assignments
  const { data: assignments = [], isLoading } = useQuery({
    queryKey: assessmentKeys.assignments(academyId, {
      submission_type: typeFilter !== 'all' ? (typeFilter as SubmissionType) : undefined,
    }),
    queryFn: () =>
      academyId
        ? assessmentApi.getAssignments(academyId, {
            submission_type: typeFilter !== 'all' ? (typeFilter as SubmissionType) : undefined,
          })
        : [],
    enabled: !!academyId,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!academyId) throw new Error('Academy required');
      return assessmentApi.deleteAssignment(academyId, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.all(academyId) });
    },
  });

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this assignment?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Bar & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Format Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Formats</SelectItem>
              <SelectItem value="recitation">Quran Recitation</SelectItem>
              <SelectItem value="written">Written Task</SelectItem>
              <SelectItem value="file">File / Worksheet</SelectItem>
              <SelectItem value="mixed">Mixed Format</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isTeacher && (
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Assignment
          </Button>
        )}
      </div>

      {/* Assignments List */}
      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground">Loading assignments...</div>
      ) : assignments.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground space-y-2">
          <BookOpen className="h-10 w-10 mx-auto opacity-40" />
          <p className="font-medium">No assignments found.</p>
          <p className="text-xs">
            {isTeacher
              ? 'Click "Create Assignment" to assign recitation practice or homework.'
              : 'Assignments will appear here when your teacher publishes them.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {assignments.map((assignment) => {
            const mySubmission = assignment.my_submission;
            const isGraded = mySubmission?.status === 'graded';
            const isSubmitted = mySubmission?.status === 'submitted';
            const needsRevision = mySubmission?.status === 'needs_revision';

            return (
              <Card key={assignment.id} className="p-4 space-y-3 hover:border-primary/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-base">{assignment.title}</h4>
                      <Badge variant="outline" className="text-xs capitalize">
                        {assignment.submission_type === 'recitation' && (
                          <Mic className="h-3 w-3 mr-1 text-emerald-600 inline" />
                        )}
                        {assignment.submission_type === 'written' && (
                          <FileText className="h-3 w-3 mr-1 text-blue-600 inline" />
                        )}
                        {assignment.submission_type === 'file' && (
                          <Paperclip className="h-3 w-3 mr-1 text-amber-600 inline" />
                        )}
                        {assignment.submission_type}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>Teacher: {assignment.created_by_name}</span>
                      {assignment.assigned_student_name && (
                        <span>Student: {assignment.assigned_student_name}</span>
                      )}
                      {assignment.due_date && (
                        <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                      )}
                      <span>Max: {assignment.max_score} pts</span>
                    </div>
                  </div>

                  {/* Actions according to role */}
                  <div className="flex items-center gap-2">
                    {isTeacher && (
                      <>
                        {onSelectAssignmentForGrading && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onSelectAssignmentForGrading(assignment.id)}
                            className="flex items-center gap-1.5"
                          >
                            <Users className="h-3.5 w-3.5" />
                            Submissions ({assignment.submissions_count})
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(assignment.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}

                    {isStudent && (
                      <div className="flex items-center gap-2">
                        {isGraded ? (
                          <Badge className="bg-emerald-600 text-white">
                            Graded: {mySubmission?.score} / {assignment.max_score}
                          </Badge>
                        ) : isSubmitted ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            Submitted
                          </Badge>
                        ) : needsRevision ? (
                          <Badge variant="destructive">Revision Needed</Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}

                        <Button
                          size="sm"
                          variant={isGraded || isSubmitted ? 'outline' : 'default'}
                          onClick={() => setSelectedAssignmentForSubmission(assignment)}
                        >
                          {isGraded || isSubmitted ? 'View Submission' : 'Submit Homework'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {assignment.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {assignment.description}
                  </p>
                )}

                {(assignment.surah_number || assignment.ayah_start) && (
                  <div className="text-xs bg-muted/30 p-2 rounded flex items-center gap-2 text-foreground/80">
                    <span className="font-semibold text-primary">Recitation Practice:</span>
                    {assignment.surah_number && <span>Surah #{assignment.surah_number}</span>}
                    {(assignment.ayah_start || assignment.ayah_end) && (
                      <span>
                        Ayat {assignment.ayah_start || 1} - {assignment.ayah_end || 'End'}
                      </span>
                    )}
                    {assignment.reference_notes && (
                      <span className="text-muted-foreground italic">
                        &ldquo;{assignment.reference_notes}&rdquo;
                      </span>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <CreateAssignmentModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      <AssignmentSubmissionModal
        open={!!selectedAssignmentForSubmission}
        onOpenChange={(open) => {
          if (!open) setSelectedAssignmentForSubmission(null);
        }}
        assignment={selectedAssignmentForSubmission}
      />
    </div>
  );
}
