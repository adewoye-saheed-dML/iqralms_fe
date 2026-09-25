'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  assessmentApi,
  AssessmentRubric,
  AssessmentRubricCreate,
} from '../api/assessment';
import { curriculumApi } from '@/features/curriculum/api/curriculum';
import { useAcademy } from '@/lib/academy/academy-provider';
import { LoadingState } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookOpen, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { ApiError } from '@/lib/api/errors';

export function RubricsList() {
  const { activeAcademy } = useAcademy();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = React.useState(false);

  // Form State
  const [trackId, setTrackId] = React.useState<string>('');
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [criteria, setCriteria] = React.useState<
    Array<{ name: string; description: string; weight: number; max_score: number }>
  >([
    { name: 'Tajweed Rules', description: 'Accuracy in makharij and sifat', weight: 1, max_score: 5 },
    { name: 'Fluency & Flow', description: 'Smoothness and pacing', weight: 1, max_score: 5 },
  ]);
  const [formError, setFormError] = React.useState<string | null>(null);

  const {
    data: rubrics = [],
    isLoading,
    error,
    refetch,
  } = useQuery<AssessmentRubric[]>({
    queryKey: ['assessment', activeAcademy?.id, 'rubrics'],
    queryFn: () => {
      if (!activeAcademy?.id) throw new Error('No active academy');
      return assessmentApi.getRubrics(activeAcademy.id);
    },
    enabled: !!activeAcademy?.id,
  });

  const { data: tracks = [] } = useQuery({
    queryKey: ['curriculum', activeAcademy?.id, 'tracks'],
    queryFn: () => {
      if (!activeAcademy?.id) return [];
      return curriculumApi.getTracks(activeAcademy.id);
    },
    enabled: !!activeAcademy?.id && showCreateForm,
  });

  const createMutation = useMutation({
    mutationFn: (payload: AssessmentRubricCreate) => {
      if (!activeAcademy?.id) throw new Error('No active academy');
      return assessmentApi.createRubric(activeAcademy.id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment', activeAcademy?.id, 'rubrics'] });
      setShowCreateForm(false);
      setName('');
      setDescription('');
      setFormError(null);
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        setFormError(err.message || 'Failed to create rubric');
      } else {
        setFormError('An unexpected error occurred');
      }
    },
  });

  const handleAddCriterion = () => {
    setCriteria([...criteria, { name: '', description: '', weight: 1, max_score: 5 }]);
  };

  const handleRemoveCriterion = (index: number) => {
    if (criteria.length <= 1) return;
    setCriteria(criteria.filter((_, i) => i !== index));
  };

  const handleCriterionChange = (
    index: number,
    field: 'name' | 'description' | 'weight' | 'max_score',
    value: string | number
  ) => {
    const updated = [...criteria];
    updated[index] = { ...updated[index], [field]: value };
    setCriteria(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackId) {
      setFormError('Please select a track');
      return;
    }
    if (!name.trim()) {
      setFormError('Rubric name is required');
      return;
    }
    if (criteria.some((c) => !c.name.trim())) {
      setFormError('All criteria must have a name');
      return;
    }

    createMutation.mutate({
      track: Number(trackId),
      name: name.trim(),
      description: description.trim(),
      criteria: criteria.map((c) => ({
        name: c.name.trim(),
        description: c.description.trim(),
        weight: Number(c.weight) || 1,
        max_score: Number(c.max_score) || 5,
      })),
    });
  };

  if (isLoading) return <LoadingState />;

  if (error) {
    if (error instanceof ApiError && error.status === 403) {
      return (
        <ErrorState
          title="Access Denied"
          message="You don't have permission to view or manage assessment rubrics."
        />
      );
    }
    return (
      <ErrorState
        title="Failed to load rubrics"
        message={error.message || 'An error occurred'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium">Curriculum Rubrics</h2>
          <p className="text-sm text-muted-foreground">
            Rubrics establish the evaluation criteria and scoring standards for student assessments.
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="mr-2 h-4 w-4" />
          {showCreateForm ? 'Cancel' : 'New Rubric'}
        </Button>
      </div>

      {showCreateForm && (
        <Card className="border-primary/40 bg-card">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Create Assessment Rubric</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 text-sm rounded bg-destructive/10 text-destructive">
                  {formError}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="track-select">Track</Label>
                  <Select value={trackId} onValueChange={setTrackId}>
                    <SelectTrigger id="track-select">
                      <SelectValue placeholder="Select track..." />
                    </SelectTrigger>
                    <SelectContent>
                      {tracks.map((t) => (
                        <SelectItem key={t.id} value={String(t.id)}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rubric-name">Rubric Name</Label>
                  <Input
                    id="rubric-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Standard Quran Recitation Rubric"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rubric-desc">Description (Optional)</Label>
                <Textarea
                  id="rubric-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain the scoring criteria expectations..."
                  rows={2}
                />
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <Label className="font-semibold">Evaluation Criteria</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCriterion}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" /> Add Criterion
                  </Button>
                </div>

                <div className="space-y-3">
                  {criteria.map((crit, idx) => (
                    <div
                      key={idx}
                      className="p-3 border rounded-lg bg-muted/30 grid gap-3 md:grid-cols-12 items-start"
                    >
                      <div className="md:col-span-4 space-y-1">
                        <Label className="text-xs">Criterion Name</Label>
                        <Input
                          placeholder="e.g. Pronunciation"
                          value={crit.name}
                          onChange={(e) =>
                            handleCriterionChange(idx, 'name', e.target.value)
                          }
                          required
                        />
                      </div>
                      <div className="md:col-span-5 space-y-1">
                        <Label className="text-xs">Description</Label>
                        <Input
                          placeholder="Evaluation details"
                          value={crit.description}
                          onChange={(e) =>
                            handleCriterionChange(idx, 'description', e.target.value)
                          }
                        />
                      </div>
                      <div className="md:col-span-2 space-y-1">
                        <Label className="text-xs">Max Score</Label>
                        <Input
                          type="number"
                          min={1}
                          max={100}
                          value={crit.max_score}
                          onChange={(e) =>
                            handleCriterionChange(idx, 'max_score', Number(e.target.value))
                          }
                          required
                        />
                      </div>
                      <div className="md:col-span-1 pt-6 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive h-9 w-9"
                          onClick={() => handleRemoveCriterion(idx)}
                          disabled={criteria.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Saving...' : 'Save Rubric'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {rubrics.length === 0 ? (
        <EmptyState
          title="No rubrics defined"
          description="Create your first assessment rubric to establish grading standards."
          icon={<BookOpen className="h-10 w-10 text-muted-foreground" />}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rubrics.map((rubric) => (
            <Card key={rubric.id} className={!rubric.active ? 'opacity-70' : ''}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base font-semibold">{rubric.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">Track: {rubric.track}</p>
                  </div>
                  <Badge variant={rubric.active ? 'default' : 'secondary'}>
                    {rubric.active ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </span>
                    ) : (
                      'Superseded'
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {rubric.description && (
                  <p className="text-xs text-muted-foreground">{rubric.description}</p>
                )}

                <div className="space-y-1.5 pt-1">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Criteria ({rubric.active_criteria?.length ?? rubric.criteria?.length ?? 0}):
                  </span>
                  <div className="space-y-1">
                    {(rubric.active_criteria ?? rubric.criteria ?? []).map((crit) => (
                      <div
                        key={crit.id}
                        className="flex justify-between items-center text-xs p-1.5 bg-muted/40 rounded"
                      >
                        <div>
                          <span className="font-medium">{crit.name}</span>
                          {crit.description && (
                            <span className="text-muted-foreground block text-[11px]">
                              {crit.description}
                            </span>
                          )}
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          Order: {crit.order}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
