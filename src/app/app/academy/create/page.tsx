import { Metadata } from 'next';
import { CreateAcademyForm } from '@/features/onboarding/components/create-academy-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Create Academy - Quran Academy',
  description: 'Create a new academy in Quran Academy',
};

export default function CreateAcademyPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mb-4">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="-ml-2.5 h-8 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
        >
          <Link href="/app/dashboard">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Dashboard</span>
          </Link>
        </Button>
      </div>
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
