import { PageHeader } from '@/components/ui/page-header';
import { NotificationsDashboard } from '@/features/notifications/components/notifications-dashboard';

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="View your recent alerts, updates, and messages."
      />
      <NotificationsDashboard />
    </div>
  );
}
