'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { studentsApi, StudentList } from '@/features/students/api/students';
import { curriculumApi, TrackBrief, Level, TeacherTrack, PlacementResult } from '../api/curriculum';
import { membershipsApi, Membership } from '@/features/memberships/api/memberships';
import { curriculumKeys, studentKeys } from '@/lib/api/query-keys';
import { AllocateStudentModal, AllocatableStudent } from './allocate-student-modal';
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
  Pencil,
} from 'lucide-react';

export function StudentAllocationsTable() {
  const { activeAcademy } = useAcademy();

  const [search, setSearch] = React.useState('');
  const [trackFilter, setTrackFilter] = React.useState<string>('all');
  const [allocationFilter, setAllocationFilter] = React.useState<'all' | 'allocated' | 'unallocated'>('all');
  const [teacherFilter, setTeacherFilter] = React.useState<string>('all');
  const [selectedStudent, setSelectedStudent] = React.useState<AllocatableStudent | null>(null);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = React.useState(false);
  const [noStudentsDialogOpen, setNoStudentsDialogOpen] = React.useState(false);

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

  // Fetch academy memberships to identify teachers & student members
  const { data: members = [] } = useQuery<Membership[]>({
    queryKey: ['memberships', activeAcademy?.id],
    queryFn: () => membershipsApi.list(activeAcademy!.id),
    enabled: !!activeAcademy?.id,
  });

  // Unified Allocatable Students: Cross-match enrolled students and student members
  const allAllocatableStudents = React.useMemo<AllocatableStudent[]>(() => {
    const list: AllocatableStudent[] = [];

    // 1. Enrolled students
    for (const s of students) {
      list.push({
        id: s.id,
        user_id: s.user_id,
        username: s.username,
        first_name: s.first_name,
        last_name: s.last_name,
        email: s.email,
        is_minor: s.is_minor,
        date_of_birth: s.date_of_birth,
        enrollment_status: s.enrollment_status,
        track_id: s.track_id,
        level_id: s.level_id,
        teacher_id: s.teacher_id,
        teacher_name: s.teacher_name,
        hasEnrollment: true,
        appliedTrackName: null,
        appliedLevelName: null,
        appliedAsBeginner: false,
      });
    }

    // 2. Student members awaiting initial enrollment
    const enrolledUserIds = new Set(students.map((s) => s.user_id));
    const studentMembers = members.filter((m) => m.role === 'student');

    for (const m of studentMembers) {
      if (!enrolledUserIds.has(m.user)) {
        list.push({
          id: -(m.id || m.user),
          user_id: m.user,
          username: m.username,
          first_name: '',
          last_name: '',
          email: '',
          is_minor: false,
          date_of_birth: '',
          enrollment_status: 'pending_enrollment',
          track_id: null,
          level_id: null,
          teacher_id: null,
          teacher_name: null,
          hasEnrollment: false,
          appliedTrackName: null,
          appliedLevelName: null,
          appliedAsBeginner: false,
        });
      }
    }

    return list;
  }, [students, members]);

  // Teachers in the academy
  const teacherMembers = React.useMemo(() => {
    const assignedUserIds = new Set(teacherTracks.map((tt) => tt.user));
    return members.filter((m) => m.role === 'teacher' || assignedUserIds.has(m.user));
  }, [members, teacherTracks]);

  if (!activeAcademy) return null;
  if (isStudentsLoading || isTracksLoading) return <LoadingState />;

  // Filter students based on search, track, allocation status, and teacher
  const filteredStudents = allAllocatableStudents.filter((s) => {
    const studentName = `${s.first_name || ''} ${s.last_name || ''} ${s.username} ${s.email || ''}`.toLowerCase();
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
  const totalStudents = allAllocatableStudents.length;
  const fullyAllocatedCount = allAllocatableStudents.filter((s) => s.track_id && s.level_id && s.teacher_id).length;
  const levelAllocatedCount = allAllocatableStudents.filter((s) => s.track_id && s.level_id).length;
  const pendingTeacherCount = allAllocatableStudents.filter((s) => !s.teacher_id).length;
  const pendingLevelCount = totalStudents - levelAllocatedCount;

  return (
    <div className="space-y-6">
      {/* Allocation Overview KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              {fullyAllocatedCount || levelAllocatedCount}
            </p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="rounded-lg bg-amber-500/10 p-2.5 text-amber-600 dark:text-amber-400">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Awaiting Teacher Mapping</p>
            <p className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {pendingTeacherCount}
            </p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="rounded-lg bg-blue-500/10 p-2.5 text-blue-600 dark:text-blue-400">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Awaiting Level Allocation</p>
            <p className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
              {pendingLevelCount}
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
              Student-Teacher &amp; Curriculum Mapping
            </CardTitle>
            <CardDescription className="text-xs">
              Assign students to curriculum subjects, progressive levels, and qualified teachers.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={() => {
                if (allAllocatableStudents.length === 0) {
                  setNoStudentsDialogOpen(true);
                  return;
                }
                const unassigned =
                  allAllocatableStudents.find(
                    (s) => !s.teacher_id || !s.level_id || !s.track_id
                  ) || allAllocatableStudents[0];
                setSelectedStudent(unassigned);
              }}
              className="text-xs"
            >
              <UserCheck className="mr-1.5 h-3.5 w-3.5" />
              Map Student to Teacher
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTeacherModalOpen(true)}
              className="text-xs"
            >
              <BookOpen className="mr-1.5 h-3.5 w-3.5" />
              Teacher Subject Assignments ({teacherTracks.filter((t) => t.active).length})
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 3-Step Student Mapping Architecture Guide */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <GraduationCap className="h-4 w-4 text-primary" />
              How Student Curriculum &amp; Teacher Mapping Works
            </div>
            <p className="text-[11px] text-muted-foreground">
              Academic placement maps each enrolled student across three core dimensions:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-0.5">
              <div className="rounded bg-background/80 p-2.5 border border-border/80 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">1</span>
                  <span className="text-xs font-medium text-foreground">Curriculum Subject</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  The academic track (e.g. Tajweed, Hifz, Arabic) the student is learning.
                </p>
              </div>
              <div className="rounded bg-background/80 p-2.5 border border-border/80 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">2</span>
                  <span className="text-xs font-medium text-foreground">Progressive Level</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  The milestone level inside that subject (e.g. Level 1). Optional if levels aren&apos;t set yet.
                </p>
              </div>
              <div className="rounded bg-background/80 p-2.5 border border-border/80 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">3</span>
                  <span className="text-xs font-medium text-foreground">Assigned Teacher</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  An instructor authorized to teach that subject assigned to mentor the student.
                </p>
              </div>
            </div>
          </div>

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
                            <div className="flex items-center gap-1.5">
                              <Badge
                                variant="outline"
                                className="text-xs py-0.5 px-2 font-medium bg-primary/10 text-primary border-primary/30"
                              >
                                <UserCheck className="mr-1 h-3.5 w-3.5" />
                                Ustadh {student.teacher_name || 'Assigned'}
                              </Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                title="Change assigned teacher"
                                onClick={() => setSelectedStudent(student)}
                              >
                                <Pencil className="h-3 w-3" />
                                <span className="sr-only">Change Teacher</span>
                              </Button>
                            </div>
                          ) : qualifiedTeachers.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-amber-600 dark:text-amber-400 text-[11px] font-medium">
                                  Unassigned
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-5 text-[10px] px-1.5 text-primary border-primary/40 hover:bg-primary/10"
                                  onClick={() => setSelectedStudent(student)}
                                >
                                  <UserCheck className="mr-1 h-3 w-3" />
                                  Assign Teacher
                                </Button>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {qualifiedTeachers.map((qt) => (
                                  <Badge
                                    key={qt.id}
                                    variant="outline"
                                    className="text-[10px] py-0 px-1 font-normal cursor-pointer hover:bg-primary/10"
                                    onClick={() => setSelectedStudent(student)}
                                    title={`Assign Ustadh ${qt.username}`}
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
                          {student.hasEnrollment === false ? (
                            <Badge variant="outline" className="text-[11px] border-amber-400/60 text-amber-700 dark:text-amber-400 bg-amber-50/40">
                              Pending Placement
                            </Badge>
                          ) : (
                            <Badge
                              variant={student.enrollment_status === 'active' ? 'default' : 'secondary'}
                              className="text-[11px] capitalize"
                            >
                              {student.enrollment_status}
                            </Badge>
                          )}
                        </td>

                        <td className="py-3 px-3 text-right">
                          <Button
                            size="sm"
                            variant={isAllocated && student.teacher_id ? 'outline' : 'default'}
                            onClick={() => setSelectedStudent(student)}
                            className="text-xs h-7 px-2.5"
                          >
                            {!isAllocated
                              ? 'Allocate Level'
                              : !student.teacher_id
                              ? 'Assign Teacher'
                              : 'Edit Mapping'}
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

      {/* Allocate Student Level & Teacher Modal */}
      {selectedStudent && (
        <AllocateStudentModal
          key={selectedStudent.id}
          student={selectedStudent}
          allStudents={allAllocatableStudents}
          tracks={tracks}
          levels={levels}
          teacherTracks={teacherTracks}
          members={members}
          onClose={() => setSelectedStudent(null)}
          onOpenTeacherAssignments={() => {
            setSelectedStudent(null);
            setIsTeacherModalOpen(true);
          }}
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
      {/* No Students Warning Dialog */}
      {noStudentsDialogOpen && (
        <Dialog open onOpenChange={setNoStudentsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-amber-500" />
                No Students Enrolled Yet
              </DialogTitle>
            </DialogHeader>
            <p className="text-xs text-muted-foreground py-2">
              There are currently no students enrolled in this academy. To map students to subjects, progressive levels, and teachers, you must first add students under the Students management section.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNoStudentsDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
export { AllocateStudentModal } from './allocate-student-modal';


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
