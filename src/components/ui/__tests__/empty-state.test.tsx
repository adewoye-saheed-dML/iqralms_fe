import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { EmptyState } from '../empty-state';

describe('EmptyState', () => {
  it('renders correctly with title and description', () => {
    render(<EmptyState title="No items found" description="Try adjusting your filters" />);
    expect(screen.getByText('No items found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your filters')).toBeInTheDocument();
  });

  it('renders actions prop', () => {
    render(<EmptyState title="No items" action={<button>Create Item</button>} />);
    expect(screen.getByRole('button', { name: /create item/i })).toBeInTheDocument();
  });
});
