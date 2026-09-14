import { PageHeader } from '@/components/ui/page-header';
import { PayoutsDashboard } from '@/features/payouts/components/payouts-dashboard';

export default function PayoutsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Payouts & Statements"
        description="View payout statements, track finalized payments, and manage generated payouts."
      />
      <PayoutsDashboard />
    </div>
  );
}
