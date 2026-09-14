'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { onboardingApi, CreateTrackPayload } from '../api/onboarding';
import { useAcademy } from '@/lib/academy/academy-provider';

export function CurriculumSetupForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { activeAcademy } = useAcademy();

  const [formData, setFormData] = React.useState<CreateTrackPayload>({
    name: '',
    slug: '',
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateTrackPayload) => {
      if (!activeAcademy) throw new Error('No active academy context');
      return onboardingApi.createTrack(activeAcademy.id, data);
    },
    onSuccess: () => {
      // Invalidate the tracks query to reflect the new track
      queryClient.invalidateQueries({ queryKey: ['academy', activeAcademy?.id, 'tracks'] });
      // Go back to onboarding dashboard
      router.push('/app/onboarding');
    },
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => {
      const isAutoSlug =
        prev.name === '' ||
        prev.slug ===
          prev.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
      const newSlug = isAutoSlug
        ? name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        : prev.slug;
      return { ...prev, name, slug: newSlug };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  if (!activeAcademy) {
    return <div className="text-sm text-red-500">Missing academy context.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {createMutation.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Creation failed</AlertTitle>
          <AlertDescription>
            {createMutation.error instanceof Error
              ? createMutation.error.message
              : 'Unknown error occurred'}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Subject/Track Name</Label>
        <Input
          id="name"
          required
          placeholder="e.g. Quran Memorization"
          value={formData.name}
          onChange={handleNameChange}
          disabled={createMutation.isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">URL Slug</Label>
        <Input
          id="slug"
          required
          placeholder="quran-memorization"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          disabled={createMutation.isPending}
          pattern="^[-a-zA-Z0-9_]+$"
          title="Letters, numbers, dashes and underscores only"
        />
      </div>

      <Button type="submit" className="w-full" disabled={createMutation.isPending}>
        {createMutation.isPending ? 'Adding Track...' : 'Add Track'}
      </Button>
    </form>
  );
}
