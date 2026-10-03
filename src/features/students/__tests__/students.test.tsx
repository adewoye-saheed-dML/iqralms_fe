'use client';

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
    getMyStudents: vi.fn(),
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
    vi.mocked(studentsApi.getMyStudents).mockResolvedValue([]);
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: mockAcademy,
      activeRole: 'admin',
    } as any);
  });

  describe('StudentDirectory', () => {
    it('list request succeeds for allowed academy manager', async () => {
      vi.mocked(studentsApi.getStudents).mockResolvedValue([
        {
          id: 10,
          user_id: 100,
          username: 'teststudent',
          email: 'test@example.com',
          first_name: '',
          last_name: '',
          date_of_birth: '2010-01-01',
          is_minor: true,
          enrollment_status: 'active',
          track_id: null,
          level_id: null,
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
      ]);

      renderWithProviders(<StudentDirectory />);

      await waitFor(() => {
        expect(screen.getByText('teststudent')).toBeInTheDocument();
      });
      expect(screen.getByText('active')).toBeInTheDocument();
    });

    it('conceals student email from teachers and displays username handle instead', async () => {
      vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
        activeAcademy: mockAcademy,
        activeRole: 'teacher',
      } as any);

      vi.mocked(studentsApi.getMyStudents).mockResolvedValue([
        {
          id: 10,
          user_id: 100,
          username: 'zayd_student',
          email: 'zayd@secretmail.com',
          first_name: 'Zayd',
          last_name: 'Student',
          date_of_birth: '2010-01-01',
          is_minor: true,
          enrollment_status: 'active',
          track_id: null,
          level_id: null,
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
      ]);

      renderWithProviders(<StudentDirectory />);

      await waitFor(() => {
        expect(screen.getByText('Zayd Student')).toBeInTheDocument();
      });

      // Email must not appear in the document for teachers
      expect(screen.queryByText('zayd@secretmail.com')).not.toBeInTheDocument();
      // Username handle is shown instead
      expect(screen.getByText('@zayd_student')).toBeInTheDocument();
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
      vi.mocked(studentsApi.addStudent).mockResolvedValue({
        id: 1,
        user_id: 123,
        username: 'student123',
        email: 'student123@example.com',
        first_name: '',
        last_name: '',
        date_of_birth: '2010-01-01',
        is_minor: true,
        enrollment_status: 'active',
        track_id: null,
        level_id: null,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      });
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
        user_id: 200,
        username: 'jane',
        email: 'jane@example.com',
        first_name: '',
        last_name: '',
        date_of_birth: '2010-01-01',
        is_minor: true,
        enrollment_status: 'active',
        track_id: null,
        level_id: null,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      });
      renderWithProviders(<StudentDetail enrollmentId={5} />);

      await waitFor(() => {
        expect(screen.getByText('jane')).toBeInTheDocument();
      });
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
        user_id: 200,
        username: 'jane',
        email: 'jane@example.com',
        first_name: '',
        last_name: '',
        date_of_birth: '2010-01-01',
        is_minor: true,
        enrollment_status: 'active',
        track_id: null,
        level_id: null,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
      });
      vi.mocked(studentsApi.updateStudentStatus).mockResolvedValue({
        id: 5,
        user_id: 200,
        username: 'jane',
        email: 'jane@example.com',
        first_name: '',
        last_name: '',
        date_of_birth: '2010-01-01',
        is_minor: true,
        enrollment_status: 'inactive',
        track_id: null,
        level_id: null,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
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
        user_id: 200,
        username: 'jane',
        email: 'jane@example.com',
        first_name: '',
        last_name: '',
        date_of_birth: '2010-01-01',
        is_minor: true,
        enrollment_status: 'active',
        track_id: null,
        level_id: null,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z',
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

    it('renders full student profile details including full name, subject registered, level, and demographics', async () => {
      vi.mocked(studentsApi.getStudent).mockResolvedValue({
        id: 15,
        user_id: 300,
        username: 'zayd_ali',
        email: 'zayd@example.com',
        first_name: 'Zayd',
        last_name: 'Ali',
        date_of_birth: '2016-05-15',
        is_minor: true,
        enrollment_status: 'active',
        track_id: 2,
        level_id: 4,
        created_at: '2026-03-01T10:00:00Z',
        updated_at: '2026-03-05T12:00:00Z',
      });

      renderWithProviders(<StudentDetail enrollmentId={15} />);

      await waitFor(() => {
        // Full Name (appears in header and personal details)
        expect(screen.getAllByText('Zayd Ali').length).toBeGreaterThanOrEqual(1);
        // Username (appears in header metadata and personal details card)
        expect(screen.getAllByText(/zayd_ali/).length).toBeGreaterThanOrEqual(1);
        // Email
        expect(screen.getAllByText('zayd@example.com').length).toBeGreaterThanOrEqual(1);
        // Demographic
        expect(screen.getByText('Minor (Under 18)')).toBeInTheDocument();
        // Date of birth
        expect(screen.getByText('2016-05-15')).toBeInTheDocument();
        // Subject Registered card title
        expect(screen.getByText('Registered Subject & Track')).toBeInTheDocument();
        // Academic Performance section
        expect(screen.getByText('Academic Performance & Submissions')).toBeInTheDocument();
      });
    });

    it('protects student email and date of birth when viewed by a teacher', async () => {
      vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
        activeAcademy: mockAcademy,
        activeRole: 'teacher',
      } as any);

      vi.mocked(studentsApi.getStudent).mockResolvedValue({
        id: 15,
        user_id: 300,
        username: 'zayd_ali',
        email: 'zayd@example.com',
        first_name: 'Zayd',
        last_name: 'Ali',
        date_of_birth: '2016-05-15',
        is_minor: true,
        enrollment_status: 'active',
        track_id: 2,
        level_id: 4,
        created_at: '2026-03-01T10:00:00Z',
        updated_at: '2026-03-05T12:00:00Z',
      });

      renderWithProviders(<StudentDetail enrollmentId={15} />);

      await waitFor(() => {
        expect(screen.getAllByText('Zayd Ali').length).toBeGreaterThanOrEqual(1);
      });

      // Email must NOT be disclosed to teacher
      expect(screen.queryByText('zayd@example.com')).not.toBeInTheDocument();
      expect(screen.getByText('Protected by academy privacy policy')).toBeInTheDocument();

      // Date of birth must NOT be disclosed to teacher
      expect(screen.queryByText('2016-05-15')).not.toBeInTheDocument();
      expect(screen.getByText('Protected')).toBeInTheDocument();

      // Subject allocation management button must not be visible to teachers
      expect(screen.queryByText('Subject Allocation')).not.toBeInTheDocument();
    });
  });
});
