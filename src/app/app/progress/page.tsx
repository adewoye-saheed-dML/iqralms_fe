import { PageHeader } from '@/components/ui/page-header';
import { ProgressDashboard } from '@/features/progress/components/progress-dashboard';

export default function ProgressPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning Progress"
        description="Track learning journeys, completion metrics, and snapshots over time."
      />
      <ProgressDashboard />
    </div>
  );
}
