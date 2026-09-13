import * as React from 'react';
import { FileQuestion } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  action,
  icon = <FileQuestion className="text-muted-foreground h-10 w-10" />,
}: EmptyStateProps) {
  return (
    <div className="animate-in fade-in-50 flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center space-y-4">
        <div className="bg-muted flex h-20 w-20 items-center justify-center rounded-full">
          {icon}
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
          {description && <p className="text-muted-foreground text-sm">{description}</p>}
        </div>
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
}
