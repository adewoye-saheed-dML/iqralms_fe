import * as React from 'react';
import { Track } from '../api/curriculum';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Layers, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface LevelListProps {
  track: Track;
  canManage: boolean;
}

export function LevelList({ track, canManage }: LevelListProps) {
  const levels = track.levels || [];

  if (levels.length === 0) {
    return (
      <EmptyState
        icon={<Layers className="text-muted-foreground h-10 w-10" />}
        title="No levels defined"
        description="This track does not have any progressive levels yet."
        action={
          canManage ? (
            <Button asChild>
              <Link href={`/app/curriculum/tracks/${track.id}/levels/add`}>
                Add the first level
              </Link>
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {levels.map((level) => (
        <Card key={level.id} className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="px-3 py-1 text-sm">
              Level {level.order}
            </Badge>
            <div>
              <h4 className="text-lg font-semibold">{level.name}</h4>
              {level.min_age !== undefined && level.min_age !== null && (
                <p className="text-muted-foreground text-sm">Min Age: {level.min_age}</p>
              )}
            </div>
          </div>
          {canManage && (
            <Button asChild variant="ghost" size="sm">
              <Link href={`/app/curriculum/tracks/${track.id}/levels/${level.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          )}
        </Card>
      ))}
    </div>
  );
}
