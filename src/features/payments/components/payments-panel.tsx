'use client';

import * as React from 'react';
import { useAcademy } from '@/lib/academy/academy-provider';
import { useAuth } from '@/lib/auth/auth-provider';
import { useQuery } from '@tanstack/react-query';
import { familyApi } from '@/features/family/api/family';
import { familyKeys } from '@/lib/api/query-keys';
import { can } from '@/lib/permissions/capabilities';
import { PaymentInitiateCard } from './payment-initiate-card';
import { PaymentHistoryList } from './payment-history-list';
import type { FamilyPayment } from '../api/payments';
import { LoadingState } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { Button } from '@/components/ui/button';
import { Users, CreditCard } from 'lucide-react';

export function PaymentsPanel() {
  const { activeAcademy, activeRole, isLoading: isAcademyLoading } = useAcademy();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [selectedChildIdState, setSelectedChildId] = React.useState<number | null>(null);
  const [childPayments, setChildPayments] = React.useState<FamilyPayment[]>([]);

  const isMinor = !!user?.is_minor;
  const isParent = user?.role === 'parent' || activeRole === 'parent';

  // Permission check
  const canViewOwnPayments = can('view_own_payments', {
    activeRole,
    userRole: user?.role,
  });

  const organizationId = activeAcademy?.id;

  // For parent: fetch linked children
  const { data: children = [], isLoading: isChildrenLoading } = useQuery({
    queryKey: organizationId ? familyKeys.academy(organizationId) : familyKeys.mine(),
    queryFn: () => (organizationId ? familyApi.getAcademyChildren(organizationId) : familyApi.getMyChildren()),
    enabled: isParent && !!user,
  });

  const selectedChildId = selectedChildIdState ?? (isParent && children.length > 0 ? children[0].id : null);

  if (isAcademyLoading || isAuthLoading || (isParent && isChildrenLoading)) {
    return (
      <div className="py-12">
        <LoadingState />
      </div>
    );
  }

  // Acceptance Criterion 5: Minor student has no payment affordance anywhere unconditionally
  if (isMinor) {
    return (
      <ErrorState
        title="Access Restricted"
        message="Minor students do not have financial access. All tuition settlements are managed by your parent or guardian."
      />
    );
  }

  if (!canViewOwnPayments && !isParent) {
    return (
      <ErrorState
        title="Access Denied"
        message="Only adult students and parents can access tuition payments."
      />
    );
  }

  if (!organizationId) {
    return (
      <ErrorState
        title="No Active Academy"
        message="Please select or join an academy to view and settle tuition."
      />
    );
  }

  const selectedChild = children.find((c) => c.id === selectedChildId);

  return (
    <div className="space-y-8 max-w-5xl pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-primary" />
          Tuition Payments
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isParent
            ? "Manage and pay tuition for your children enrolled in this academy."
            : "Review your enrolled tuition plan, outstanding balance, and transaction history."}
        </p>
      </div>

      {isParent && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Select Student</h2>
          </div>

          {children.length === 0 ? (
            <div className="rounded-md border p-4 bg-muted/20 text-xs text-muted-foreground">
              No linked children found in this academy. Please link your child via invitation or student code.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {children.map((child) => (
                <Button
                  key={child.id}
                  variant={selectedChildId === child.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedChildId(child.id)}
                  className="text-xs"
                >
                  {child.first_name ? `${child.first_name} ${child.last_name || ''}` : child.username}
                  {child.username && <span className="opacity-75 text-[11px] ml-1">(@{child.username})</span>}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payment Initiation Card */}
      {(!isParent || (isParent && selectedChildId)) && (
        <PaymentInitiateCard
          organizationId={organizationId}
          studentId={isParent ? selectedChildId ?? undefined : undefined}
          studentName={isParent && selectedChild ? `${selectedChild.first_name || ''} ${selectedChild.last_name || selectedChild.username}`.trim() : undefined}
          isParent={isParent}
          recentChildPayments={childPayments}
        />
      )}

      {/* Payment History List */}
      <PaymentHistoryList
        academyId={organizationId}
        scope={isParent ? 'children' : 'mine'}
        studentId={isParent ? selectedChildId ?? undefined : undefined}
        onPaymentsLoaded={setChildPayments}
      />
    </div>
  );
}
