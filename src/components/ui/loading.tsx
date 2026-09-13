import * as React from 'react';
import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

export function Spinner({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <Loader2 className={cn('text-muted-foreground h-4 w-4 animate-spin', className)} {...props} />
  );
}

export function LoadingState({ className }: { className?: string }) {
  return (
    <div className={cn('flex min-h-[400px] items-center justify-center p-8', className)}>
      <Spinner className="h-8 w-8" />
    </div>
  );
}
