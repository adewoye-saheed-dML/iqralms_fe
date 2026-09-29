'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import {
  assessmentApi,
  AssignmentSubmission,
  StudentAssignment,
  resolveAssessmentMediaUrl,
} from '../api/assessment';
import { assessmentKeys } from '@/lib/api/query-keys';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Plus,
  Search,
  Users,
  Volume2,
} from 'lucide-react';
import { GradeSubmissionModal } from './grade-submission-modal';
import { CreateAssignmentModal } from './create-assignment-modal';
import { AssignmentsListView } from './assignments-list-view';

export function OwnerAssessmentOversight() {
  const { activeAcademy } = useAcademy();
  const academyId = activeAcademy?.id;

  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = React.useState<AssignmentSubmission | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  // Fetch all assignments for stats
  const { data: assignments = [], isLoading: isLoadingAssignments } = useQuery({
    queryKey: assessmentKeys.assignments(academyId),
    queryFn: () => (academyId ? assessmentApi.getAssignments(academyId) : []),
    enabled: !!academyId,
  });

  // Fetch all submissions for academy
  const { data: submissions = [], isLoading: isLoadingSubmissions } = useQuery({
    queryKey: assessmentKeys.submissions(academyId),
    queryFn: () => (academyId ? assessmentApi.getSubmissions(academyId) : []),
    enabled: !!academyId,
  });

  // Stats calculation
  const totalAssignments = assignments.length;
  const totalSubmissions = submissions.length;
  const pendingGrading = submissions.filter((s) => s.status === 'submitted').length;
  const gradedSubmissions = submissions.filter((s) => s.status === 'graded');
  const averageScore =
    gradedSubmissions.length > 0
      ? (
          gradedSubmissions.reduce((acc, curr) => acc + (curr.score || 0), 0) /
          gradedSubmissions.length
        ).toFixed(1)
      : null;

  // Filtered submissions
  const filteredSubmissions = submissions.filter((s) => {
    const matchesSearch =
      s.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.assignment_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-medium">Academy Assignments</CardDescription>
            <CardTitle className="text-2xl font-bold flex items-center justify-between">
              <span>{totalAssignments}</span>
              <BookOpen className="h-5 w-5 text-muted-foreground opacity-60" />
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-card">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-medium">Total Submissions</CardDescription>
            <CardTitle className="text-2xl font-bold flex items-center justify-between">
              <span>{totalSubmissions}</span>
              <Users className="h-5 w-5 text-blue-500 opacity-60" />
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-card">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-medium">Pending Grading</CardDescription>
            <CardTitle className="text-2xl font-bold flex items-center justify-between text-amber-600">
              <span>{pendingGrading}</span>
              <Clock className="h-5 w-5 opacity-60" />
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-card">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-medium">Average Academy Score</CardDescription>
            <CardTitle className="text-2xl font-bold flex items-center justify-between text-primary">
              <span>{averageScore ? `${averageScore}%` : 'N/A'}</span>
              <Award className="h-5 w-5 opacity-60" />
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Submissions Oversight Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Academy Submissions & Grading Oversight
            </h3>
            <p className="text-xs text-muted-foreground">
              Monitor student submissions across all teachers, listen to recitation audio, and verify grades.
            </p>
          </div>

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Assignment
          </Button>
        </div>

        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by student or assignment..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="submitted">Pending Grading</SelectItem>
              <SelectItem value="graded">Graded</SelectItem>
              <SelectItem value="needs_revision">Needs Revision</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Submissions Table / Grid */}
        {isLoadingSubmissions ? (
          <div className="p-8 text-center text-muted-foreground">Loading academy submissions...</div>
        ) : filteredSubmissions.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground space-y-2">
            <Clock className="h-10 w-10 mx-auto opacity-40" />
            <p className="font-medium">No submissions matching criteria.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredSubmissions.map((sub) => {
              const isGraded = sub.status === 'graded';
              const isSubmitted = sub.status === 'submitted';
              const needsRevision = sub.status === 'needs_revision';

              return (
                <Card key={sub.id} className="p-4 space-y-3 hover:border-primary/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-base">{sub.student_name}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm font-medium text-muted-foreground">
                          {sub.assignment_title}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span>Submitted: {new Date(sub.submitted_at).toLocaleString()}</span>
                        {sub.graded_by_name && <span>Graded by: {sub.graded_by_name}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isGraded ? (
                        <Badge className="bg-emerald-600 text-white">
                          Score: {sub.score} / {sub.assignment_details?.max_score || 100}
                        </Badge>
                      ) : isSubmitted ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Pending Grading
                        </Badge>
                      ) : needsRevision ? (
                        <Badge variant="destructive">Needs Revision</Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedSubmission(sub)}
                        className="flex items-center gap-1.5"
                      >
                        <Award className="h-4 w-4" />
                        {isGraded ? 'Review / Edit Grade' : 'Grade Submission'}
                      </Button>
                    </div>
                  </div>

                  {/* Recitation audio player */}
                  {sub.audio_file_url && (
                    <div className="flex items-center gap-3 bg-muted/40 p-2.5 rounded">
                      <Volume2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <audio
                        controls
                        className="w-full h-8"
                        src={resolveAssessmentMediaUrl(sub.audio_file_url) || ''}
                      />
                    </div>
                  )}

                  {/* Written response */}
                  {sub.written_response && (
                    <p className="text-xs bg-muted/20 p-2 rounded text-muted-foreground line-clamp-2">
                      <span className="font-semibold text-foreground">Answer: </span>
                      {sub.written_response}
                    </p>
                  )}

                  {/* Teacher Feedback */}
                  {isGraded && sub.teacher_feedback && (
                    <div className="text-xs bg-emerald-50/60 dark:bg-emerald-950/20 p-2 rounded text-emerald-900 dark:text-emerald-200 border border-emerald-100 dark:border-emerald-900">
                      <span className="font-semibold">Feedback: </span>
                      {sub.teacher_feedback}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Grade / Review Modal */}
      <GradeSubmissionModal
        open={!!selectedSubmission}
        onOpenChange={(open) => {
          if (!open) setSelectedSubmission(null);
        }}
        submission={selectedSubmission}
      />

      <CreateAssignmentModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </div>
  );
}
