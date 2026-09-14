'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { curriculumApi, Level, LevelCreate } from '../api/curriculum';
import { ApiError } from '@/lib/api/errors';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { LoadingState } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';

interface LevelFormProps {
  trackId: number;
  initialData?: Level;
}

export function LevelForm({ trackId, initialData }: LevelFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { activeAcademy } = useAcademy();
  const [name, setName] = React.useState(initialData?.name || '');
  const [minAge, setMinAge] = React.useState<string>(
    initialData?.min_age !== undefined && initialData?.min_age !== null
      ? initialData.min_age.toString()
      : ''
  );

  const {
    data: track,
    isLoading: trackLoading,
    isError: trackError,
  } = useQuery({
    queryKey: ['academy', activeAcademy?.id, 'curriculum', 'track', trackId],
    queryFn: () => curriculumApi.getTrack(activeAcademy!.id, trackId),
    enabled: !!activeAcademy && !initialData,
  });

  const mutation = useMutation({
    mutationFn: async (data: Omit<LevelCreate, 'track'>) => {
      if (!activeAcademy) throw new Error('No academy context');
      if (initialData) {
        return curriculumApi.updateLevel(activeAcademy.id, initialData.id, data);
      }
      return curriculumApi.createLevel(activeAcademy.id, { ...data, track: trackId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['academy', activeAcademy?.id, 'curriculum', 'tracks'],
      });
      queryClient.invalidateQueries({
        queryKey: ['academy', activeAcademy?.id, 'curriculum', 'track', trackId],
      });
      router.push(`/app/curriculum/tracks/${trackId}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Omit<LevelCreate, 'track'> = { name };
    const ageVal = parseInt(minAge, 10);
    if (!isNaN(ageVal)) {
      payload.min_age = ageVal;
    }
    mutation.mutate(payload);
  };

  let errorMessage = '';
  if (mutation.isError) {
    if (mutation.error instanceof ApiError) {
      if (mutation.error.status === 400) {
        const data = mutation.error.data as Record<string, string[]>;
        if (data?.name) {
          errorMessage = `Name error: ${data.name.join(' ')}`;
        } else if (data?.min_age) {
          errorMessage = `Min Age error: ${data.min_age.join(' ')}`;
        } else if (data?.non_field_errors) {
          errorMessage = data.non_field_errors.join(' ');
        } else {
          errorMessage = 'Validation failed. Please check your inputs.';
        }
      } else if (mutation.error.status === 403) {
        errorMessage = 'You do not have permission to manage levels.';
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
        <AlertDescription>Please select an academy.</AlertDescription>
      </Alert>
    );
  }

  if (!initialData && trackLoading) {
    return <LoadingState />;
  }

  if (!initialData && trackError) {
    return <ErrorState title="Error" message="Could not load track information." />;
  }

  const isEditing = !!initialData;
  const currentOrder = initialData?.order || (track ? track.levels.length + 1 : 1);

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Level' : `New Level (Order ${currentOrder})`}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Level Name</Label>
            <Input
              id="name"
              required
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Foundation"
              disabled={mutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minAge">Minimum Age (Optional)</Label>
            <Input
              id="minAge"
              type="number"
              min={1}
              max={100}
              value={minAge}
              onChange={(e) => setMinAge(e.target.value)}
              placeholder="e.g. 5"
              disabled={mutation.isPending}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/app/curriculum/tracks/${trackId}`)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!name || mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save Level'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
