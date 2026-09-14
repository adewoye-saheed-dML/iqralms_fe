import { PageHeader } from '@/components/ui/page-header';
import { ImportsDashboard } from '@/features/imports/components/imports-dashboard';

export default function ImportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Bulk Imports"
        description="Upload CSV or XLSX files to bulk import academy records."
      />
      <ImportsDashboard />
    </div>
  );
}
