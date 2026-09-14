import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ErrorState } from '../error-state';

describe('ErrorState', () => {
  it('renders default error message', () => {
    render(<ErrorState />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders custom title and message', () => {
    render(<ErrorState title="Custom Error" message="This is a specific error" />);
    expect(screen.getByText('Custom Error')).toBeInTheDocument();
    expect(screen.getByText('This is a specific error')).toBeInTheDocument();
  });
});
