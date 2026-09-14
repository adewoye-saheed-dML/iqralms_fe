import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PageHeader } from '../page-header';

describe('PageHeader', () => {
  it('renders correctly with title and description', () => {
    render(
      <PageHeader
        title="Dashboard"
        description="Welcome to your dashboard"
      />
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Welcome to your dashboard')).toBeInTheDocument();
  });

  it('renders actions', () => {
    render(
      <PageHeader title="Actions" actions={<button>New Action</button>} />
    );
    expect(screen.getByRole('button', { name: /new action/i })).toBeInTheDocument();
  });
});
