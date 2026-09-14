'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pricingApi, type PricingAgreementCreate } from '../api/pricing';
import { useAcademy } from '@/lib/academy/academy-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError } from '@/lib/api/errors';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AgreementFormProps {
  onSuccess: () => void;
}

export function AgreementForm({ onSuccess }: AgreementFormProps) {
  const { activeAcademy } = useAcademy();
  const queryClient = useQueryClient();
  const [error, setError] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState<Partial<PricingAgreementCreate>>({
    reason: 'scholarship',
  });

  const mutation = useMutation({
    mutationFn: (data: PricingAgreementCreate) => {
      if (!activeAcademy?.id) throw new Error('No active academy');
      return pricingApi.createAgreement(activeAcademy.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academy', activeAcademy?.id, 'pricing'] });
      onSuccess();
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        setError(err.message || 'Failed to create agreement');
      } else {
        setError('An unexpected error occurred');
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.student || !formData.level || !formData.standard_rate || !formData.agreed_rate) {
      setError('Please fill in all required fields');
      return;
    }
    mutation.mutate(formData as PricingAgreementCreate);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-destructive/15 text-destructive rounded-md p-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="student">Student ID</Label>
          <Input 
            id="student" 
            type="number" 
            value={formData.student || ''} 
            onChange={(e) => setFormData({ ...formData, student: parseInt(e.target.value) })}
            placeholder="Student ID"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="level">Level ID</Label>
          <Input 
            id="level" 
            type="number" 
            value={formData.level || ''} 
            onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
            placeholder="Level ID"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="standard_rate">Standard Rate</Label>
          <Input 
            id="standard_rate" 
            type="text" 
            value={formData.standard_rate || ''} 
            onChange={(e) => setFormData({ ...formData, standard_rate: e.target.value })}
            placeholder="e.g. 5000.00"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="agreed_rate">Agreed Rate</Label>
          <Input 
            id="agreed_rate" 
            type="text" 
            value={formData.agreed_rate || ''} 
            onChange={(e) => setFormData({ ...formData, agreed_rate: e.target.value })}
            placeholder="e.g. 4500.00"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason</Label>
        <Select 
          value={formData.reason} 
          onValueChange={(value: string) => setFormData({ ...formData, reason: value })}
        >
          <SelectTrigger id="reason">
            <SelectValue placeholder="Select reason" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="scholarship">Scholarship</SelectItem>
            <SelectItem value="family_discount">Family Discount</SelectItem>
            <SelectItem value="staff_discount">Staff Discount</SelectItem>
            <SelectItem value="promotional">Promotional</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Internal)</Label>
        <Input 
          id="notes" 
          type="text" 
          value={formData.notes || ''} 
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Optional notes"
        />
      </div>

      <div className="pt-2">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : 'Create Agreement'}
        </Button>
      </div>
    </form>
  );
}
