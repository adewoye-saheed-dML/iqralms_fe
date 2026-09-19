'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAcademy } from '@/lib/academy/academy-provider';
import { staffKeys } from '@/lib/api/query-keys';
import { staffApi, type InvitationCreate } from '../api/staff';
import { can } from '@/lib/permissions/capabilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function StaffInviteForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { activeAcademy, activeRole } = useAcademy();

  const [formData, setFormData] = React.useState<InvitationCreate>({
    email: '',
    role: 'teacher',
  });
  const [validationError, setValidationError] = React.useState<string | null>(null);

  const canInvite = can('manage_staff', { activeRole });

  const inviteMutation = useMutation({
    mutationFn: (data: InvitationCreate) => {
      if (!activeAcademy) throw new Error('No active academy context');
      return staffApi.inviteStaff(activeAcademy.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.all(activeAcademy?.id) });
      router.push('/app/teachers');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    inviteMutation.mutate({
      email: formData.email.trim(),
      role: formData.role,
    });
  };

  if (!activeAcademy) {
    return <div className="text-sm text-red-500">Missing academy context.</div>;
  }

  if (!canInvite) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Permission Denied</AlertTitle>
        <AlertDescription>
          Only academy owners and administrators can invite new teachers or staff members.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {validationError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Validation Error</AlertTitle>
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      {inviteMutation.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Invitation Failed</AlertTitle>
          <AlertDescription>
            {inviteMutation.error instanceof Error
              ? inviteMutation.error.message
              : 'Unknown error occurred'}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          required
          placeholder="teacher@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          disabled={inviteMutation.isPending}
        />
        <p className="text-muted-foreground text-xs">
          An invitation will be sent to this email address.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <select
          id="role"
          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          value={formData.role}
          onChange={(e) =>
            setFormData({ ...formData, role: e.target.value as InvitationCreate['role'] })
          }
          disabled={inviteMutation.isPending}
        >
          <option value="teacher">Teacher</option>
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <Button type="submit" className="w-full" disabled={inviteMutation.isPending}>
        {inviteMutation.isPending ? 'Sending Invitation...' : 'Send Invitation'}
      </Button>
    </form>
  );
}
