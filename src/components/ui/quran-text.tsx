import * as React from 'react';
import { cn } from '@/lib/utils';

export interface QuranTextProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
}

export const QuranText = React.forwardRef<HTMLElement, QuranTextProps>(
  ({ className, as: Component = 'p', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        dir="rtl"
        className={cn('font-quran text-right text-2xl leading-relaxed', className)}
        {...props}
      />
    );
  }
);
QuranText.displayName = 'QuranText';
