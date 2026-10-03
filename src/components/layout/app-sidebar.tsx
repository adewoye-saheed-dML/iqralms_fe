'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { getNavigationForRole, resolveRoleExperience } from '@/lib/navigation/config';
import { useAuth } from '@/lib/auth/auth-provider';
import { useAcademy } from '@/lib/academy/academy-provider';
import { useAcademyBranding } from '@/lib/academy/academy-branding';
import { can } from '@/lib/permissions/capabilities';

export function AppSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { activeAcademy, activeRole } = useAcademy();
  const { branding } = useAcademyBranding(activeAcademy?.id, activeAcademy?.name);

  if (!user) return null;

  // Resolve role experience and get role-specific navigation
  const experience = resolveRoleExperience({ activeRole, userRole: user.role });
  const roleNavItems = getNavigationForRole(experience);

  // Minor students without parent confirmation only see Dashboard, Notifications, Profile
  const isRestrictedMinor = user.is_minor && !user.is_fully_active;
  const restrictedPaths = new Set(['/app/dashboard', '/app/notifications', '/app/profile']);

  const visibleNavItems = roleNavItems.filter((item) => {
    if (isRestrictedMinor && !restrictedPaths.has(item.href)) {
      return false;
    }
    // Minor students unconditionally have no payment affordance
    if (user.is_minor && item.href.startsWith('/app/payments')) {
      return false;
    }
    if (item.requiredCapability) {
      return can(item.requiredCapability, { userRole: user.role, activeRole });
    }
    return true;
  });

  return (
    <div className={cn('bg-card flex h-full w-64 flex-col border-r', className)}>
      <div
        className={cn(
          'flex items-center border-b px-3 lg:px-4 transition-all',
          branding?.logoUrl ? 'h-20 lg:h-24 py-2' : 'h-16 lg:h-[64px]'
        )}
      >
        <Link
          href="/app/dashboard"
          className="flex items-center justify-center w-full h-full min-w-0 group"
          title={activeAcademy?.name || 'Academy'}
        >
          {branding?.logoUrl ? (
            /* Custom Academy Icon only - boldly filling the space for maximum clarity & visual presence */
            <div className="flex items-center justify-center w-full h-full">
              <img
                src={branding.logoUrl}
                alt={activeAcademy?.name || 'Academy Icon'}
                className="h-full w-full max-h-16 lg:max-h-20 max-w-[224px] object-contain group-hover:scale-[1.03] transition-transform duration-200"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2.5 min-w-0 w-full">
              <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                {activeAcademy?.name ? activeAcademy.name.charAt(0).toUpperCase() : 'I'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="truncate text-sm font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
                  {activeAcademy?.name || 'Iqra LMS'}
                </span>
                <span className="text-[10px] text-muted-foreground font-normal truncate">
                  {activeAcademy?.slug ? `@${activeAcademy.slug}` : 'Iqra LMS Platform'}
                </span>
              </div>
            </div>
          )}
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium">
          {visibleNavItems.map((item) => {
            const itemBaseHref = item.href.split('?')[0];
            const isActive = pathname === itemBaseHref || pathname.startsWith(`${itemBaseHref}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-muted-foreground hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-all',
                  isActive ? 'bg-muted text-primary font-semibold' : ''
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
