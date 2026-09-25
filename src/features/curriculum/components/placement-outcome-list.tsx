'use client';

import { curriculumKeys } from '@/lib/api/query-keys';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { curriculumApi } from '../api/curriculum';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { ClipboardList } from 'lucide-react';

interface PlacementOutcomeListProps {
  scope: 'mine' | 'children';
  title?: string;
}

export function PlacementOutcomeList({ scope, title = 'Your placements' }: PlacementOutcomeListProps) {
  const { activeAcademy } = useAcademy();

  const { data: placements = [], isLoading } = useQuery({
    queryKey: curriculumKeys.placements(activeAcademy?.id, scope),
    queryFn: () =>
      scope === 'mine'
        ? curriculumApi.getMyPlacements(activeAcademy!.id)
        : curriculumApi.getChildPlacements(activeAcademy!.id),
    enabled: !!activeAcademy,
  });

  if (!activeAcademy) return null;
  if (isLoading) return <LoadingState />;

  if (placements.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardList className="text-muted-foreground h-10 w-10" />}
        title="No placements yet"
        description={
          scope === 'mine'
            ? 'Submit a placement above to get a starting level.'
            : "Your children's placement submissions will show up here."
        }
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {placements.map((placement) => (
          <div
            key={placement.id}
            className="flex items-center justify-between gap-3 rounded-md border p-3"
          >
            <div>
              <p className="font-medium">
                {scope === 'children'
                  ? `${placement.student.first_name} ${placement.student.last_name} — ${placement.track}`
                  : placement.track}
              </p>
              <p className="text-muted-foreground text-sm">
                {placement.skipped_as_beginner
                  ? 'Submitted as a complete beginner'
                  : placement.has_audio_sample
                    ? `Recitation sample: ${placement.audio_filename ?? 'uploaded'}`
                    : 'Awaiting review'}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant={placement.status === 'reviewed' ? 'default' : 'secondary'}>
                {placement.status === 'reviewed' ? 'Reviewed' : 'Pending'}
              </Badge>
              {placement.status === 'reviewed' && (
                <span className="text-sm">{placement.recommended_level.name}</span>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
