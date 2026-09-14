import * as React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { CurriculumDirectory } from '@/features/curriculum/components/curriculum-directory';

export const metadata = {
  title: 'Curriculum | Quran Academy',
};

export default function CurriculumPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Curriculum"
        description="Manage learning tracks and their progressing levels."
      />
      <CurriculumDirectory />
    </div>
  );
}
