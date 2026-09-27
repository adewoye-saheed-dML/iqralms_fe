'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { curriculumApi } from '../api/curriculum';
import { curriculumKeys } from '@/lib/api/query-keys';
import { can } from '@/lib/permissions/capabilities';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingState } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Link from 'next/link';
import { BookOpen, Plus, GraduationCap, Headphones, ArrowRight } from 'lucide-react';
import { ApiError } from '@/lib/api/errors';
import { useSearchParams } from 'next/navigation';
import { StudentAllocationsTable } from './student-allocations-table';
import { AudioPlacementTestsPanel } from './audio-placement-tests-panel';
import { PlacementsPanel } from './placements-panel';

export function CurriculumDirectory() {
  const { activeAcademy, activeRole } = useAcademy();

  const searchParams = useSearchParams();
  const tabParam = searchParams?.get('tab') ?? null;

  const initialTab: 'subjects' | 'allocations' | 'placements' =
    tabParam === 'mapping' || tabParam === 'allocations'
      ? 'allocations'
      : tabParam === 'placements'
      ? 'placements'
      : 'subjects';

  const [selectedTab, setSelectedTab] = React.useState<'subjects' | 'allocations' | 'placements' | null>(null);
  const [prevTabParam, setPrevTabParam] = React.useState(tabParam);

  if (tabParam !== prevTabParam) {
    setPrevTabParam(tabParam);
    setSelectedTab(null);
  }

  const activeTab = selectedTab ?? initialTab;

  const handleTabChange = (val: 'subjects' | 'allocations' | 'placements') => {
    setSelectedTab(val);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', val);
      window.history.replaceState(null, '', url.toString());
    }
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: curriculumKeys.tracks(activeAcademy?.id),
    queryFn: () => curriculumApi.getTracks(activeAcademy!.id),
    enabled: !!activeAcademy,
  });

  const { data: levels = [] } = useQuery({
    queryKey: curriculumKeys.levels(activeAcademy?.id),
    queryFn: () => curriculumApi.getLevels(activeAcademy!.id),
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

  // For students or parents who cannot manage curriculum, display their placements interface
  if (!canManageCurriculum) {
    return (
      <div className="space-y-6">
        <AudioPlacementTestsPanel />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Level Curriculum Navigation Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => handleTabChange(val as 'subjects' | 'allocations' | 'placements')}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3 max-w-2xl bg-muted/60 p-1 rounded-xl">
          <TabsTrigger value="subjects" className="text-xs sm:text-sm font-medium flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>Subjects &amp; Levels</span>
          </TabsTrigger>
          <TabsTrigger value="allocations" className="text-xs sm:text-sm font-medium flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            <span>Student-Teacher Mapping</span>
          </TabsTrigger>
          <TabsTrigger value="placements" className="text-xs sm:text-sm font-medium flex items-center gap-2">
            <Headphones className="h-4 w-4" />
            <span>Audio Placement Tests</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: SUBJECTS & PROGRESSIVE LEVELS */}
        <TabsContent value="subjects" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
            <div>
              <h3 className="text-lg font-semibold tracking-tight">Curriculum Subjects (Tracks)</h3>
              <p className="text-xs text-muted-foreground">
                Define the academic subjects taught in this academy and build their sequence of progressive levels.
              </p>
            </div>
            {canManageCurriculum && (
              <Button asChild>
                <Link href="/app/curriculum/tracks/add">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Track
                </Link>
              </Button>
            )}
          </div>

          {tracks.length === 0 ? (
            <div className="space-y-6">
              <EmptyState
                icon={<BookOpen className="text-muted-foreground h-10 w-10" />}
                title="No tracks defined"
                description="Get started by creating the first track for your academy."
                action={
                  canManageCurriculum ? (
                    <Button asChild>
                      <Link href="/app/curriculum/tracks/add">
                        <Plus className="mr-2 h-4 w-4" />
                        Create First Track
                      </Link>
                    </Button>
                  ) : undefined
                }
              />
              <PlacementsPanel />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tracks.map((track) => {
                const trackLevels = levels
                  .filter((l) => l.track === track.id)
                  .sort((a, b) => a.order - b.order);

                return (
                  <Card key={track.id} className="flex flex-col border border-border shadow-sm hover:shadow transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl font-bold">{track.name}</CardTitle>
                          <p className="text-muted-foreground mt-1 font-mono text-xs">{track.slug}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {trackLevels.length} {trackLevels.length === 1 ? 'Level' : 'Levels'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Progressive Levels ({trackLevels.length})
                          </h4>
                          {canManageCurriculum && (
                            <Link
                              href={`/app/curriculum/tracks/${track.id}/levels/add`}
                              className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                            >
                              <Plus className="h-3 w-3" /> Add Level
                            </Link>
                          )}
                        </div>

                        {trackLevels.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {trackLevels.map((level) => (
                              <Badge key={level.id} variant="secondary" className="text-xs">
                                {level.order}. {level.name}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-xs italic">
                            No progressive levels defined yet. Add the first level to start placing students.
                          </p>
                        )}
                      </div>

                      {canManageCurriculum && (
                        <div className="pt-2 border-t flex items-center justify-between">
                          <Button asChild variant="outline" size="sm" className="w-full">
                            <Link href={`/app/curriculum/tracks/${track.id}`} className="flex items-center justify-center gap-1.5">
                              Manage Track &amp; Levels
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* TAB 2: STUDENT LEVEL ALLOCATIONS */}
        <TabsContent value="allocations" className="space-y-6">
          <StudentAllocationsTable />
        </TabsContent>

        {/* TAB 3: AUDIO PLACEMENT TESTS */}
        <TabsContent value="placements" className="space-y-6">
          <AudioPlacementTestsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
