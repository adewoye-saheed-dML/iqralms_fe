'use client';

import * as React from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { onboardingApi, CreateOrganizationPayload } from '../api/onboarding';
import { useAcademy } from '@/lib/academy/academy-provider';

export function CreateAcademyForm() {
  const router = useRouter();
  const { refreshAcademies, setActiveAcademy } = useAcademy();
  const [formData, setFormData] = React.useState<CreateOrganizationPayload>({
    name: '',
    slug: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateOrganizationPayload) => onboardingApi.createAcademy(data),
    onSuccess: async (newAcademy) => {
      // Refresh the academy list so the new academy shows up
      await refreshAcademies();
      // Set it as active
      setActiveAcademy(newAcademy.id);
      // Redirect to onboarding/setup page
      router.push('/app/onboarding');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    // Auto-generate slug from name if the user hasn't heavily customized it
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
        <Label htmlFor="name">Academy Name</Label>
        <Input
          id="name"
          required
          placeholder="e.g. Al-Huda Quran Academy"
          value={formData.name}
          onChange={handleNameChange}
          disabled={createMutation.isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Academy URL Slug</Label>
        <Input
          id="slug"
          required
          placeholder="al-huda"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          disabled={createMutation.isPending}
          pattern="^[-a-zA-Z0-9_]+$"
          title="Letters, numbers, dashes and underscores only"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="timezone">Timezone</Label>
        <Input
          id="timezone"
          required
          value={formData.timezone}
          onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
          disabled={createMutation.isPending}
          placeholder="e.g. America/New_York"
        />
        <p className="text-muted-foreground text-xs">
          Must be a valid IANA timezone (e.g. Africa/Lagos, America/New_York).
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={createMutation.isPending}>
        {createMutation.isPending ? 'Creating...' : 'Create Academy'}
      </Button>
    </form>
  );
}
