'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { navigationConfig, type UserRole, type OrgRole } from '@/lib/navigation/config';
import { useAuth } from '@/lib/auth/auth-provider';
import { useAcademy } from '@/lib/academy/academy-provider';

export function AppSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { selectedAcademy } = useAcademy();

  if (!user) return null;

  // Filter navigation based on user role and org role
  const visibleNavItems = navigationConfig.filter((item) => {
    if (item.allowedUserRoles && !item.allowedUserRoles.includes(user.role as UserRole)) {
      return false;
    }
    if (item.allowedOrgRoles && selectedAcademy) {
      if (!item.allowedOrgRoles.includes(selectedAcademy.role as OrgRole)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className={cn('bg-card flex h-full w-64 flex-col border-r', className)}>
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px]">
        <Link href="/app/dashboard" className="text-primary flex items-center gap-2 font-semibold">
          <span>Quran Academy</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium">
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-muted-foreground hover:text-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-all',
                  isActive ? 'bg-muted text-primary' : ''
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
