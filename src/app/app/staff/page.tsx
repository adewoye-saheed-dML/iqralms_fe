import { Metadata } from 'next';
import { PageHeader } from '@/components/ui/page-header';
import { StaffDirectory } from '@/features/staff/components/staff-directory';

export const metadata: Metadata = {
  title: 'Staff Directory - Quran Academy',
  description: 'Manage teachers and staff members.',
};

export default function StaffPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Teacher & Staff Directory"
        description="View and manage the people who operate this academy."
      />
      <StaffDirectory />
    </div>
  );
}
