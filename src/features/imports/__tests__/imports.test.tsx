import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImportsDashboard } from '../components/imports-dashboard';
import { importsApi } from '../api/imports';
import { useAcademy } from '@/lib/academy/academy-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/lib/academy/academy-provider', () => ({
  useAcademy: vi.fn(),
}));

vi.mock('../api/imports', () => ({
  importsApi: {
    validateImport: vi.fn(),
    commitImport: vi.fn(),
  },
}));

function renderWithProviders(ui: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('Imports Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Unauthorized Role', () => {
    beforeEach(() => {
      vi.mocked(useAcademy).mockReturnValue({
        activeAcademy: { id: 1, name: 'Test Academy' },
        activeRole: 'teacher',
      } as any);
    });

    it('renders access denied for non-admin roles', () => {
      renderWithProviders(<ImportsDashboard />);
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });
  });

  describe('Authorized Role', () => {
    beforeEach(() => {
      vi.mocked(useAcademy).mockReturnValue({
        activeAcademy: { id: 1, name: 'Test Academy' },
        activeRole: 'admin',
      } as any);
    });

    it('validates and commits a file', async () => {
      vi.mocked(importsApi.validateImport).mockResolvedValue({
        id: 101,
        status: 'validated',
        row_count: 5,
        valid_row_count: 5,
        invalid_row_count: 0,
        error_count: 0,
      } as any);

      vi.mocked(importsApi.commitImport).mockResolvedValue({
        id: 101,
        status: 'completed',
        row_count: 5,
        valid_row_count: 5,
        invalid_row_count: 0,
        created_count: 3,
        updated_count: 2,
        skipped_count: 0,
        error_count: 0,
        completed_at: '2023-01-01T10:00:00Z',
      } as any);

      renderWithProviders(<ImportsDashboard />);

      // Upload file
      const fileInput = screen.getByLabelText(/File/);
      const file = new File(['name,email\njohn,john@test.com'], 'test.csv', { type: 'text/csv' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      const validateBtn = screen.getByText('Upload & Validate');
      fireEvent.click(validateBtn);

      expect(await screen.findByText(/Validation Result/i)).toBeInTheDocument();
      expect(await screen.findByText(/Ready to commit/i)).toBeInTheDocument();

      // Click commit
      const commitBtn = screen.getByText('Commit Import');
      fireEvent.click(commitBtn);

      expect(await screen.findByText('Import Successful')).toBeInTheDocument();
      // Check commit counts
      expect(screen.getByText('Created:')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument(); // created
    });

    it('renders validation errors properly', async () => {
      vi.mocked(importsApi.validateImport).mockResolvedValue({
        id: 102,
        status: 'failed',
        row_count: 5,
        valid_row_count: 3,
        invalid_row_count: 2,
        error_count: 2,
        error_report: ['Row 2: Missing email', 'Row 4: Invalid date'],
      } as any);

      renderWithProviders(<ImportsDashboard />);

      const fileInput = screen.getByLabelText(/File/);
      const file = new File(['bad data'], 'bad.csv', { type: 'text/csv' });
      fireEvent.change(fileInput, { target: { files: [file] } });

      const validateBtn = screen.getByText('Upload & Validate');
      fireEvent.click(validateBtn);

      await waitFor(() => {
        expect(screen.getByText('Row 2: Missing email')).toBeInTheDocument();
        expect(screen.getByText('Failed')).toBeInTheDocument();
        // Commit shouldn't be available for failed jobs
        expect(screen.queryByText('Commit Import')).not.toBeInTheDocument();
      });
    });
  });
});
