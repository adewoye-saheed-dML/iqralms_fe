import * as React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  className?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An error occurred while loading this content.',
  className,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className={`p-4 ${className}`}>
      <Alert variant="destructive" className="relative pr-24">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
        {onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="absolute right-4 top-4"
          >
            <RefreshCw className="mr-2 h-3 w-3" /> Retry
          </Button>
        )}
      </Alert>
    </div>
  );
}
