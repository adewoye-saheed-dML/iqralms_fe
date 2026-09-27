import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  backHref,
  backLabel,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 pb-6 md:flex-row md:items-center md:justify-between',
        className
      )}
      {...props}
    >
      <div className="space-y-1.5">
        {backHref && (
          <div>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="-ml-2.5 h-8 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 mb-1"
            >
              <Link href={backHref}>
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>{backLabel || 'Back'}</span>
              </Link>
            </Button>
          </div>
        )}
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center space-x-2">{actions}</div>}
    </div>
  );
}
