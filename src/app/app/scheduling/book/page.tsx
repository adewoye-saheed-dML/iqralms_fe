import { PageHeader } from '@/components/ui/page-header';
import { BookingForm } from '@/features/scheduling/components/booking-form';

export default function BookSessionPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Book a Session"
        description="Schedule a new session with a teacher."
      />
      <BookingForm />
    </div>
  );
}
