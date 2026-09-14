import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Alert, AlertTitle, AlertDescription } from '../alert';

describe('Alert', () => {
  it('renders correctly', () => {
    render(
      <Alert>
        <AlertTitle>Notice</AlertTitle>
        <AlertDescription>This is a notice</AlertDescription>
      </Alert>
    );
    
    expect(screen.getByText('Notice')).toBeInTheDocument();
    expect(screen.getByText('This is a notice')).toBeInTheDocument();
  });

  it('supports variants', () => {
    render(
      <Alert variant="destructive" data-testid="alert">
        <AlertTitle>Error</AlertTitle>
      </Alert>
    );
    expect(screen.getByTestId('alert')).toHaveClass('text-destructive');
  });
});
