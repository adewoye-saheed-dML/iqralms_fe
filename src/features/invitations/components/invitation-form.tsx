'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { invitationKeys } from '@/lib/api/query-keys';
import { can } from '@/lib/permissions/capabilities';
import {
  invitationsApi,
  type InvitationRole,
} from '../api/invitations';
import { ApiError } from '@/lib/api/errors';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const roleLabels: Record<InvitationRole, string> = {
  teacher: 'Teacher',
  parent: 'Parent',
  student: 'Student',
  admin: 'Administrator',
};

interface InvitationFormProps {
  role: InvitationRole;
  successMessage?: string;
  onSuccess?: (invitation: Awaited<ReturnType<typeof invitationsApi.create>>) => void;
}

export function InvitationForm({
  role,
  successMessage = 'Invitation sent successfully.',
  onSuccess,
}: InvitationFormProps) {
  const queryClient = useQueryClient();
  const { activeAcademy, activeRole } = useAcademy();
  const [email, setEmail] = React.useState('');
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);

  const canInvite = can('manage_invitations', { activeRole });

  const mutation = useMutation({
    mutationFn: () => {
      if (!activeAcademy) {
        throw new Error('No active academy context');
      }
      return invitationsApi.create(activeAcademy.id, {
        email: email.trim(),
        role,
      });
    },
    onSuccess: (invitation) => {
      queryClient.invalidateQueries({
        queryKey: invitationKeys.all(activeAcademy?.id),
      });
      setEmail('');
      setValidationError(null);
      setSent(true);
      onSuccess?.(invitation);
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setValidationError(null);
    setSent(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    mutation.mutate();
  };

  if (!activeAcademy) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Academy context missing</AlertTitle>
        <AlertDescription>Please select an academy before sending an invitation.</AlertDescription>
      </Alert>
    );
  }

  if (!canInvite) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Permission Denied</AlertTitle>
        <AlertDescription>
          Only academy owners and administrators can send invitations.
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

      {mutation.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Invitation Failed</AlertTitle>
          <AlertDescription>
            {mutation.error instanceof ApiError || mutation.error instanceof Error
              ? mutation.error.message
              : 'Unable to send the invitation.'}
          </AlertDescription>
        </Alert>
      )}

      {sent && !mutation.isError && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>{successMessage}</AlertTitle>
          <AlertDescription>
            The {roleLabels[role].toLowerCase()} invitation is now listed in the invitation history.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor={`invitation-email-${role}`}>Email Address</Label>
        <Input
          id={`invitation-email-${role}`}
          type="email"
          required
          placeholder={`${roleLabels[role].toLowerCase()}@example.com`}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={mutation.isPending}
        />
      </div>

      <Button type="submit" disabled={mutation.isPending || !email.trim()}>
        {mutation.isPending ? 'Sending Invitation...' : `Invite ${roleLabels[role]}`}
      </Button>
    </form>
  );
}
