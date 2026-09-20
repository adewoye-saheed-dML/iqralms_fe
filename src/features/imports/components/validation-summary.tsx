import * as React from 'react';
import type { ImportJobResponse } from '../api/imports';
import { Badge } from '@/components/ui/badge';

interface ValidationSummaryProps {
  job: ImportJobResponse;
}

export function ValidationSummary({ job }: ValidationSummaryProps) {
  // Use exact backend error report representation
  const renderErrors = () => {
    if (!job.error_report) return null;
    
    // Check if it's an array of errors or an object mapping
    if (Array.isArray(job.error_report) && job.error_report.length > 0) {
      return (
        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-2">Error Report:</h4>
          <ul className="text-sm text-destructive list-disc pl-5 space-y-1 max-h-40 overflow-y-auto">
            {job.error_report.map((err: unknown, idx: number) => (
              <li key={idx}>
                {typeof err === 'string' ? err : JSON.stringify(err)}
              </li>
            ))}
          </ul>
        </div>
      );
    }
    
    if (typeof job.error_report === 'object' && Object.keys(job.error_report).length > 0) {
      return (
        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-2">Error Report:</h4>
          <pre className="text-xs bg-muted p-2 rounded max-h-40 overflow-auto">
            {JSON.stringify(job.error_report, null, 2)}
          </pre>
        </div>
      );
    }

    return null;
  };

  const getStatusBadge = () => {
    switch (job.status) {
      case 'validated': return <Badge variant="secondary">Validated</Badge>;
      case 'failed': return <Badge variant="destructive">Failed</Badge>;
      case 'completed': return <Badge variant="default">Completed</Badge>;
      case 'partially_completed': return <Badge variant="outline">Partially Completed</Badge>;
      default: return <Badge variant="outline">{job.status}</Badge>;
    }
  };

  const isPostCommit = ['completed', 'partially_completed', 'failed'].includes(job.status) && job.created_count !== undefined;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b pb-2">
        <span className="font-medium text-sm text-muted-foreground">Status:</span>
        {getStatusBadge()}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="bg-muted/30 p-3 rounded text-center">
          <span className="block text-muted-foreground text-xs uppercase tracking-wider mb-1">Total Rows</span>
          <span className="font-semibold text-lg">{job.row_count}</span>
        </div>
        <div className="bg-green-50 p-3 rounded text-center text-green-900 border border-green-100">
          <span className="block text-green-700 text-xs uppercase tracking-wider mb-1">Valid Rows</span>
          <span className="font-semibold text-lg">{job.valid_row_count}</span>
        </div>
        <div className="bg-red-50 p-3 rounded text-center text-red-900 border border-red-100">
          <span className="block text-red-700 text-xs uppercase tracking-wider mb-1">Invalid Rows</span>
          <span className="font-semibold text-lg">{job.invalid_row_count}</span>
        </div>
        <div className="bg-muted/30 p-3 rounded text-center">
          <span className="block text-muted-foreground text-xs uppercase tracking-wider mb-1">Errors</span>
          <span className="font-semibold text-lg">{job.error_count}</span>
        </div>
      </div>

      {isPostCommit && (
        <div className="pt-4 mt-4 border-t">
          <h3 className="text-sm font-semibold mb-3">Commit Results</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex justify-between p-2 bg-muted/50 rounded">
              <span className="text-muted-foreground">Created:</span>
              <span className="font-medium">{job.created_count}</span>
            </div>
            <div className="flex justify-between p-2 bg-muted/50 rounded">
              <span className="text-muted-foreground">Updated:</span>
              <span className="font-medium">{job.updated_count}</span>
            </div>
            <div className="flex justify-between p-2 bg-muted/50 rounded">
              <span className="text-muted-foreground">Skipped:</span>
              <span className="font-medium">{job.skipped_count}</span>
            </div>
          </div>
          {job.invitations_created !== undefined && job.invitations_created > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div className="rounded bg-muted/50 p-2"><span className="text-muted-foreground">Invitations:</span> <span className="font-medium">{job.invitations_created}</span></div>
              <div className="rounded bg-muted/50 p-2"><span className="text-muted-foreground">Emails sent:</span> <span className="font-medium">{job.emails_sent}</span></div>
              <div className="rounded bg-muted/50 p-2"><span className="text-muted-foreground">Emails failed:</span> <span className="font-medium">{job.emails_failed}</span></div>
            </div>
          )}
        </div>
      )}

      {renderErrors()}
    </div>
  );
}
