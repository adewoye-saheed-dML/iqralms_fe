/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StudentDirectory } from '../components/student-directory';
import { AddStudentForm } from '../components/add-student-form';
import { StudentDetail } from '../components/student-detail';
import * as AcademyProvider from '@/lib/academy/academy-provider';
import { studentsApi } from '../api/students';
import { ApiError } from '@/lib/api/errors';
import { act } from 'react';

// Mock navigation
const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

// Mock Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid="mock-link">
      {children}
    </a>
  ),
}));

// Mock API
vi.mock('../api/students', () => ({
  studentsApi: {
    getStudents: vi.fn(),
    getStudent: vi.fn(),
    addStudent: vi.fn(),
    updateStudentStatus: vi.fn(),
  },
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('Student Management', () => {
  const mockAcademy = { id: 1, name: 'Test Academy' };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: mockAcademy,
      activeRole: 'admin',
    } as any);
  });

  describe('StudentDirectory', () => {
    it('list request succeeds for allowed academy manager', async () => {
      vi.mocked(studentsApi.getStudents).mockResolvedValue([
        { id: 10, user: 100, username: 'teststudent', status: 'active' },
      ]);

      renderWithProviders(<StudentDirectory />);

      await waitFor(() => {
        expect(screen.getByText('teststudent')).toBeInTheDocument();
      });
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('active')).toBeInTheDocument();
    });

    it('list handles empty academy', async () => {
      vi.mocked(studentsApi.getStudents).mockResolvedValue([]);

      renderWithProviders(<StudentDirectory />);

      await waitFor(() => {
        expect(screen.getByText('No students enrolled yet.')).toBeInTheDocument();
      });
    });

    it('list handles API error', async () => {
      vi.mocked(studentsApi.getStudents).mockRejectedValue(new Error('Network Error'));

      renderWithProviders(<StudentDirectory />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load students')).toBeInTheDocument();
      });
      expect(screen.getByText('Network Error')).toBeInTheDocument();
    });
  });

  describe('AddStudentForm', () => {
    it('add student succeeds', async () => {
      vi.mocked(studentsApi.addStudent).mockResolvedValue(undefined);
      renderWithProviders(<AddStudentForm />);

      const input = screen.getByLabelText('User ID');
      fireEvent.change(input, { target: { value: '123' } });

      const submitBtn = screen.getByRole('button', { name: 'Enroll Student' });
      await act(async () => {
        fireEvent.click(submitBtn);
      });

      expect(studentsApi.addStudent).toHaveBeenCalledWith(1, { user: 123 });
      expect(pushMock).toHaveBeenCalledWith('/app/students');
    });

    it('add unknown user shows validation error', async () => {
      vi.mocked(studentsApi.addStudent).mockRejectedValue(
        new ApiError(400, 'Bad Request', { user: ['Invalid user.'] })
      );
      renderWithProviders(<AddStudentForm />);

      fireEvent.change(screen.getByLabelText('User ID'), { target: { value: '999' } });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Enroll Student' }));
      });

      await waitFor(() =>
        expect(screen.getByText('User error: Invalid user.')).toBeInTheDocument()
      );
    });

    it('add already-enrolled student shows conflict/validation', async () => {
      vi.mocked(studentsApi.addStudent).mockRejectedValue(
        new ApiError(400, 'Bad Request', { non_field_errors: ['Student already enrolled.'] })
      );
      renderWithProviders(<AddStudentForm />);

      fireEvent.change(screen.getByLabelText('User ID'), { target: { value: '123' } });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Enroll Student' }));
      });

      await waitFor(() =>
        expect(screen.getByText('Student already enrolled.')).toBeInTheDocument()
      );
    });
  });

  describe('StudentDetail', () => {
    it('detail request succeeds', async () => {
      vi.mocked(studentsApi.getStudent).mockResolvedValue({
        id: 5,
        user: 200,
        username: 'jane',
        status: 'active',
      });
      renderWithProviders(<StudentDetail enrollmentId={5} />);

      await waitFor(() => {
        expect(screen.getByText('jane')).toBeInTheDocument();
      });
      expect(screen.getByText('200')).toBeInTheDocument();
    });

    it('detail handles 404', async () => {
      vi.mocked(studentsApi.getStudent).mockRejectedValue(new ApiError(404, 'Not found'));
      renderWithProviders(<StudentDetail enrollmentId={5} />);

      await waitFor(() => {
        expect(screen.getByText('Student Not Found')).toBeInTheDocument();
      });
    });

    it('update status succeeds', async () => {
      vi.mocked(studentsApi.getStudent).mockResolvedValue({
        id: 5,
        user: 200,
        username: 'jane',
        status: 'active',
      });
      vi.mocked(studentsApi.updateStudentStatus).mockResolvedValue({
        id: 5,
        user: 200,
        username: 'jane',
        status: 'inactive',
      });
      renderWithProviders(<StudentDetail enrollmentId={5} />);

      await waitFor(() => {
        expect(screen.getByText('jane')).toBeInTheDocument();
      });

      // Open select
      fireEvent.click(screen.getByRole('combobox', { name: 'Enrollment Status' }));
      // Select inactive
      fireEvent.click(screen.getByRole('option', { name: 'Inactive' }));

      // Save
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));
      });

      expect(studentsApi.updateStudentStatus).toHaveBeenCalledWith(1, 5, { status: 'inactive' });
      expect(screen.getByText('Enrollment status updated successfully.')).toBeInTheDocument();
    });

    it('forbidden mutation is handled', async () => {
      vi.mocked(studentsApi.getStudent).mockResolvedValue({
        id: 5,
        user: 200,
        username: 'jane',
        status: 'active',
      });
      vi.mocked(studentsApi.updateStudentStatus).mockRejectedValue(new ApiError(403, 'Forbidden'));
      renderWithProviders(<StudentDetail enrollmentId={5} />);

      await waitFor(() => {
        expect(screen.getByText('jane')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('combobox', { name: 'Enrollment Status' }));
      fireEvent.click(screen.getByRole('option', { name: 'Inactive' }));

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Save' }));
      });

      await waitFor(() => {
        expect(
          screen.getByText('You do not have permission to manage this student.')
        ).toBeInTheDocument();
      });
    });
  });
});
