import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Spinner, LoadingState } from '../loading';

describe('Loading components', () => {
  describe('Spinner', () => {
    it('renders correctly', () => {
      const { container } = render(<Spinner />);
      // SVGs don't have roles by default unless specified, just check it renders
      expect(container.querySelector('svg')).toBeInTheDocument();
      expect(container.querySelector('svg')).toHaveClass('animate-spin');
    });
  });

  describe('LoadingState', () => {
    it('renders correctly', () => {
      const { container } = render(<LoadingState />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });
});
