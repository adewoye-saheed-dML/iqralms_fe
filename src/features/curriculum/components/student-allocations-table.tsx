'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { studentsApi, StudentList } from '@/features/students/api/students';
import { curriculumApi, TrackBrief, Level, TeacherTrack } from '../api/curriculum';
import { membershipsApi, Membership } from '@/features/memberships/api/memberships';
import { curriculumKeys, studentKeys } from '@/lib/api/query-keys';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingState } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  BookOpen,
  GraduationCap,
  Users,
  CheckCircle2,
  AlertCircle,
  Plus,
  UserCheck,
} from 'lucide-react';

export function StudentAllocationsTable() {
  const { activeAcademy } = useAcademy();

  const [search, setSearch] = React.useState('');
  const [trackFilter, setTrackFilter] = React.useState<string>('all');
  const [allocationFilter, setAllocationFilter] = React.useState<'all' | 'allocated' | 'unallocated'>('all');
  const [teacherFilter, setTeacherFilter] = React.useState<string>('all');
  const [selectedStudent, setSelectedStudent] = React.useState<StudentList | null>(null);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = React.useState(false);

  // Fetch students enrolled in this academy
  const { data: students = [], isLoading: isStudentsLoading } = useQuery<StudentList[]>({
    queryKey: studentKeys.all(activeAcademy?.id),
    queryFn: () => studentsApi.getAcademyStudents(activeAcademy!.id),
    enabled: !!activeAcademy?.id,
  });

  // Fetch curriculum tracks (subjects)
  const { data: tracks = [], isLoading: isTracksLoading } = useQuery<TrackBrief[]>({
    queryKey: curriculumKeys.tracks(activeAcademy?.id),
    queryFn: () => curriculumApi.getTracks(activeAcademy!.id),
    enabled: !!activeAcademy?.id,
  });

  // Fetch all levels
  const { data: levels = [] } = useQuery<Level[]>({
    queryKey: curriculumKeys.levels(activeAcademy?.id),
    queryFn: () => curriculumApi.getLevels(activeAcademy!.id),
    enabled: !!activeAcademy?.id,
  });

  // Fetch teacher track assignments
  const { data: teacherTracks = [] } = useQuery<TeacherTrack[]>({
    queryKey: curriculumKeys.teacherTracks(activeAcademy?.id),
    queryFn: () => curriculumApi.getAcademyTeacherTracks(activeAcademy!.id),
    enabled: !!activeAcademy?.id,
  });

  // Fetch academy memberships to identify teachers
  const { data: members = [] } = useQuery<Membership[]>({
    queryKey: ['memberships', activeAcademy?.id],
    queryFn: () => membershipsApi.list(activeAcademy!.id),
    enabled: !!activeAcademy?.id,
  });

  // Teachers in the academy
  const teacherMembers = React.useMemo(() => {
    const assignedUserIds = new Set(teacherTracks.map((tt) => tt.user));
    return members.filter((m) => m.role === 'teacher' || assignedUserIds.has(m.user));
  }, [members, teacherTracks]);

  if (!activeAcademy) return null;
  if (isStudentsLoading || isTracksLoading) return <LoadingState />;

  // Filter students based on search, track, allocation status, and teacher
  const filteredStudents = students.filter((s) => {
    const studentName = `${s.first_name || ''} ${s.last_name || ''} ${s.username} ${s.email}`.toLowerCase();
    const matchesSearch = studentName.includes(search.toLowerCase());

    const isAllocated = s.track_id !== null && s.level_id !== null;
    const matchesAllocation =
      allocationFilter === 'all' ||
      (allocationFilter === 'allocated' && isAllocated) ||
      (allocationFilter === 'unallocated' && !isAllocated);

    const matchesTrack =
      trackFilter === 'all' ||
      (trackFilter === 'none' && !s.track_id) ||
      String(s.track_id) === trackFilter;

    const matchesTeacher =
      teacherFilter === 'all' ||
      (teacherFilter === 'unassigned' && !s.teacher_id) ||
      String(s.teacher_id) === teacherFilter;

    return matchesSearch && matchesAllocation && matchesTrack && matchesTeacher;
  });

  // Count metrics
  const totalStudents = students.length;
  const allocatedCount = students.filter((s) => s.track_id && s.level_id).length;
  const pendingCount = totalStudents - allocatedCount;

  return (
    <div className="space-y-6">
      {/* Allocation Overview KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4 flex items-center gap-4">
          <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Enrolled Students</p>
            <p className="text-2xl font-bold tracking-tight">{totalStudents}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Level &amp; Teacher Allocated</p>
            <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {allocatedCount}
            </p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="rounded-lg bg-amber-500/10 p-2.5 text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Awaiting Level Allocation</p>
            <p className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {pendingCount}
            </p>
          </div>
        </Card>
      </div>

      {/* Main Student Allocations Table Card */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Student Curriculum &amp; Teacher Allocations
            </CardTitle>
            <CardDescription className="text-xs">
              Assign students to curriculum subjects, progressive levels, and qualified instructors.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTeacherModalOpen(true)}
              className="text-xs"
            >
              <UserCheck className="mr-1.5 h-3.5 w-3.5" />
              Teacher Subject Assignments ({teacherTracks.filter((t) => t.active).length})
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students by name, username or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>

            <div className="w-full sm:w-48">
              <Select value={trackFilter} onValueChange={setTrackFilter}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="none">Unassigned Subject</SelectItem>
                  {tracks.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-44">
              <Select
                value={allocationFilter}
                onValueChange={(val: 'all' | 'allocated' | 'unallocated') => setAllocationFilter(val)}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="allocated">Allocated Only</SelectItem>
                  <SelectItem value="unallocated">Unallocated Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-44">
              <Select value={teacherFilter} onValueChange={setTeacherFilter}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="All Teachers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teachers</SelectItem>
                  <SelectItem value="unassigned">Unassigned Only</SelectItem>
                  {teacherMembers.map((tm) => (
                    <SelectItem key={tm.id} value={String(tm.user)}>
                      Ustadh {tm.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Listicle Table */}
          {filteredStudents.length === 0 ? (
            <EmptyState
              icon={<Users className="h-8 w-8 text-muted-foreground" />}
              title="No students match criteria"
              description="Try adjusting your search query or filters above."
            />
          ) : (
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
                  <tr>
                    <th className="py-2.5 px-3">Student</th>
                    <th className="py-2.5 px-3">Curriculum Subject</th>
                    <th className="py-2.5 px-3">Allocated Level</th>
                    <th className="py-2.5 px-3">Assigned Teacher</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredStudents.map((student) => {
                    const studentTrack = tracks.find((t) => t.id === student.track_id);
                    const studentLevel = levels.find((l) => l.id === student.level_id);

                    // Find teachers assigned to this student's track
                    const eligibleTeacherIds = teacherTracks
                      .filter((tt) => tt.active && tt.track === student.track_id)
                      .map((tt) => tt.user);

                    const qualifiedTeachers = members.filter((m) =>
                      eligibleTeacherIds.includes(m.user)
                    );

                    const isAllocated = !!studentTrack && !!studentLevel;

                    return (
                      <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-semibold text-foreground">
                            {student.first_name || student.last_name
                              ? `${student.first_name} ${student.last_name}`
                              : student.username}
                            {student.is_minor && (
                              <Badge variant="outline" className="ml-2 text-[10px] py-0 px-1 font-normal">
                                Minor
                              </Badge>
                            )}
                          </div>
                          <div className="text-[11px] text-muted-foreground">{student.email}</div>
                        </td>

                        <td className="py-3 px-3">
                          {studentTrack ? (
                            <Badge variant="secondary" className="font-medium text-xs">
                              <BookOpen className="mr-1 h-3 w-3" />
                              {studentTrack.name}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-amber-600 border-amber-300 dark:text-amber-400 bg-amber-50/50 text-[11px]">
                              Not Assigned
                            </Badge>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          {studentLevel ? (
                            <Badge variant="default" className="text-xs bg-primary/90">
                              Level {studentLevel.order}: {studentLevel.name}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground italic text-xs">
                              {student.track_id ? 'Needs level placement' : 'Pending subject'}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          {student.teacher_id ? (
                            <Badge
                              variant="outline"
                              className="text-xs py-0.5 px-2 font-medium bg-primary/10 text-primary border-primary/30"
                            >
                              <UserCheck className="mr-1 h-3.5 w-3.5" />
                              Ustadh {student.teacher_name || 'Assigned'}
                            </Badge>
                          ) : qualifiedTeachers.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              <span className="text-amber-600 dark:text-amber-400 text-[11px] font-medium">
                                Unassigned
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {qualifiedTeachers.map((qt) => (
                                  <Badge
                                    key={qt.id}
                                    variant="outline"
                                    className="text-[10px] py-0 px-1 font-normal"
                                  >
                                    Ustadh {qt.username}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs italic">
                              {studentTrack ? 'No qualified teacher' : 'Unassigned'}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <Badge
                            variant={student.enrollment_status === 'active' ? 'default' : 'secondary'}
                            className="text-[11px] capitalize"
                          >
                            {student.enrollment_status}
                          </Badge>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <Button
                            size="sm"
                            variant={isAllocated && student.teacher_id ? 'outline' : 'default'}
                            onClick={() => setSelectedStudent(student)}
                            className="text-xs h-7 px-2.5"
                          >
                            {isAllocated ? 'Change Level' : 'Allocate Level'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Allocate Student Level Modal */}
      {selectedStudent && (
        <AllocateStudentModal
          student={selectedStudent}
          tracks={tracks}
          levels={levels}
          teacherTracks={teacherTracks}
          members={members}
          onClose={() => setSelectedStudent(null)}
        />
      )}

      {/* Teacher Subject Qualifications Modal */}
      {isTeacherModalOpen && (
        <TeacherTrackAssignmentsModal
          tracks={tracks}
          members={members}
          teacherTracks={teacherTracks}
          onClose={() => setIsTeacherModalOpen(false)}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------------------
// Allocate Student Modal Component
// -------------------------------------------------------------------------
interface AllocateStudentModalProps {
  student: StudentList;
  tracks: TrackBrief[];
  levels: Level[];
  teacherTracks: TeacherTrack[];
  members: Membership[];
  onClose: () => void;
}

function AllocateStudentModal({
  student,
  tracks,
  levels,
  teacherTracks,
  members,
  onClose,
}: AllocateStudentModalProps) {
  const queryClient = useQueryClient();
  const { activeAcademy } = useAcademy();

  const [selectedTrackId, setSelectedTrackId] = React.useState<string>(
    student.track_id ? String(student.track_id) : tracks[0] ? String(tracks[0].id) : ''
  );

  const availableLevels = React.useMemo(() => {
    if (!selectedTrackId) return [];
    return levels
      .filter((l) => String(l.track) === selectedTrackId)
      .sort((a, b) => a.order - b.order);
  }, [levels, selectedTrackId]);

  const [selectedLevelId, setSelectedLevelId] = React.useState<string>(
    student.level_id ? String(student.level_id) : ''
  );

  const [selectedTeacherId, setSelectedTeacherId] = React.useState<string>(
    student.teacher_id ? String(student.teacher_id) : 'unassigned'
  );

  const effectiveLevelId = React.useMemo(() => {
    if (availableLevels.length === 0) return '';
    const matches = availableLevels.some((l) => String(l.id) === selectedLevelId);
    return matches ? selectedLevelId : String(availableLevels[0].id);
  }, [availableLevels, selectedLevelId]);

  const handleTrackChange = (newTrackId: string) => {
    setSelectedTrackId(newTrackId);
    const newLevels = levels
      .filter((l) => String(l.track) === newTrackId)
      .sort((a, b) => a.order - b.order);
    setSelectedLevelId(newLevels[0] ? String(newLevels[0].id) : '');

    // Reset teacher selection if current teacher is not eligible for new track
    const newActiveTt = teacherTracks.filter(
      (tt) => tt.active && String(tt.track) === newTrackId
    );
    const newTeacherUserIds = newActiveTt.map((tt) => tt.user);
    if (selectedTeacherId !== 'unassigned' && !newTeacherUserIds.includes(Number(selectedTeacherId))) {
      setSelectedTeacherId('unassigned');
    }
  };

  // Teachers teaching the selected track
  const eligibleTeachers = React.useMemo(() => {
    if (!selectedTrackId) return [];
    const activeTt = teacherTracks.filter(
      (tt) => tt.active && String(tt.track) === selectedTrackId
    );
    const teacherUserIds = activeTt.map((tt) => tt.user);
    return members.filter((m) => teacherUserIds.includes(m.user));
  }, [teacherTracks, selectedTrackId, members]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!activeAcademy) throw new Error('No active academy');
      return studentsApi.updateStudentStatus(activeAcademy.id, student.id, {
        track_id: selectedTrackId ? Number(selectedTrackId) : null,
        level_id: effectiveLevelId ? Number(effectiveLevelId) : null,
        teacher_id:
          selectedTeacherId && selectedTeacherId !== 'unassigned'
            ? Number(selectedTeacherId)
            : null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: studentKeys.all(activeAcademy?.id),
      });
      onClose();
    },
  });

  const studentFullName = student.first_name || student.last_name
    ? `${student.first_name} ${student.last_name}`
    : student.username;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Allocate Level for {studentFullName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {mutation.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {mutation.error instanceof Error
                  ? mutation.error.message
                  : 'Failed to update student allocation.'}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="alloc-track">Curriculum Subject (Track)</Label>
            <Select
              value={selectedTrackId}
              onValueChange={handleTrackChange}
              disabled={mutation.isPending}
            >
              <SelectTrigger id="alloc-track">
                <SelectValue placeholder="Select curriculum subject..." />
              </SelectTrigger>
              <SelectContent>
                {tracks.map((track) => (
                  <SelectItem key={track.id} value={String(track.id)}>
                    {track.name} ({track.slug})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="alloc-level">Progressive Level</Label>
            {availableLevels.length > 0 ? (
              <Select
                value={effectiveLevelId}
                onValueChange={setSelectedLevelId}
                disabled={mutation.isPending}
              >
                <SelectTrigger id="alloc-level">
                  <SelectValue placeholder="Choose level..." />
                </SelectTrigger>
                <SelectContent>
                  {availableLevels.map((lvl) => (
                    <SelectItem key={lvl.id} value={String(lvl.id)}>
                      Level {lvl.order}: {lvl.name} {lvl.min_age ? `(Age ${lvl.min_age}+)` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
                No progressive levels defined yet for this track. Add levels first.
              </div>
            )}
          </div>

          {/* Assigned Teacher (Instructor) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="alloc-teacher">Assigned Teacher (Instructor)</Label>
              <span className="text-[11px] text-muted-foreground">Direct Allocation</span>
            </div>
            <Select
              value={selectedTeacherId}
              onValueChange={setSelectedTeacherId}
              disabled={mutation.isPending}
            >
              <SelectTrigger id="alloc-teacher" aria-label="Select instructor">
                <SelectValue placeholder="Select instructor..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">-- No Teacher Assigned (Unassigned) --</SelectItem>
                {eligibleTeachers.map((t) => (
                  <SelectItem key={t.id} value={String(t.user)}>
                    Ustadh {t.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {eligibleTeachers.length === 0 ? (
              <p className="text-[11px] text-amber-600 dark:text-amber-400">
                No instructor is currently assigned to this track. Use &quot;Teacher Subject Assignments&quot; to authorize teachers first.
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Only instructors authorized to teach this subject are eligible.
              </p>
            )}
          </div>

          {/* Qualified Teachers for this subject */}
          <div className="rounded-md bg-muted/40 p-3 text-xs space-y-1.5 border border-border">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-primary" />
              Qualified Instructors for this Subject ({eligibleTeachers.length})
            </div>
            {eligibleTeachers.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {eligibleTeachers.map((t) => (
                  <Badge key={t.id} variant="secondary" className="text-[11px]">
                    Ustadh {t.username}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                No teacher has been assigned to teach this track yet.
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={!selectedTrackId || !effectiveLevelId || mutation.isPending}
          >
            {mutation.isPending ? 'Allocating...' : 'Confirm Allocation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// -------------------------------------------------------------------------
// Teacher Track Assignments Modal
// -------------------------------------------------------------------------
interface TeacherTrackAssignmentsModalProps {
  tracks: TrackBrief[];
  members: Membership[];
  teacherTracks: TeacherTrack[];
  onClose: () => void;
}

function TeacherTrackAssignmentsModal({
  tracks,
  members,
  teacherTracks,
  onClose,
}: TeacherTrackAssignmentsModalProps) {
  const queryClient = useQueryClient();
  const { activeAcademy } = useAcademy();

  const [selectedTeacherUserId, setSelectedTeacherUserId] = React.useState<string>('');
  const [selectedTrackId, setSelectedTrackId] = React.useState<string>(
    tracks[0] ? String(tracks[0].id) : ''
  );
  const [assignError, setAssignError] = React.useState<string>('');

  const eligibleTeachers = members.filter(
    (m) => (m.role === 'teacher' || m.role === 'staff' || m.role === 'admin' || m.role === 'owner') && m.status === 'active'
  );

  const assignMutation = useMutation({
    mutationFn: async () => {
      setAssignError('');
      if (!activeAcademy) throw new Error('No academy context');
      if (!selectedTeacherUserId || !selectedTrackId) {
        throw new Error('Please select both a teacher and a subject.');
      }
      return curriculumApi.assignTeacherTrack(activeAcademy.id, {
        user: Number(selectedTeacherUserId),
        track: Number(selectedTrackId),
        active: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: curriculumKeys.teacherTracks(activeAcademy?.id),
      });
      setSelectedTeacherUserId('');
    },
    onError: (err: unknown) => {
      setAssignError(err instanceof Error ? err.message : 'Failed to assign teacher to subject.');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ assignmentId, active }: { assignmentId: number; active: boolean }) => {
      if (!activeAcademy) throw new Error('No academy context');
      return curriculumApi.updateTeacherTrack(activeAcademy.id, assignmentId, {
        active,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: curriculumKeys.teacherTracks(activeAcademy?.id),
      });
    },
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            Teacher Subject Qualifications
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Add New Teacher Track Assignment */}
          <div className="rounded-lg border p-3.5 bg-muted/20 space-y-3">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Authorize Instructor for Subject
            </h4>

            {assignError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{assignError}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Teacher</Label>
                <Select
                  value={selectedTeacherUserId}
                  onValueChange={setSelectedTeacherUserId}
                  disabled={assignMutation.isPending}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Choose teacher..." />
                  </SelectTrigger>
                  <SelectContent>
                    {eligibleTeachers.map((t) => (
                      <SelectItem key={t.id} value={String(t.user)}>
                        Ustadh {t.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Subject (Track)</Label>
                <Select
                  value={selectedTrackId}
                  onValueChange={setSelectedTrackId}
                  disabled={assignMutation.isPending}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Choose subject..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tracks.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => assignMutation.mutate()}
              disabled={!selectedTeacherUserId || !selectedTrackId || assignMutation.isPending}
              className="w-full text-xs"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              {assignMutation.isPending ? 'Assigning...' : 'Assign Teacher to Subject'}
            </Button>
          </div>

          {/* Current Assignments List */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Current Teaching Authorizations ({teacherTracks.length})
            </h4>

            {teacherTracks.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No teacher assignments yet.</p>
            ) : (
              <div className="divide-y divide-border rounded-md border">
                {teacherTracks.map((tt) => {
                  const teacherMember = members.find((m) => m.user === tt.user);
                  const trackObj = tracks.find((t) => t.id === tt.track);

                  return (
                    <div
                      key={tt.id}
                      className="p-2.5 flex items-center justify-between text-xs hover:bg-muted/30 transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-foreground">
                          Ustadh {teacherMember?.username || tt.username}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Teaches: <span className="font-medium text-primary">{trackObj?.name || tt.track_slug}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant={tt.active ? 'default' : 'secondary'}
                          className="text-[10px]"
                        >
                          {tt.active ? 'Active' : 'Suspended'}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            toggleActiveMutation.mutate({
                              assignmentId: tt.id,
                              active: !tt.active,
                            })
                          }
                          disabled={toggleActiveMutation.isPending}
                          className="text-[11px] h-7 px-2"
                        >
                          {tt.active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
