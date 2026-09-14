import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ArabicTextProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
}

export const ArabicText = React.forwardRef<HTMLElement, ArabicTextProps>(
  ({ className, as: Component = 'p', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        dir="rtl"
        className={cn('font-arabic text-right leading-loose', className)}
        {...props}
      />
    );
  }
);
ArabicText.displayName = 'ArabicText';
