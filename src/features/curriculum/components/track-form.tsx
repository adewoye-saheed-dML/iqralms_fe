'use client';

import { curriculumKeys } from '@/lib/api/query-keys';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { curriculumApi, Track, TrackWrite } from '../api/curriculum';
import { ApiError } from '@/lib/api/errors';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface TrackFormProps {
  initialData?: Track;
}

export function TrackForm({ initialData }: TrackFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { activeAcademy } = useAcademy();
  const [name, setName] = React.useState(initialData?.name || '');
  const [slug, setSlug] = React.useState(initialData?.slug || '');

  const mutation = useMutation({
    mutationFn: async (data: TrackWrite) => {
      if (!activeAcademy) throw new Error('No academy context');
      if (initialData) {
        return curriculumApi.updateTrack(activeAcademy.id, initialData.id, data);
      }
      return curriculumApi.createTrack(activeAcademy.id, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: curriculumKeys.tracks(activeAcademy?.id),
      });
      if (initialData) {
        queryClient.invalidateQueries({
          queryKey: curriculumKeys.trackDetail(activeAcademy?.id, initialData.id),
        });
      }
      router.push(`/app/curriculum/tracks/${data.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ name, slug });
  };

  let errorMessage = '';
  if (mutation.isError) {
    if (mutation.error instanceof ApiError) {
      if (mutation.error.status === 400) {
        const data = mutation.error.data as Record<string, string[]>;
        if (data?.slug) {
          errorMessage = `Slug error: ${data.slug.join(' ')}`;
        } else if (data?.name) {
          errorMessage = `Name error: ${data.name.join(' ')}`;
        } else if (data?.non_field_errors) {
          errorMessage = data.non_field_errors.join(' ');
        } else {
          errorMessage = 'Validation failed. Please check your inputs.';
        }
      } else if (mutation.error.status === 403) {
        errorMessage = 'You do not have permission to manage curriculum.';
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

  const isEditing = !!initialData;

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Track' : 'New Track'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Track Name</Label>
            <Input
              id="name"
              required
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tajweed Beginners"
              disabled={mutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug</Label>
            <Input
              id="slug"
              required
              pattern="^[-a-zA-Z0-9_]+$"
              title="Only letters, numbers, hyphens and underscores are allowed"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. tajweed-beginners"
              disabled={mutation.isPending}
            />
            <p className="text-muted-foreground text-sm">Unique identifier within this academy.</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              router.push(
                isEditing ? `/app/curriculum/tracks/${initialData.id}` : '/app/curriculum'
              )
            }
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!name || !slug || mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save Track'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
