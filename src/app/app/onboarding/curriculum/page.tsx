import { Metadata } from 'next';
import { CurriculumSetupForm } from '@/features/onboarding/components/curriculum-setup';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';

export const metadata: Metadata = {
  title: 'Curriculum Setup - Quran Academy',
  description: 'Add your first track',
};

export default function CurriculumSetupPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Curriculum Setup"
        description="A track is a primary subject area, like Quran Reading, Memorization, or Islamic Studies."
      />

      <Card>
        <CardHeader>
          <CardTitle>Add First Track</CardTitle>
          <CardDescription>You can add more tracks and detailed levels later.</CardDescription>
        </CardHeader>
        <CardContent>
          <CurriculumSetupForm />
        </CardContent>
      </Card>
    </div>
  );
}
