import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Public Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary tracking-tight">
            <BookOpen className="h-6 w-6 text-primary" />
            <span>IQRA LMS</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/features" className="hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/about" className="hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/pricing" className="hover:text-foreground transition-colors">
              Pricing & Access
            </Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild size="sm">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/pricing">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Marketing Content */}
      <main className="flex-1">{children}</main>

      {/* Marketing Footer */}
      <footer className="border-t bg-muted/30 py-12 text-sm text-muted-foreground">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-bold text-base text-foreground">
                <BookOpen className="h-5 w-5 text-primary" />
                <span>IQRA LMS</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Dedicated learning management platform engineered specifically for Quranic academies, teachers, students, and parents.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-3 text-xs uppercase tracking-wider">Product</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing & Access</Link></li>
                <li><Link href="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-3 text-xs uppercase tracking-wider">Experiences</h4>
              <ul className="space-y-2 text-xs">
                <li><span className="text-muted-foreground">Academy Owners & Admins</span></li>
                <li><span className="text-muted-foreground">Teachers & Instructors</span></li>
                <li><span className="text-muted-foreground">Students & Parents</span></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-3 text-xs uppercase tracking-wider">Support</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact Support</Link></li>
                <li><Link href="/login" className="hover:text-foreground transition-colors">Account Login</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} IQRA LMS. All rights reserved. Built with reverence for Quranic scholarship.
          </div>
        </div>
      </footer>
    </div>
  );
}
