import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationsDashboard } from '../components/notifications-dashboard';
import { notificationsApi } from '../api/notifications';
import { useAcademy } from '@/lib/academy/academy-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/errors';

vi.mock('@/lib/academy/academy-provider', () => ({
  useAcademy: vi.fn(),
}));

vi.mock('../api/notifications', () => ({
  notificationsApi: {
    getMyNotifications: vi.fn(),
    getAdminNotifications: vi.fn(),
    getDeliveries: vi.fn(),
    markAsRead: vi.fn(),
  },
}));

function renderWithProviders(ui: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('Notifications Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Member Role', () => {
    beforeEach(() => {
      vi.mocked(useAcademy).mockReturnValue({
        activeAcademy: { id: 1, name: 'Test Academy' },
        activeRole: 'student',
      } as any);
    });

    it('renders empty notifications', async () => {
      vi.mocked(notificationsApi.getMyNotifications).mockResolvedValue([]);
      
      renderWithProviders(<NotificationsDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('No notifications')).toBeInTheDocument();
      });
    });

    it('renders my notifications and unread filter works', async () => {
      vi.mocked(notificationsApi.getMyNotifications).mockResolvedValue([
        {
          id: 1,
          title: 'Class Cancelled',
          summary: 'Your class was cancelled',
          is_read: false,
          created_at: '2023-01-01T10:00:00Z',
          event_type_display: 'Booking Cancelled',
        } as any
      ]);
      
      renderWithProviders(<NotificationsDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Class Cancelled')).toBeInTheDocument();
        expect(screen.getByText('Your class was cancelled')).toBeInTheDocument();
        expect(screen.getByText('New')).toBeInTheDocument();
      });

      // Filter unread
      const unreadBtn = screen.getByRole('button', { name: 'Show Unread Only' });
      fireEvent.click(unreadBtn);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Show All' })).toBeInTheDocument();
      });
    });

    it('allows marking a notification as read', async () => {
      vi.mocked(notificationsApi.getMyNotifications).mockResolvedValue([
        {
          id: 1,
          title: 'Class Cancelled',
          is_read: false,
          created_at: '2023-01-01T10:00:00Z',
          event_type_display: 'Booking Cancelled',
        } as any
      ]);
      vi.mocked(notificationsApi.markAsRead).mockResolvedValue({} as any);
      
      renderWithProviders(<NotificationsDashboard />);
      
      const markBtn = await screen.findByText('Mark as read');
      fireEvent.click(markBtn);

      await waitFor(() => {
        expect(notificationsApi.markAsRead).toHaveBeenCalledWith(1, 1);
      });
    });
  });

  describe('Admin Role', () => {
    beforeEach(() => {
      vi.mocked(useAcademy).mockReturnValue({
        activeAcademy: { id: 1, name: 'Test Academy' },
        activeRole: 'admin',
      } as any);
    });

    it('renders admin tabs and fetches history', async () => {
      vi.mocked(notificationsApi.getMyNotifications).mockResolvedValue([]);
      vi.mocked(notificationsApi.getAdminNotifications).mockResolvedValue([
        {
          id: 2,
          title: 'Admin Alert',
          recipient_username: 'student1',
          is_read: true,
          created_at: '2023-01-01T10:00:00Z',
          event_type_display: 'Progress Ready',
        } as any
      ]);
      
      renderWithProviders(<NotificationsDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Admin Alert')).toBeInTheDocument();
        expect(screen.getByText('student1')).toBeInTheDocument();
        expect(screen.getByText('Read')).toBeInTheDocument();
      });
    });
  });
});
