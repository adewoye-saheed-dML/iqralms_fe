import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterPage from '../page';

const mockPush = vi.fn();
const mockRegister = vi.fn();
let mockUser: any = null;
let mockIsLoading = false;

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('@/lib/auth/auth-provider', () => ({
  useAuth: () => ({
    user: mockUser,
    isLoading: mockIsLoading,
    register: mockRegister,
  }),
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = null;
    mockIsLoading = false;
  });

  it('renders student registration form with age field and no parent email initially', () => {
    render(<RegisterPage />);

    expect(screen.getByText('Student Registration')).toBeInTheDocument();
    expect(screen.getByLabelText('First name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Age')).toBeInTheDocument();
    expect(screen.queryByLabelText('Parent / Guardian Email')).not.toBeInTheDocument();
  });

  it('conditionally reveals Parent / Guardian Email when age is under 18', () => {
    render(<RegisterPage />);

    const ageInput = screen.getByLabelText('Age');
    fireEvent.change(ageInput, { target: { value: '15' } });

    expect(screen.getByLabelText('Parent / Guardian Email')).toBeInTheDocument();

    // If age changed to 18 or above, parent email field is hidden
    fireEvent.change(ageInput, { target: { value: '18' } });
    expect(screen.queryByLabelText('Parent / Guardian Email')).not.toBeInTheDocument();
  });

  it('prevents submission when passwords do not match', async () => {
    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Ali' } });
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Khan' } });
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'ali@example.com' } });
    fireEvent.change(screen.getByLabelText('Age'), { target: { value: '15' } });
    fireEvent.change(screen.getByLabelText('Parent / Guardian Email'), { target: { value: 'parent@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'DifferentPassword123!' } });

    fireEvent.click(screen.getByRole('button', { name: /complete student registration/i }));

    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows error when minor student submits without parent email', async () => {
    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Ali' } });
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Khan' } });
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'ali@example.com' } });
    fireEvent.change(screen.getByLabelText('Age'), { target: { value: '12' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'Password123!' } });

    fireEvent.click(screen.getByRole('button', { name: /complete student registration/i }));

    expect(await screen.findByText('Parent or guardian email is required for minor students.')).toBeInTheDocument();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('successfully registers minor student and displays parent invitation confirmation', async () => {
    mockRegister.mockResolvedValueOnce({
      user: {
        id: 10,
        username: 'ali123',
        email: 'ali@example.com',
        role: 'student',
        is_minor: true,
        signup_code: 'CODE-9876',
      },
      status: 'pending_parent_link',
      detail: 'Account created. An invitation email has been sent to your parent.',
    });

    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Ali' } });
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Khan' } });
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'ali@example.com' } });
    fireEvent.change(screen.getByLabelText('Age'), { target: { value: '14' } });
    fireEvent.change(screen.getByLabelText('Parent / Guardian Email'), { target: { value: 'parent@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'Password123!' } });

    fireEvent.click(screen.getByRole('button', { name: /complete student registration/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        expect.objectContaining({
          first_name: 'Ali',
          last_name: 'Khan',
          email: 'ali@example.com',
          role: 'student',
          age: 14,
          parent_email: 'parent@example.com',
          password: 'Password123!',
        })
      );
    });

    expect(await screen.findByText('Registration Successful!')).toBeInTheDocument();
    expect(screen.getByText('Parent Invitation Sent')).toBeInTheDocument();
    expect(screen.getByText('parent@example.com')).toBeInTheDocument();
    expect(screen.getByText('CODE-9876')).toBeInTheDocument();
  });
});
