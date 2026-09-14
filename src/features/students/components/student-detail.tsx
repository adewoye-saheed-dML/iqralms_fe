'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { studentsApi } from '../api/students';
import { ApiError } from '@/lib/api/errors';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { LoadingState } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { Label } from '@/components/ui/label';

interface StudentDetailProps {
  enrollmentId: number;
}

export function StudentDetail({ enrollmentId }: StudentDetailProps) {
  const queryClient = useQueryClient();
  const { activeAcademy } = useAcademy();
  const [status, setStatus] = React.useState<'active' | 'inactive' | ''>('');
  const [successMessage, setSuccessMessage] = React.useState('');

  const {
    data: student,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['academy', activeAcademy?.id, 'student', enrollmentId],
    queryFn: () => studentsApi.getStudent(activeAcademy!.id, enrollmentId),
    enabled: !!activeAcademy,
  });

  const currentStatus = status || student?.status || '';

  const updateMutation = useMutation({
    mutationFn: async (newStatus: 'active' | 'inactive') => {
      if (!activeAcademy) throw new Error('No academy context');
      return studentsApi.updateStudentStatus(activeAcademy.id, enrollmentId, { status: newStatus });
    },
    onSuccess: () => {
      setSuccessMessage('Enrollment status updated successfully.');
      queryClient.invalidateQueries({
        queryKey: ['academy', activeAcademy?.id, 'student', enrollmentId],
      });
      queryClient.invalidateQueries({ queryKey: ['academy', activeAcademy?.id, 'students'] });
      // clear success message after a few seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    },
  });

  const handleStatusChange = (val: string) => {
    if (val === 'active' || val === 'inactive') {
      setStatus(val);
    }
  };

  const handleSave = () => {
    if (status && status !== student?.status) {
      setSuccessMessage('');
      updateMutation.mutate(status as 'active' | 'inactive');
    }
  };

  if (!activeAcademy) return null;

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <LoadingState />
      </div>
    );
  }

  if (isError) {
    if (error instanceof ApiError && error.status === 404) {
      return (
        <ErrorState
          title="Student Not Found"
          message="This student enrollment does not exist in the active academy."
        />
      );
    }
    return (
      <ErrorState
        title="Failed to load student details"
        message={error instanceof Error ? error.message : 'An unknown error occurred.'}
        onRetry={refetch}
      />
    );
  }

  if (!student) return null;

  const hasChanges = status && status !== student.status;

  let errorMessage = '';
  if (updateMutation.isError) {
    if (updateMutation.error instanceof ApiError) {
      if (updateMutation.error.status === 403) {
        errorMessage = 'You do not have permission to manage this student.';
      } else {
        errorMessage = updateMutation.error.message || 'An unexpected error occurred.';
      }
    } else {
      errorMessage = updateMutation.error.message;
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Enrollment Profile</CardTitle>
            <CardDescription>
              View and manage the student&apos;s status in this academy.
            </CardDescription>
          </div>
          <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
            {student.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-muted-foreground">User ID</Label>
            <div className="mt-1 font-medium">{student.user}</div>
          </div>
          <div>
            <Label className="text-muted-foreground">Username</Label>
            <div className="mt-1 font-medium">{student.username || 'Unknown'}</div>
          </div>
        </div>

        <div className="space-y-2 border-t pt-4">
          <Label htmlFor="statusSelect">Enrollment Status</Label>
          <div className="flex items-center gap-4">
            <Select
              value={status}
              onValueChange={handleStatusChange}
              disabled={updateMutation.isPending}
            >
              <SelectTrigger id="statusSelect" className="w-[200px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSave} disabled={!hasChanges || updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
