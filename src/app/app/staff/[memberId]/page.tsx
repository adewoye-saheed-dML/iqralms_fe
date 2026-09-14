import { Metadata } from 'next';
import { StaffDetail } from '@/features/staff/components/staff-detail';

export const metadata: Metadata = {
  title: 'Staff Member - Quran Academy',
};

interface PageProps {
  params: {
    memberId: string;
  };
}

export default function StaffMemberPage({ params }: PageProps) {
  const memberId = parseInt(params.memberId, 10);

  if (isNaN(memberId)) {
    return <div>Invalid member ID</div>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <StaffDetail memberId={memberId} />
    </div>
  );
}
