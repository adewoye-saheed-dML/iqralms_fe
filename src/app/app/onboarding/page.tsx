import { Metadata } from 'next';
import { OnboardingWizard } from '@/features/onboarding/components/onboarding-wizard';

export const metadata: Metadata = {
  title: 'Academy Setup - Quran Academy',
  description: 'Configure your new Quran Academy',
};

export default function OnboardingPage() {
  return <OnboardingWizard />;
}
