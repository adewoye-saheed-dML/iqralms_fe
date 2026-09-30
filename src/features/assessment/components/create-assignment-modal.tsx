'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { assessmentApi, SubmissionType, SUBMISSION_TYPE_LABELS } from '../api/assessment';
import { assessmentKeys, curriculumKeys, studentKeys } from '@/lib/api/query-keys';
import { curriculumApi } from '@/features/curriculum/api/curriculum';
import { studentsApi } from '@/features/students/api/students';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, BookOpen, FileText, Mic, Paperclip, Upload } from 'lucide-react';

interface CreateAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateAssignmentModal({ open, onOpenChange }: CreateAssignmentModalProps) {
  const { activeAcademy } = useAcademy();
  const academyId = activeAcademy?.id;
  const queryClient = useQueryClient();

  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [submissionType, setSubmissionType] = React.useState<SubmissionType>('recitation');
  const [trackId, setTrackId] = React.useState<string>('all');
  const [levelId, setLevelId] = React.useState<string>('all');
  const [assignedStudentId, setAssignedStudentId] = React.useState<string>('all');
  const [surahNumber, setSurahNumber] = React.useState<string>('');
  const [ayahStart, setAyahStart] = React.useState<string>('');
  const [ayahEnd, setAyahEnd] = React.useState<string>('');
  const [referenceNotes, setReferenceNotes] = React.useState('');
  const [maxScore, setMaxScore] = React.useState('100');
  const [dueDate, setDueDate] = React.useState('');
  const [attachment, setAttachment] = React.useState<File | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Fetch Tracks
  const { data: tracks = [] } = useQuery({
    queryKey: curriculumKeys.tracks(academyId),
    queryFn: () => (academyId ? curriculumApi.getTracks(academyId) : []),
    enabled: !!academyId && open,
  });

  // Fetch Students
  const { data: students = [] } = useQuery({
    queryKey: studentKeys.all(academyId),
    queryFn: () => (academyId ? studentsApi.getMyStudents(academyId) : []),
    enabled: !!academyId && open,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!academyId) throw new Error('Academy ID required');
      if (!title.trim()) throw new Error('Assignment title is required');

      return assessmentApi.createAssignment(academyId, {
        title: title.trim(),
        description: description.trim() || undefined,
        submission_type: submissionType,
        track: trackId !== 'all' ? parseInt(trackId, 10) : undefined,
        level: levelId !== 'all' ? parseInt(levelId, 10) : undefined,
        assigned_student: assignedStudentId !== 'all' ? parseInt(assignedStudentId, 10) : undefined,
        surah_number: surahNumber ? parseInt(surahNumber, 10) : undefined,
        ayah_start: ayahStart ? parseInt(ayahStart, 10) : undefined,
        ayah_end: ayahEnd ? parseInt(ayahEnd, 10) : undefined,
        reference_notes: referenceNotes.trim() || undefined,
        max_score: maxScore ? parseFloat(maxScore) : 100,
        due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
        attachment: attachment || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.all(academyId) });
      handleClose();
    },
    onError: (err: unknown) => {
      const error = err as Error;
      setErrorMessage(error.message || 'Failed to create assignment');
    },
  });

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setSubmissionType('recitation');
    setTrackId('all');
    setLevelId('all');
    setAssignedStudentId('all');
    setSurahNumber('');
    setAyahStart('');
    setAyahEnd('');
    setReferenceNotes('');
    setMaxScore('100');
    setDueDate('');
    setAttachment(null);
    setErrorMessage(null);
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    createMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Create Student Assignment
          </DialogTitle>
          <DialogDescription>
            Assign recitation homework, written tasks, or worksheets to students in your academy.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="assignment-title">Assignment Title *</Label>
            <Input
              id="assignment-title"
              placeholder="e.g. Surah Al-Mulk (Ayat 1-10) Recitation Practice"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Submission Format *</Label>
              <Select
                value={submissionType}
                onValueChange={(val) => setSubmissionType(val as SubmissionType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recitation">
                    <div className="flex items-center gap-2">
                      <Mic className="h-4 w-4 text-emerald-600" />
                      <span>Quran Recitation (Audio Recording)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="written">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span>Written Answer / Reflection</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="file">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4 text-amber-600" />
                      <span>Worksheet / File Upload</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="mixed">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-purple-600" />
                      <span>Mixed (Audio + Written + File)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target Student (Optional)</Label>
              <Select value={assignedStudentId} onValueChange={setAssignedStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="All Students" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Enrolled Students</SelectItem>
                  {students.map((st) => {
                    const studentName = `${st.first_name || ''} ${st.last_name || ''}`.trim() || st.email || `Student #${st.user_id}`;
                    return (
                      <SelectItem key={st.id} value={String(st.user_id)}>
                        {studentName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {(submissionType === 'recitation' || submissionType === 'mixed') && (
            <div className="p-3.5 border rounded-lg bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3">
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                Quran Recitation Reference
              </span>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="surah-num" className="text-xs">
                    Surah Number (1-114)
                  </Label>
                  <Input
                    id="surah-num"
                    type="number"
                    min="1"
                    max="114"
                    placeholder="e.g. 67"
                    value={surahNumber}
                    onChange={(e) => setSurahNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="ayah-start" className="text-xs">
                    Ayah Start
                  </Label>
                  <Input
                    id="ayah-start"
                    type="number"
                    min="1"
                    placeholder="e.g. 1"
                    value={ayahStart}
                    onChange={(e) => setAyahStart(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="ayah-end" className="text-xs">
                    Ayah End
                  </Label>
                  <Input
                    id="ayah-end"
                    type="number"
                    min="1"
                    placeholder="e.g. 10"
                    value={ayahEnd}
                    onChange={(e) => setAyahEnd(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="ref-notes" className="text-xs">
                  Tajweed / Recitation Focus Notes
                </Label>
                <Input
                  id="ref-notes"
                  placeholder="e.g. Emphasize Ikhfa rules and Qalqalah on verses 3-5"
                  value={referenceNotes}
                  onChange={(e) => setReferenceNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Instructions & Details</Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="Provide clear instructions for the student..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max-score">Max Score (Points)</Label>
              <Input
                id="max-score"
                type="number"
                min="1"
                step="1"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due-date">Due Date & Time (Optional)</Label>
              <Input
                id="due-date"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachment-file">Attach Reference File / Worksheet (Optional)</Label>
            <div className="flex items-center gap-3">
              <Input
                id="attachment-file"
                type="file"
                onChange={(e) => setAttachment(e.target.files?.[0] || null)}
              />
              {attachment && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setAttachment(null)}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Publishing...' : 'Publish Assignment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
