import { curriculumKeys } from '@/lib/api/query-keys';
import { can } from '@/lib/permissions/capabilities';
'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { curriculumApi } from '../api/curriculum';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingState } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { BookOpen, Plus } from 'lucide-react';
import { ApiError } from '@/lib/api/errors';

export function CurriculumDirectory() {
  const { activeAcademy, activeRole } = useAcademy();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: curriculumKeys.tracks(activeAcademy?.id),
    queryFn: () => curriculumApi.getTracks(activeAcademy!.id),
    enabled: !!activeAcademy,
  });

  if (!activeAcademy) {
    return <EmptyState title="No Academy Context" description="Please select an academy." />;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    if (error instanceof ApiError && error.status === 403) {
      return (
        <ErrorState
          title="Access Denied"
          message="You do not have permission to view this academy's curriculum."
        />
      );
    }
    return (
      <ErrorState
        title="Failed to load curriculum"
        message={error instanceof Error ? error.message : 'An unknown error occurred.'}
        onRetry={refetch}
      />
    );
  }

  const tracks = data || [];
  const canManageCurriculum = can('manage_curriculum', { activeRole });

  if (tracks.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen className="text-muted-foreground h-10 w-10" />}
        title="No curriculum tracks found"
        description="This academy hasn't set up any learning tracks yet."
        action={
          canManageCurriculum ? (
            <Button asChild>
              <Link href="/app/curriculum/tracks/add">
                <Plus className="mr-2 h-4 w-4" />
                Create Track
              </Link>
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {canManageCurriculum && (
        <div className="flex justify-end">
          <Button asChild>
            <Link href="/app/curriculum/tracks/add">
              <Plus className="mr-2 h-4 w-4" />
              Create Track
            </Link>
          </Button>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tracks.map((track) => (
          <Card key={track.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{track.name}</CardTitle>
                  <p className="text-muted-foreground mt-1 font-mono text-sm">{track.slug}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Levels ({track.levels.length})</h4>
                {track.levels.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {track.levels.map((level) => (
                      <Badge key={level.id} variant="secondary">
                        {level.order}. {level.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm italic">No levels added yet.</p>
                )}
              </div>

              {canManageCurriculum && (
                <div className="mt-6">
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/app/curriculum/tracks/${track.id}`}>Manage Track</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
