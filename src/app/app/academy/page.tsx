'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingState } from '@/components/ui/loading';

export default function AcademyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    const tab = searchParams?.get('tab') || 'members';
    router.replace(`/app/dashboard?tab=${tab}`);
  }, [router, searchParams]);

  return (
    <div className="flex justify-center p-12">
      <LoadingState />
    </div>
  );
}
