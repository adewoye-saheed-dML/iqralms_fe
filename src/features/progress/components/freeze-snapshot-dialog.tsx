'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { progressApi, ProgressSnapshotCreate } from '../api/progress';
import { studentsApi } from '@/features/students/api/students';
import { curriculumApi } from '@/features/curriculum/api/curriculum';
import { useAcademy } from '@/lib/academy/academy-provider';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Lock } from 'lucide-react';
import { ApiError } from '@/lib/api/errors';

export function FreezeSnapshotDialog() {
  const { activeAcademy } = useAcademy();
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);

  const [studentId, setStudentId] = React.useState<string>('');
  const [trackId, setTrackId] = React.useState<string>('');
  const [periodStart, setPeriodStart] = React.useState('');
  const [periodEnd, setPeriodEnd] = React.useState('');
  const [summary, setSummary] = React.useState('');
  const [visibleToFamily, setVisibleToFamily] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const { data: students = [] } = useQuery({
    queryKey: ['students', activeAcademy?.id],
    queryFn: () => {
      if (!activeAcademy?.id) return [];
      return studentsApi.getStudents(activeAcademy.id);
    },
    enabled: !!activeAcademy?.id && open,
  });

  const { data: tracks = [] } = useQuery({
    queryKey: ['curriculum', activeAcademy?.id, 'tracks'],
    queryFn: () => {
      if (!activeAcademy?.id) return [];
      return curriculumApi.getTracks(activeAcademy.id);
    },
    enabled: !!activeAcademy?.id && open,
  });

  const createMutation = useMutation({
    mutationFn: (body: ProgressSnapshotCreate) => {
      if (!activeAcademy?.id) throw new Error('No active academy');
      return progressApi.createSnapshot(activeAcademy.id, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress', activeAcademy?.id] });
      setOpen(false);
      setSummary('');
      setErrorMsg(null);
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        setErrorMsg(err.message || 'Failed to create snapshot');
      } else {
        setErrorMsg('An unexpected error occurred');
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !trackId || !periodStart || !periodEnd) {
      setErrorMsg('Please fill in all required fields');
      return;
    }

    createMutation.mutate({
      student: Number(studentId),
      track: Number(trackId),
      period_start: new Date(periodStart).toISOString(),
      period_end: new Date(periodEnd).toISOString(),
      summary: summary.trim() || undefined,
      visible_to_family: visibleToFamily,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Lock className="mr-2 h-4 w-4" /> Freeze Progress Period
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Freeze Learning Snapshot</DialogTitle>
          <DialogDescription>
            Freeze and publish an evaluated learning period for a student in this track.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {errorMsg && (
            <div className="p-3 text-sm rounded bg-destructive/10 text-destructive">
              {errorMsg}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="snapshot-student">Student</Label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger id="snapshot-student">
                <SelectValue placeholder="Select student..." />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.first_name ? `${s.first_name} ${s.last_name || ''}`.trim() : s.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="snapshot-track">Curriculum Track</Label>
            <Select value={trackId} onValueChange={setTrackId}>
              <SelectTrigger id="snapshot-track">
                <SelectValue placeholder="Select track..." />
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="period-start">Period Start</Label>
              <Input
                id="period-start"
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period-end">Period End</Label>
              <Input
                id="period-end"
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="snapshot-summary">Evaluation Summary (Optional)</Label>
            <Textarea
              id="snapshot-summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="e.g. Mastered basic rules; recommended advancement to Level 2."
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="visible-family"
              checked={visibleToFamily}
              onChange={(e) => setVisibleToFamily(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="visible-family" className="text-sm font-normal cursor-pointer">
              Publish & make visible to student and family
            </Label>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Freezing...' : 'Freeze Snapshot'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
