'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAcademy } from '@/lib/academy/academy-provider';
import { staffApi, AddMemberPayload } from '../api/staff';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function StaffInviteForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { activeAcademy } = useAcademy();

  const [formData, setFormData] = React.useState({
    user: '',
    role: 'teacher' as AddMemberPayload['role'],
  });

  const createMutation = useMutation({
    mutationFn: (data: AddMemberPayload) => {
      if (!activeAcademy) throw new Error('No active academy context');
      return staffApi.addMember(activeAcademy.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academy', activeAcademy?.id, 'staff'] });
      router.push('/app/staff');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      user: parseInt(formData.user, 10),
      role: formData.role,
    });
  };

  if (!activeAcademy) {
    return <div className="text-sm text-red-500">Missing academy context.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {createMutation.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Add Member Failed</AlertTitle>
          <AlertDescription>
            {createMutation.error instanceof Error
              ? createMutation.error.message
              : 'Unknown error occurred'}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="user">User ID</Label>
        <Input
          id="user"
          type="number"
          required
          placeholder="e.g. 123"
          value={formData.user}
          onChange={(e) => setFormData({ ...formData, user: e.target.value })}
          disabled={createMutation.isPending}
        />
        <p className="text-muted-foreground text-xs">Enter the existing User ID.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <select
          id="role"
          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          value={formData.role}
          onChange={(e) =>
            setFormData({ ...formData, role: e.target.value as AddMemberPayload['role'] })
          }
          disabled={createMutation.isPending}
        >
          <option value="teacher">Teacher</option>
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <Button type="submit" className="w-full" disabled={createMutation.isPending}>
        {createMutation.isPending ? 'Adding Member...' : 'Add Member'}
      </Button>
    </form>
  );
}
