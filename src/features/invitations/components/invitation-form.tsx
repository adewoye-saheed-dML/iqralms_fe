'use client';

import * as React from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { invitationKeys } from '@/lib/api/query-keys';
import { can } from '@/lib/permissions/capabilities';
import {
  invitationsApi,
  parseEmailList,
  type InvitationRole,
  type BatchInvitationResult,
} from '../api/invitations';
import { ApiError } from '@/lib/api/errors';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Mail,
  Send,
  X,
} from 'lucide-react';

const roleLabels: Record<InvitationRole, string> = {
  teacher: 'Teacher',
  parent: 'Parent',
  student: 'Student',
  admin: 'Administrator',
};

const kindMapping: Record<InvitationRole, string> = {
  teacher: 'teachers',
  parent: 'parents',
  student: 'students',
  admin: 'teachers',
};

interface InvitationFormProps {
  role: InvitationRole;
  successMessage?: string;
  onSuccess?: (invitation: Awaited<ReturnType<typeof invitationsApi.create>>) => void;
  onBatchSuccess?: (result: BatchInvitationResult) => void;
}

export function InvitationForm({
  role,
  successMessage = 'Invitation sent successfully.',
  onSuccess,
  onBatchSuccess,
}: InvitationFormProps) {
  const queryClient = useQueryClient();
  const { activeAcademy, activeRole } = useAcademy();

  const [rawInput, setRawInput] = React.useState('');
  const [successInfo, setSuccessInfo] = React.useState<string | null>(null);
  const [singleError, setSingleError] = React.useState<string | null>(null);
  const [batchResult, setBatchResult] = React.useState<BatchInvitationResult | null>(null);
  const [progress, setProgress] = React.useState<{
    completed: number;
    total: number;
    currentEmail: string;
  } | null>(null);

  const canInvite = can('manage_invitations', { activeRole });

  // Parse emails in real-time
  const parsed = React.useMemo(() => {
    return parseEmailList(rawInput);
  }, [rawInput]);

  // Single invitation mutation
  const singleMutation = useMutation({
    mutationFn: (targetEmail: string) => {
      if (!activeAcademy) throw new Error('No active academy context');
      return invitationsApi.create(activeAcademy.id, {
        email: targetEmail,
        role,
      });
    },
    onSuccess: (invitation, targetEmail) => {
      queryClient.invalidateQueries({
        queryKey: invitationKeys.all(activeAcademy?.id),
      });
      setRawInput('');
      setSingleError(null);
      setSuccessInfo(`${successMessage} (${targetEmail})`);
      onSuccess?.(invitation);
    },
    onError: (err) => {
      setSuccessInfo(null);
      if (err instanceof ApiError) {
        setSingleError(err.message || 'Unable to send invitation.');
      } else if (err instanceof Error) {
        setSingleError(err.message);
      } else {
        setSingleError('An unexpected error occurred while sending the invitation.');
      }
    },
  });

  // Batch invitation mutation
  const batchMutation = useMutation({
    mutationFn: async (emails: string[]) => {
      if (!activeAcademy) throw new Error('No active academy context');
      setProgress(null);
      setBatchResult(null);
      return invitationsApi.createBatch(
        activeAcademy.id,
        emails,
        role,
        (prog) => setProgress(prog),
      );
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: invitationKeys.all(activeAcademy?.id),
      });
      setProgress(null);
      setBatchResult(result);
      if (result.failed.length === 0) {
        setRawInput('');
      } else {
        // Keep failed emails in textarea so user can fix and retry
        setRawInput(result.failed.map((f) => f.email).join('\n'));
      }
      onBatchSuccess?.(result);
    },
    onError: (err) => {
      setProgress(null);
      if (err instanceof ApiError) {
        setSingleError(err.message || 'Batch invitation processing failed.');
      } else if (err instanceof Error) {
        setSingleError(err.message);
      }
    },
  });

  const isSubmitting = singleMutation.isPending || batchMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessInfo(null);
    setSingleError(null);
    setBatchResult(null);

    if (parsed.valid.length === 0) {
      setSingleError('Please enter at least one valid email address.');
      return;
    }

    if (parsed.valid.length === 1) {
      singleMutation.mutate(parsed.valid[0]);
    } else {
      batchMutation.mutate(parsed.valid);
    }
  };

  const removeEmail = (emailToRemove: string) => {
    const updatedValid = parsed.valid.filter((e) => e !== emailToRemove);
    const updatedInvalid = parsed.invalid.filter((e) => e !== emailToRemove);
    setRawInput([...updatedValid, ...updatedInvalid].join('\n'));
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

  const roleLabel = roleLabels[role] || 'Member';

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <Label htmlFor={`invitation-emails-${role}`} className="font-medium text-sm">
              Email Address{parsed.valid.length > 1 ? 'es' : ''}
            </Label>
            {parsed.valid.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {parsed.valid.length} recipient{parsed.valid.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Enter a single email or paste multiple emails separated by commas, spaces, or lines.
          </p>
          <Textarea
            id={`invitation-emails-${role}`}
            rows={3}
            placeholder={`e.g. ${role.toLowerCase()}@example.com or user1@example.com, user2@example.com`}
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            disabled={isSubmitting}
            className="font-mono text-sm resize-y"
          />
        </div>

        {/* Chips for multiple recipients */}
        {parsed.valid.length > 1 && (
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Recipients to invite ({parsed.valid.length}):
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 border rounded-md bg-muted/20">
              {parsed.valid.map((em) => (
                <Badge
                  key={em}
                  variant="outline"
                  className="flex items-center gap-1 bg-background text-xs py-0.5 px-2"
                >
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <span>{em}</span>
                  {!isSubmitting && (
                    <button
                      type="button"
                      onClick={() => removeEmail(em)}
                      className="ml-1 text-muted-foreground hover:text-destructive"
                      aria-label={`Remove ${em}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Invalid email warning */}
        {parsed.invalid.length > 0 && (
          <Alert variant="destructive" className="py-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-xs font-semibold">Invalid Email Format Detected</AlertTitle>
            <AlertDescription className="text-xs mt-0.5">
              The following will be ignored: {parsed.invalid.join(', ')}
            </AlertDescription>
          </Alert>
        )}

        {/* In-progress progress feedback for batch */}
        {progress && (
          <div className="space-y-1.5 rounded-md border bg-muted/40 p-3 text-xs">
            <div className="flex justify-between font-medium">
              <span>Sending invitations...</span>
              <span>{progress.completed} of {progress.total}</span>
            </div>
            {progress.currentEmail && (
              <p className="text-muted-foreground truncate">
                Inviting: {progress.currentEmail}
              </p>
            )}
          </div>
        )}

        {/* Single success */}
        {successInfo && (
          <Alert className="border-green-200 bg-green-50 text-green-900">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle>Invitation Sent</AlertTitle>
            <AlertDescription className="text-xs mt-0.5">
              {successInfo} It is now listed in the history below.
            </AlertDescription>
          </Alert>
        )}

        {/* Single error */}
        {singleError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="text-xs mt-0.5">{singleError}</AlertDescription>
          </Alert>
        )}

        {/* Batch result feedback */}
        {batchResult && (
          <div className="space-y-2">
            {batchResult.successful.length > 0 && (
              <Alert className="border-green-200 bg-green-50 text-green-900">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle>Batch Dispatched</AlertTitle>
                <AlertDescription className="text-xs mt-0.5">
                  Successfully sent {batchResult.successful.length} {roleLabel.toLowerCase()} invitation{batchResult.successful.length > 1 ? 's' : ''}.
                </AlertDescription>
              </Alert>
            )}

            {batchResult.failed.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>
                  {batchResult.failed.length} Invitation{batchResult.failed.length > 1 ? 's' : ''} Failed
                </AlertTitle>
                <AlertDescription className="text-xs mt-1 space-y-1">
                  {batchResult.failed.map((f) => (
                    <div key={f.email} className="flex flex-col sm:flex-row sm:gap-2">
                      <span className="font-semibold">{f.email}:</span>
                      <span>{f.reason}</span>
                    </div>
                  ))}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
          <Button
            type="submit"
            disabled={isSubmitting || parsed.valid.length === 0}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              'Sending...'
            ) : parsed.valid.length > 1 ? (
              <>
                <Send className="mr-2 h-4 w-4" />
                Invite {parsed.valid.length} {roleLabel}s
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Invite {roleLabel}
              </>
            )}
          </Button>

          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground self-start sm:self-auto" asChild>
            <Link href={`/app/imports?kind=${kindMapping[role]}`}>
              <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" />
              Upload spreadsheet ({kindMapping[role]}) &rarr;
            </Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
