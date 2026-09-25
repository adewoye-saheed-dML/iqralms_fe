'use client';

import * as React from 'react';
import { useAuth } from '@/lib/auth/auth-provider';
import { useAcademy } from '@/lib/academy/academy-provider';
import { can } from '@/lib/permissions/capabilities';
import { PlacementSubmitForm } from './placement-submit-form';
import { PlacementOutcomeList } from './placement-outcome-list';
import { PlacementReviewQueue } from './placement-review-queue';

/**
 * Journey B (SSoT ssot.md#L526): submit -> teacher/lead reviews -> student/parent
 * sees the outcome. A given login only ever needs one side of that — the
 * capability checks below pick which.
 */
export function PlacementsPanel() {
  const { user } = useAuth();
  const { activeRole } = useAcademy();
  const context = { userRole: user?.role, activeRole };

  const canSubmit = can('submit_placement', context);
  const canReview = can('review_placements', context);
  const isParent = context.userRole === 'parent' || context.activeRole === 'parent';

  if (!canSubmit && !canReview && !isParent) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Placements</h2>

      {canSubmit && (
        <>
          <PlacementSubmitForm />
          <PlacementOutcomeList scope="mine" title="Your placements" />
        </>
      )}

      {isParent && <PlacementOutcomeList scope="children" title="Your children's placements" />}

      {canReview && <PlacementReviewQueue />}
    </div>
  );
}
