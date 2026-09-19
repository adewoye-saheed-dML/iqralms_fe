'use client';

import { payoutsKeys } from '@/lib/api/query-keys';
import type { SkippedBooking } from "../api/payouts";

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { payoutsApi, type PayoutGenerate, type GenerationResult } from '../api/payouts';
import { useAcademy } from '@/lib/academy/academy-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError } from '@/lib/api/errors';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function GeneratePayoutsForm() {
  const { activeAcademy } = useAcademy();
  const queryClient = useQueryClient();
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<GenerationResult | null>(null);

  const [formData, setFormData] = React.useState<PayoutGenerate>({
    period_start: '',
    period_end: '',
  });

  const mutation = useMutation({
    mutationFn: (data: PayoutGenerate) => {
      if (!activeAcademy?.id) throw new Error('No active academy');
      // Convert to proper ISO before sending
      return payoutsApi.generatePayouts(activeAcademy.id, {
        ...data,
        period_start: new Date(data.period_start).toISOString(),
        period_end: new Date(data.period_end).toISOString()
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: payoutsKeys.all(activeAcademy?.id) });
      setResult(data);
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        setError(err.message || 'Failed to generate payouts');
      } else {
        setError('An unexpected error occurred');
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    if (!formData.period_start || !formData.period_end) {
      setError('Please provide a start and end period');
      return;
    }
    mutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="flex gap-4 items-end">
        <div className="space-y-2">
          <Label htmlFor="gen_start">Period Start</Label>
          <Input 
            id="gen_start" 
            type="datetime-local" 
            value={formData.period_start} 
            onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gen_end">Period End</Label>
          <Input 
            id="gen_end" 
            type="datetime-local" 
            value={formData.period_end} 
            onChange={(e) => setFormData({ ...formData, period_end: e.target.value })}
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gen_teacher">Teacher ID (Optional)</Label>
          <Input 
            id="gen_teacher" 
            type="number" 
            value={formData.teacher || ''} 
            onChange={(e) => setFormData({ ...formData, teacher: e.target.value ? parseInt(e.target.value) : undefined })}
            placeholder="All teachers"
          />
        </div>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Generating...' : 'Run Generation'}
        </Button>
      </form>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Alert className="bg-muted border-none">
          <AlertTitle>Generation Complete</AlertTitle>
          <AlertDescription className="mt-2 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="block text-muted-foreground">Created</span>
                <span className="font-medium text-lg">{result.created_count}</span>
              </div>
              <div>
                <span className="block text-muted-foreground">Skipped</span>
                <span className="font-medium text-lg">{result.skipped_count}</span>
              </div>
              <div>
                <span className="block text-muted-foreground">Total Amount</span>
                <span className="font-medium text-lg">{result.total_amount}</span>
              </div>
            </div>

            {result.skipped && result.skipped.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-sm mb-2">Skipped Bookings</h4>
                <ul className="text-sm space-y-1 list-disc pl-4 text-muted-foreground">
                  {result.skipped.map((s: SkippedBooking, idx: number) => (
                    <li key={idx}>Booking #{s.booking_id} (Teacher #{s.teacher_id}): {s.reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
