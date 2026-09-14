'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Building2 } from 'lucide-react';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppTopbar } from '@/components/layout/app-topbar';
import { useAuth } from '@/lib/auth/auth-provider';
import { useAcademy } from '@/lib/academy/academy-provider';
import { LoadingState } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const {
    academies,
    activeAcademy,
    isLoading: isAcademyLoading,
    error: academyError,
  } = useAcademy();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!isAuthLoading && !user) {
      const returnUrl = encodeURIComponent(pathname);
      router.push(`/login?returnUrl=${returnUrl}`);
    }
  }, [user, isAuthLoading, router, pathname]);

  if (isAuthLoading || !user || isAcademyLoading) {
    return <LoadingState />;
  }

  if (academyError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <ErrorState title="Failed to load academies" message={academyError.message} />
      </div>
    );
  }

  if (academies.length === 0 || !activeAcademy) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <EmptyState
          icon={<Building2 className="text-muted-foreground h-10 w-10" />}
          title="No Academy Access"
          description="You do not have access to any academies. Please contact an administrator to be added to an academy."
        />
      </div>
    );
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
