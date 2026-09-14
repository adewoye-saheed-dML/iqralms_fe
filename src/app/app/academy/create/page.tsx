import { Metadata } from 'next';
import { CreateAcademyForm } from '@/features/onboarding/components/create-academy-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Create Academy - Quran Academy',
  description: 'Create a new academy in Quran Academy',
};

export default function CreateAcademyPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">Create an Academy</CardTitle>
          <CardDescription>
            Enter the details for your new Quran Academy to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateAcademyForm />
        </CardContent>
      </Card>
    </div>
  );
}
