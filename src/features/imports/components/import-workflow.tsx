import { academyKeys } from '@/lib/api/query-keys';
'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { importsApi, type ImportJobResponse, type KindEnum } from '../api/imports';
import { useAcademy } from '@/lib/academy/academy-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ApiError } from '@/lib/api/errors';
import { ValidationSummary } from './validation-summary';

export function ImportWorkflow() {
  const { activeAcademy } = useAcademy();
  const queryClient = useQueryClient();

  const [kind, setKind] = React.useState<KindEnum>('students');
  const [file, setFile] = React.useState<File | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  
  // Job state
  const [job, setJob] = React.useState<ImportJobResponse | null>(null);

  // Clear job if academy changes (tenant safety)
  React.useEffect(() => {
    setJob(null);
    setError(null);
    setFile(null);
  }, [activeAcademy?.id]);

  const validateMutation = useMutation({
    mutationFn: (data: { file: File, kind: KindEnum }) => {
      if (!activeAcademy?.id) throw new Error('No active academy');
      return importsApi.validateImport(activeAcademy.id, data.file, data.kind);
    },
    onSuccess: (data) => {
      setJob(data);
      setError(null);
    },
    onError: (err) => {
      setJob(null);
      if (err instanceof ApiError) {
        setError(err.message || 'Validation failed');
      } else {
        setError('An unexpected error occurred during validation');
      }
    }
  });

  const commitMutation = useMutation({
    mutationFn: () => {
      if (!activeAcademy?.id || !job?.id) throw new Error('Cannot commit');
      return importsApi.commitImport(activeAcademy.id, job.id);
    },
    onSuccess: (data) => {
      setJob(data);
      setError(null);
      // Invalidate relevant queries (e.g. students/teachers lists if we were rendering them)
      queryClient.invalidateQueries({ queryKey: academyKeys.tenant(activeAcademy?.id) });
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        setError(err.message || 'Commit failed');
      } else {
        setError('An unexpected error occurred during commit');
      }
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const validExtensions = ['.csv', '.xlsx'];
      const extension = selected.name.substring(selected.name.lastIndexOf('.')).toLowerCase();
      
      if (!validExtensions.includes(extension)) {
        setError('Please upload a .csv or .xlsx file.');
        setFile(null);
        return;
      }
      
      if (selected.size > 5 * 1024 * 1024) {
        setError('File exceeds the 5 MB limit.');
        setFile(null);
        return;
      }

      setError(null);
      setFile(selected);
      // Reset any previous job if they pick a new file
      setJob(null);
    }
  };

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    validateMutation.mutate({ file, kind });
  };

  return (
    <div className="space-y-8">
      {/* Step 1: Upload Form */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-medium mb-4">1. Select Data File</h2>
        <form onSubmit={handleValidate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kind">Record Type</Label>
              <Select value={kind} onValueChange={(val: KindEnum) => setKind(val)}>
                <SelectTrigger id="kind">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="students">Students</SelectItem>
                  <SelectItem value="teachers">Teachers</SelectItem>
                  <SelectItem value="parents">Parents</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="file">File (CSV or XLSX, max 5MB)</Label>
              <Input 
                id="file" 
                type="file" 
                accept=".csv, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv"
                onChange={handleFileChange} 
              />
            </div>
          </div>
          
          <Button type="submit" disabled={!file || validateMutation.isPending || commitMutation.isPending}>
            {validateMutation.isPending ? 'Validating...' : 'Upload & Validate'}
          </Button>
        </form>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step 2: Validation Summary & Commit */}
      {job && (
        <div className="rounded-lg border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-medium">2. Validation Result</h2>
          <ValidationSummary job={job} />
          
          {job.status === 'validated' && (
            <div className="pt-4 border-t mt-4">
              <Alert className="mb-4">
                <AlertTitle>Ready to commit</AlertTitle>
                <AlertDescription>
                  This action is irreversible and will bulk create or update records. Please review the counts above.
                </AlertDescription>
              </Alert>
              <Button 
                onClick={() => commitMutation.mutate()} 
                disabled={commitMutation.isPending}
                className="w-full sm:w-auto"
              >
                {commitMutation.isPending ? 'Committing...' : 'Commit Import'}
              </Button>
            </div>
          )}

          {job.status === 'completed' || job.status === 'partially_completed' ? (
             <div className="pt-4 border-t mt-4 bg-green-50/50 p-4 rounded text-green-900 border border-green-200">
               <h3 className="font-semibold mb-2">Import Successful</h3>
               <p className="text-sm">
                 Job completed at {new Date(job.completed_at || '').toLocaleString()}.
               </p>
             </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
