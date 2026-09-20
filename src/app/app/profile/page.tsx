'use client';

import * as React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth/auth-provider';
import { useAcademy } from '@/lib/academy/academy-provider';
import { User, Mail, Globe, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const { activeAcademy, activeRole } = useAcademy();

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="My Profile"
        description="Your user account details and current academy membership."
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
              {(user.first_name?.[0] || user.username?.[0] || 'U').toUpperCase()}
            </div>
            <div>
              <CardTitle className="text-xl">
                {user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.username}
              </CardTitle>
              <CardDescription className="text-xs">{user.email || 'No email registered'}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="rounded-lg border p-3">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> Username
              </span>
              <p className="font-semibold mt-1">{user.username}</p>
            </div>

            <div className="rounded-lg border p-3">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> Email
              </span>
              <p className="font-semibold mt-1 truncate">{user.email || 'N/A'}</p>
            </div>

            <div className="rounded-lg border p-3">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" /> Account Role
              </span>
              <p className="font-semibold mt-1 capitalize">{user.role || 'Standard'}</p>
            </div>

            <div className="rounded-lg border p-3">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" /> Timezone
              </span>
              <p className="font-semibold mt-1">{user.timezone || 'UTC'}</p>
            </div>
          </div>

          {activeAcademy && (
            <div className="mt-4 rounded-lg bg-muted/40 p-4 border text-sm space-y-1">
              <div className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Active Academy Membership
              </div>
              <p className="text-sm font-medium">{activeAcademy.name}</p>
              <p className="text-xs text-muted-foreground capitalize">
                Membership Role: {activeRole || 'Member'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
