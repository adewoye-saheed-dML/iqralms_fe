'use client';

import * as React from 'react';
import { Mail, MapPin, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ContactPage() {
  const [submitted, setSubmitted] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    institution: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Contact IQRA LMS Support
        </h1>
        <p className="text-muted-foreground text-lg">
          Have inquiries regarding institutional onboarding, technical setup, or platform features? Our team is here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
        {/* Contact Info */}
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-3">Institutional Support</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We assist Islamic schools, community madrasahs, and independent Quran teachers in digitizing their academic records and teaching operations.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Direct Support</h4>
                <p className="text-xs text-muted-foreground">support@iqralms.org</p>
                <p className="text-xs text-muted-foreground mt-0.5">Response within 24 hours</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Operations</h4>
                <p className="text-xs text-muted-foreground">Global Islamic Education Technology</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-muted/40 p-6 text-xs text-muted-foreground space-y-2">
            <div className="font-semibold text-foreground">Teacher or Student Invitation?</div>
            <p>
              If an academy administrator invited you to teach or attend classes, please check your email inbox for your direct invitation link or visit the invitation acceptance page.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle>Send an Inquiry</CardTitle>
            <CardDescription>Fill out the form below and an academy specialist will respond.</CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <Alert className="border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <AlertTitle className="font-semibold">Message Received</AlertTitle>
                <AlertDescription className="text-xs mt-1">
                  Thank you for reaching out. We have logged your request and our institutional onboarding team will contact you shortly.
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    required
                    placeholder="e.g. Ustadh Ahmad"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="ahmad@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="institution">Academy / Institution Name</Label>
                  <Input
                    id="institution"
                    placeholder="e.g. Darul Quran Academy"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    required
                    rows={4}
                    placeholder="Tell us about your academy size, curriculum tracks, and requirements..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
