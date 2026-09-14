import { PageHeader } from '@/components/ui/page-header';
import { AssessmentDashboard } from '@/features/assessment/components/assessment-dashboard';

export default function AssessmentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Assessments"
        description="View and manage student assessments."
      />
      <AssessmentDashboard />
    </div>
  );
}
