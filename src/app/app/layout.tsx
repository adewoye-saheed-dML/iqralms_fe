'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppTopbar } from '@/components/layout/app-topbar';
import { useAuth } from '@/lib/auth/auth-provider';
import { LoadingState } from '@/components/ui/loading';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!isLoading && !user) {
      const returnUrl = encodeURIComponent(pathname);
      router.push(`/login?returnUrl=${returnUrl}`);
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading || !user) {
    return <LoadingState />;
  }

  return (
    <div className="bg-muted/40 flex min-h-screen w-full">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AppSidebar className="fixed inset-y-0 z-50" />
      </div>

      {/* Mobile Sidebar overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <AppSidebar className="fixed inset-y-0 left-0 w-64 shadow-lg" />
        </div>
      )}

      <div className="flex min-h-screen w-full flex-col lg:pl-64">
        <AppTopbar onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
