'use client';

import * as React from 'react';
import { useAuth } from '@/lib/auth/auth-provider';
import { useAcademy } from '@/lib/academy/academy-provider';
import { can } from '@/lib/permissions/capabilities';
import { PlacementSubmitForm } from './placement-submit-form';
import { PlacementOutcomeList } from './placement-outcome-list';
import { PlacementReviewQueue } from './placement-review-queue';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Mic, Headphones, ClipboardCheck, History } from 'lucide-react';

export function AudioPlacementTestsPanel() {
  const { user } = useAuth();
  const { activeRole } = useAcademy();
  const context = { userRole: user?.role, activeRole };

  const canSubmit = can('submit_placement', context);
  const canReview = can('review_placements', context);
  const isParent = context.userRole === 'parent' || context.activeRole === 'parent';

  const defaultTab = canReview ? 'queue' : canSubmit ? 'submit' : 'history';

  return (
    <div className="space-y-6">
      {/* Informative Guidance Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-foreground">
            <Headphones className="h-5 w-5 text-primary" />
            Audio Placement Tests &amp; Beginner Assessments
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Assess incoming students to determine their ideal starting level. Students can submit
            a recitation audio recording sample (mp3, wav, m4a up to 15 MB) for evaluator review,
            or declare as complete beginners to be placed directly into Level 1 (Foundations).
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue={defaultTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:inline-flex sm:grid-cols-none">
          {canReview && (
            <TabsTrigger value="queue" className="flex items-center gap-1.5 text-xs">
              <ClipboardCheck className="h-3.5 w-3.5" />
              Review Queue
            </TabsTrigger>
          )}
          {canSubmit && (
            <TabsTrigger value="submit" className="flex items-center gap-1.5 text-xs">
              <Mic className="h-3.5 w-3.5" />
              Submit Recitation Test
            </TabsTrigger>
          )}
          <TabsTrigger value="history" className="flex items-center gap-1.5 text-xs">
            <History className="h-3.5 w-3.5" />
            Placement Outcomes
          </TabsTrigger>
        </TabsList>

        {canReview && (
          <TabsContent value="queue" className="space-y-4">
            <PlacementReviewQueue />
          </TabsContent>
        )}

        {canSubmit && (
          <TabsContent value="submit" className="space-y-4">
            <PlacementSubmitForm />
          </TabsContent>
        )}

        <TabsContent value="history" className="space-y-4">
          {canSubmit && <PlacementOutcomeList scope="mine" title="Your Placement Outcomes" />}
          {isParent && <PlacementOutcomeList scope="children" title="Your Children's Placement Outcomes" />}
          {!canSubmit && !isParent && canReview && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Placement History</CardTitle>
                <CardDescription className="text-xs">
                  All evaluated audio assessments and beginner placements are logged and reflected
                  in the Student Allocations directory.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Check the &quot;Student Allocations&quot; tab to see all placed students and their current progressive levels.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
