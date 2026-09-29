import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PasswordInput } from '../password-input';

describe('PasswordInput', () => {
  it('renders input with type="password" by default and show password button', () => {
    render(<PasswordInput placeholder="Enter password" />);

    const input = screen.getByPlaceholderText('Enter password');
    expect(input).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByRole('button', { name: /show password/i });
    expect(toggleButton).toBeInTheDocument();
  });

  it('toggles password visibility when the eye button is clicked', () => {
    render(<PasswordInput placeholder="Enter password" />);

    const input = screen.getByPlaceholderText('Enter password');
    const toggleButton = screen.getByRole('button', { name: /show password/i });

    // Click to show password
    fireEvent.click(toggleButton);
    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();

    // Click to hide password
    fireEvent.click(screen.getByRole('button', { name: /hide password/i }));
    expect(input).toHaveAttribute('type', 'password');
    expect(screen.getByRole('button', { name: /show password/i })).toBeInTheDocument();
  });

  it('can disable toggle button when showToggle is false', () => {
    render(<PasswordInput placeholder="Enter password" showToggle={false} />);

    const input = screen.getByPlaceholderText('Enter password');
    expect(input).toHaveAttribute('type', 'password');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
