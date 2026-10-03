'use client';

import * as React from 'react';
import { useAcademy } from '@/lib/academy/academy-provider';
import { useAcademyBranding } from '@/lib/academy/academy-branding';
import { Badge } from '@/components/ui/badge';
import { Clock, Shield, Sparkles } from 'lucide-react';

interface AcademyDashboardHeroProps {
  roleLabel: string;
  welcomeName?: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function AcademyDashboardHero({
  roleLabel,
  welcomeName,
  subtitle,
  children,
}: AcademyDashboardHeroProps) {
  const { activeAcademy, activeRole } = useAcademy();
  const { branding } = useAcademyBranding(activeAcademy?.id, activeAcademy?.name);

  const academyName = activeAcademy?.name || 'Academy';
  const roleDisplay = activeRole
    ? activeRole.charAt(0).toUpperCase() + activeRole.slice(1)
    : 'Member';

  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border border-primary/20 rounded-2xl p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
          {branding?.logoUrl ? (
            <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-xl border bg-card p-1 shadow-2xs shrink-0 flex items-center justify-center overflow-hidden">
              <img
                src={branding.logoUrl}
                alt={`${academyName} Logo`}
                className="h-full w-full object-contain rounded-lg"
              />
            </div>
          ) : (
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-2xl shadow-2xs shrink-0">
              {academyName.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-primary text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> {roleLabel}
              </span>
              <Badge variant="outline" className="bg-background text-[11px] font-mono border-primary/30 text-primary">
                {roleDisplay}
              </Badge>
              {activeAcademy?.is_active && (
                <Badge variant="secondary" className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                  Operating
                </Badge>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {academyName}
            </h1>

            <p className="text-xs text-muted-foreground">
              {subtitle ||
                (welcomeName
                  ? `Welcome back, ${welcomeName}. Connected to ${academyName}.`
                  : `Welcome to ${academyName}.`)}
            </p>

            {activeAcademy && (
              <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px] text-muted-foreground">
                <span className="font-mono text-muted-foreground/80">@{activeAcademy.slug}</span>
                {activeAcademy.timezone && (
                  <span className="flex items-center gap-1">
                    • <Clock className="h-3 w-3" /> {activeAcademy.timezone}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {children && <div className="flex flex-wrap items-center gap-2 shrink-0">{children}</div>}
      </div>
    </div>
  );
}
