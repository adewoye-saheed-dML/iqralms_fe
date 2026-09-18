'use client';
import { navigationConfig } from '@/lib/navigation/config';
import { can } from '@/lib/permissions/capabilities';

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
import { Button } from '@/components/ui/button';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const {
    academies,
    activeAcademy,
    activeRole,
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

  const isAcademyCreateRoute = pathname === '/app/academy/create';

  if (academyError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <ErrorState title="Failed to load academies" message={academyError.message} />
      </div>
    );
  }

  // If user has no academies and is not on the creation page, prompt them to create one
  if ((academies.length === 0 || !activeAcademy) && !isAcademyCreateRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <EmptyState
          icon={<Building2 className="text-muted-foreground h-10 w-10" />}
          title="No Academy Access"
          description="You do not have access to any academies. Would you like to create one?"
          action={
            <Button onClick={() => router.push('/app/academy/create')}>Create Academy</Button>
          }
        />
      </div>
    );
  }

  // Check if current route is forbidden
  const currentNavItem = navigationConfig.find(item => pathname === item.href || pathname.startsWith(`${item.href}/`));
  const isForbidden = currentNavItem?.requiredCapability && !can(currentNavItem.requiredCapability, { userRole: user?.role, activeRole });

  if (isForbidden && !isAcademyCreateRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <ErrorState title="Access Denied" message="You do not have permission to view this page." />
      </div>
    );
  }

  // For users with no academies ON the create route, we still want to show the topbar maybe?
  // Let's hide sidebar if they have no active academy, but let them render the layout otherwise.
  const showSidebar = !!activeAcademy && academies.length > 0;

  return (
    <div className="bg-muted/40 flex min-h-screen w-full">
      {/* Desktop Sidebar */}
      {showSidebar && (
        <div className="hidden lg:block">
          <AppSidebar className="fixed inset-y-0 z-50" />
        </div>
      )}

      {/* Mobile Sidebar overlay */}
      {showSidebar && isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <AppSidebar className="fixed inset-y-0 left-0 w-64 shadow-lg" />
        </div>
      )}

      <div className={`flex min-h-screen w-full flex-col ${showSidebar ? 'lg:pl-64' : ''}`}>
        <AppTopbar onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
