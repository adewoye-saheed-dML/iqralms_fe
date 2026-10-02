import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/lib/providers/query-provider';
import { AuthProvider } from '@/lib/auth/auth-provider';
import { AcademyProvider } from '@/lib/academy/academy-provider';

export const metadata: Metadata = {
  title: {
    template: '%s | Iqra LMS',
    default: 'Iqra LMS - Quran Academy Platform',
  },
  description: 'Premier learning management system engineered for Quran academies, Arabic institutes, and virtual Islamic classrooms.',
  icons: {
    icon: '/images/iqralms-icon-transparent.png',
    shortcut: '/images/iqralms-icon-transparent.png',
    apple: '/images/iqralms-icon-transparent.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Can be made dynamic later based on language
  return (
    <html lang="en">
      <body className="bg-background min-h-screen font-sans antialiased">
        <QueryProvider>
          <AuthProvider>
            <AcademyProvider>{children}</AcademyProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
