'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield, Clock, User } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingState } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { useAcademy } from '@/lib/academy/academy-provider';
import { auditApi, type AuditLog } from '@/features/audit/api/audit';
import { auditKeys } from '@/lib/api/query-keys';

export default function AuditPage() {
  const { activeAcademy } = useAcademy();

  const { data, isLoading, error } = useQuery<AuditLog[]>({
    queryKey: auditKeys.list(activeAcademy?.id),
    queryFn: async () => {
      if (!activeAcademy?.id) return [];
      return auditApi.getAuditLogs(activeAcademy.id);
    },
    enabled: !!activeAcademy?.id,
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState title="Failed to load audit logs" message={error.message} />;

  const auditLogs = data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Immutable record of administrative operations and changes within this academy."
      />

      {auditLogs.length === 0 ? (
        <EmptyState
          icon={<Shield className="h-10 w-10 text-muted-foreground" />}
          title="No Audit Logs"
          description="There are currently no recorded administrative audit logs for this academy."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>System Activity</CardTitle>
            <CardDescription>
              Showing verified operations logged by the backend audit engine.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y text-sm">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground capitalize">
                        {log.action?.replace('_', ' ')}
                      </span>
                      <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                        {log.object_type} #{log.object_id}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" /> Actor: {log.actor_id_snapshot || log.actor || 'System'} ({log.actor_type || 'user'})
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 sm:text-right">
                    <Clock className="h-3 w-3" />
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
