/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StudentsPlaceholder } from '../components/students-placeholder';
import * as AcademyProvider from '@/lib/academy/academy-provider';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('StudentsPlaceholder', () => {
  it('renders missing context error if no active academy', () => {
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: null,
      activeRole: null,
    } as any);

    render(<StudentsPlaceholder />);
    expect(screen.getByText('No Academy Context')).toBeInTheDocument();
  });

  it('renders backend contract required message', () => {
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: { id: 1 },
      activeRole: 'owner',
    } as any);

    render(<StudentsPlaceholder />);
    expect(screen.getByText('Backend Contract Required')).toBeInTheDocument();
    expect(screen.getByText('Student Directory Unavailable')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Return to Dashboard/i })).toHaveAttribute(
      'href',
      '/app/dashboard'
    );
  });
});
