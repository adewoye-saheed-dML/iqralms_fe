import Link from 'next/link';
import { Target, HeartHandshake, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
          About IQRA LMS
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Dedicated software for Quranic educational institutions
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          IQRA LMS is engineered to eliminate operational friction from Quran academies, enabling scholars and teachers to focus on preserving and transmitting the Book of Allah.
        </p>
      </div>

      {/* Core Mission */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card>
          <CardHeader>
            <Target className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Structured Pedagogy</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            Quranic learning requires methodical progression—from letter recognition to rules of Tajweed, through Juz&apos; memorization and revision (Muraja&apos;ah). Our platform structures these tracks into measurable, verifiable levels.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <HeartHandshake className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Connected Community</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            Students learn best when supported by both qualified instructors and involved parents. We bridge communication with transparent progress reports, assessment feedback, and scheduling clarity.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <ShieldCheck className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Academic Integrity</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground leading-relaxed">
            Tenancy boundaries, audit trails, and strict role segregation ensure student records, assessment scores, and institutional operations remain secure, private, and accountable.
          </CardContent>
        </Card>
      </div>

      {/* Narrative Section */}
      <div className="max-w-4xl mx-auto space-y-6 text-muted-foreground leading-relaxed border-t pt-12">
        <h2 className="text-2xl font-bold text-foreground">Why we built IQRA LMS</h2>
        <p>
          Traditional learning management systems are designed for university lecture halls or corporate compliance courses. They fail to address the unique needs of Quran academies: tracking memorized verses, assessing recitation accuracy (Makharij and Sifaat), managing 1-on-1 recitation circles, and calculating teacher compensation by teaching hours.
        </p>
        <p>
          IQRA LMS was designed from the ground up to support these exact Islamic educational workflows, giving academy administrators the tools they need to run modern, professional, and spiritually grounded madrasahs.
        </p>

        <div className="pt-6 flex gap-4">
          <Button asChild>
            <Link href="/features">Explore Features</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/contact">Get in Touch</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
