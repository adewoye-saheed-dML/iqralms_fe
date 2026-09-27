import { PageHeader } from '@/components/ui/page-header';
import { BookingForm } from '@/features/scheduling/components/booking-form';

export default function BookSessionPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Request a Class Session"
        description="Select your curriculum level and requested class time window."
        backHref="/app/scheduling"
        backLabel="Back to Scheduling"
      />
      <BookingForm />
    </div>
  );
}
