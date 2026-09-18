import { PageHeader } from '@/components/ui/page-header';
import { FinanceDashboard } from '@/features/finance/components/finance-dashboard';

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Academy Finance"
        description="Manage pricing agreements, teacher payouts, and academy-wide financial statements."
      />
      <FinanceDashboard />
    </div>
  );
}
