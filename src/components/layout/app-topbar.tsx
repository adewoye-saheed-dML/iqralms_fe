'use client';

import * as React from 'react';
import { Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/auth-provider';
import { useAcademy } from '@/lib/academy/academy-provider';
import { useAcademyBranding } from '@/lib/academy/academy-branding';

export function AppTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const { academies, activeAcademy, setActiveAcademy } = useAcademy();
  const { branding: activeBranding } = useAcademyBranding(activeAcademy?.id, activeAcademy?.name);

  return (
    <header className="bg-background flex h-14 items-center gap-4 border-b px-4 lg:h-[60px] lg:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle navigation menu</span>
      </Button>

      <div className="w-full flex-1 flex items-center gap-2.5">
        {activeBranding?.logoUrl ? (
          <img
            src={activeBranding.logoUrl}
            alt={activeAcademy?.name || 'Academy'}
            className="h-9 w-9 rounded-lg object-contain border bg-background p-0.5 shadow-2xs shrink-0"
          />
        ) : (
          <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
            {activeAcademy?.name ? activeAcademy.name.charAt(0).toUpperCase() : 'I'}
          </div>
        )}
        {academies.length > 0 && (
          <select
            className="border-input focus-visible:ring-ring h-9 w-[220px] rounded-md border bg-transparent px-3 py-1 text-sm font-medium shadow-2xs focus-visible:ring-1 focus-visible:outline-none"
            value={activeAcademy?.id || ''}
            onChange={(e) => setActiveAcademy(Number(e.target.value))}
            aria-label="Select Academy"
          >
            {!activeAcademy && (
              <option value="" disabled>
                Select an academy...
              </option>
            )}
            {academies.map((academy) => (
              <option key={academy.id} value={academy.id}>
                {academy.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex items-center gap-4">
        <span className="text-muted-foreground hidden text-sm md:inline-flex">
          {user?.username}
        </span>
        <Button variant="ghost" size="icon" onClick={() => logout()}>
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Log out</span>
        </Button>
      </div>
    </header>
  );
}
