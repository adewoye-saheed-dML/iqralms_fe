'use client';

import { studentKeys } from '@/lib/api/query-keys';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { studentsApi } from '../api/students';
import { ApiError } from '@/lib/api/errors';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function AddStudentForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { activeAcademy } = useAcademy();
  const [userId, setUserId] = React.useState('');

  const mutation = useMutation({
    mutationFn: async (id: number) => {
      if (!activeAcademy) throw new Error('No academy context');
      return studentsApi.addStudent(activeAcademy.id, { user: id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all(activeAcademy?.id) });
      router.push('/app/students');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(userId, 10);
    if (!isNaN(id)) {
      mutation.mutate(id);
    }
  };

  let errorMessage = '';
  if (mutation.isError) {
    if (mutation.error instanceof ApiError) {
      if (mutation.error.status === 400) {
        // We attempt to extract a specific error if possible
        const data = mutation.error.data as Record<string, string[]>;
        if (data?.non_field_errors) {
          errorMessage = data.non_field_errors.join(' ');
        } else if (data?.user) {
          errorMessage = `User error: ${data.user.join(' ')}`;
        } else {
          errorMessage =
            'Validation failed. The user might not exist, is not a student, or is already enrolled.';
        }
      } else if (mutation.error.status === 403) {
        errorMessage = 'You do not have permission to add students to this academy.';
      } else {
        errorMessage = mutation.error.message || 'An unexpected error occurred.';
      }
    } else {
      errorMessage = mutation.error.message;
    }
  }

  if (!activeAcademy) {
    return (
      <Alert>
        <AlertDescription>Please select an academy to add students.</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Enroll Student</CardTitle>
          <CardDescription>
            Enter the User ID of the student to enroll them in this academy. The user must already
            have a global student account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-blue-200 bg-blue-50/50 text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <span className="font-semibold">Direct Email Invitation: BACKEND CONTRACT REQUIRED.</span>{' '}
              Parent and student invitation endpoints are pending backend contract delivery. Students currently enroll using their existing global User ID.
            </AlertDescription>
          </Alert>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              type="number"
              required
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g. 123"
              disabled={mutation.isPending}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/app/students')}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!userId || mutation.isPending}>
            {mutation.isPending ? 'Enrolling...' : 'Enroll Student'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
