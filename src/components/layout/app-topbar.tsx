'use client';

import * as React from 'react';
import { Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/auth-provider';
import { useAcademy } from '@/lib/academy/academy-provider';

export function AppTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const { academies, activeAcademy, setActiveAcademy } = useAcademy();

  return (
    <header className="bg-background flex h-14 items-center gap-4 border-b px-4 lg:h-[60px] lg:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle navigation menu</span>
      </Button>

      <div className="w-full flex-1">
        {academies.length > 0 && (
          <select
            className="border-input focus-visible:ring-ring h-9 w-[200px] rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
            value={activeAcademy?.id || ''}
            onChange={(e) => setActiveAcademy(Number(e.target.value))}
            aria-label="Select Academy"
          >
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
