import { PageHeader } from '@/components/ui/page-header';
import { PricingDashboard } from '@/features/pricing/components/pricing-dashboard';

export default function PricingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pricing Agreements"
        description="View and manage pricing agreements for curriculum levels."
      />
      <PricingDashboard />
    </div>
  );
}
