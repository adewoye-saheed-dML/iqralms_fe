import { PageHeader } from '@/components/ui/page-header';
import { SchedulingDashboard } from '@/features/scheduling/components/scheduling-dashboard';

export default function SchedulingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Scheduling"
        description="Manage your bookings, availability, and waitlists."
      />
      <SchedulingDashboard />
    </div>
  );
}
