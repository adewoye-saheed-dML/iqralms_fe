import { PageHeader } from '@/components/ui/page-header';
import { MyStatementView } from '@/features/payouts/components/my-statement-view';

export default function PayoutsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Earnings"
        description="View your personal payout statements and earnings."
      />
      <MyStatementView />
    </div>
  );
}
