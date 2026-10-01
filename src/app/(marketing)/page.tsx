import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  Award,
  ArrowRight,
  BookOpen,
  Languages,
  Compass,
  Video,
  ShieldCheck,
  CheckCircle2,
  Users,
  Mic,
  Star,
  Sparkles,
  Heart,
  Quote,
  BookMarked,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
  return (
    <div className="space-y-20 sm:space-y-28 pb-20 bg-[#FAFAFA] dark:bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-border/60 bg-gradient-to-b from-emerald-50/40 via-background to-background dark:from-emerald-950/20 dark:via-background dark:to-background">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Spiritual Opening Banner */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 dark:border-emerald-800 bg-white dark:bg-card px-4 py-1.5 text-xs font-medium text-emerald-900 dark:text-emerald-300 shadow-2xs mb-6">
            <span className="font-arabic text-sm text-emerald-700 dark:text-emerald-400">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</span>
            <span className="text-border mx-1">•</span>
            <span>A Dedicated Platform for Qur&apos;an &amp; Islamic Learning</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="mx-auto max-w-4xl text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground text-balance leading-tight sm:leading-tight">
            A Sacred Space for Qur&apos;an &amp; Islamic Learning, <br className="hidden sm:inline" />
            <span className="text-emerald-700 dark:text-emerald-400">Built for Every Madrasah &amp; Family</span>
          </h1>

          {/* Subheading in Natural, Non-AI English */}
          <p className="mx-auto mt-6 max-w-3xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            Streamline your Quran &amp; Islamic Studies Academy with structured learning &amp; operations. From a child&apos;s first Noorani Qaida and heartfelt Tajweed recitation, to complete Qur&apos;an memorization (Hifz), classical Arabic, Hadith, and essential Fiqh—iqralms brings teachers, students, and parents together in one calm, blessed educational sanctuary.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap justify-center items-center gap-4">
            <Button asChild size="lg" className="gap-2 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white shadow-sm px-7 text-sm font-semibold rounded-xl">
              <Link href="/pricing">
                View Pricing &amp; Access <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="rounded-xl px-7 text-sm font-medium border-border/80 hover:bg-muted">
              <Link href="/login">Sign In to Academy</Link>
            </Button>
          </div>

          {/* Community Trust Line */}
          <div className="mt-8 flex items-center justify-center gap-3 text-xs text-muted-foreground">
            <div className="flex -space-x-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border-2 border-background">U</span>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold border-2 border-background">Y</span>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold border-2 border-background">F</span>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-200 text-emerald-900 text-[11px] font-bold border-2 border-background">M</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-current" />
                ))}
              </div>
              <span className="font-medium text-foreground">Trusted by educators &amp; Muslim families worldwide</span>
            </div>
          </div>

          {/* Hero Visual: Centerpiece Showcase with Prominent iqralms Brand Mark */}
          <div className="mt-12 mx-auto max-w-4xl">
            <div className="relative rounded-2xl border border-border/80 bg-white dark:bg-card p-6 sm:p-10 shadow-md text-left">
              {/* Subtle Islamic corner decoration */}
              <div className="absolute top-3 right-3 text-emerald-600/10 dark:text-emerald-400/10 select-none font-arabic text-6xl">
                ۞
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-border/60">
                <div className="flex items-center gap-5">
                  <Image
                    src="/images/iqralms-icon-transparent.png"
                    alt="iqralms emblem"
                    width={90}
                    height={82}
                    className="h-16 sm:h-20 w-auto object-contain drop-shadow-sm shrink-0"
                    priority
                  />
                  <div>
                    <div className="flex items-center gap-3">
                      <Image
                        src="/images/iqralms-brand-transparent.png"
                        alt="iqralms"
                        width={210}
                        height={58}
                        className="h-9 sm:h-11 w-auto object-contain dark:brightness-110"
                        priority
                      />
                      <Badge variant="outline" className="hidden sm:inline-flex text-[11px] text-emerald-800 dark:text-emerald-300 border-emerald-300/80 bg-emerald-50 dark:bg-emerald-950/60 font-semibold px-2.5 py-0.5">
                        Madrasah Operating System
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5 max-w-lg">
                      Dedicated infrastructure for traditional madrasahs, community Quran schools, and online Islamic institutes.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Multi-Tenant
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border">
                    <ShieldCheck className="h-3 w-3" /> Private Academy
                  </span>
                </div>
              </div>

              {/* Pillars Highlight Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
                <div className="p-3.5 rounded-xl bg-[#FAFAFA] dark:bg-muted/40 border border-border/60 hover:border-emerald-500/40 transition">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-xs mb-1">
                    <BookOpen className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Noble Qur&apos;an &amp; Hifz</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Sabaq, Sabqi, Manzil &amp; Tajweed</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAFAFA] dark:bg-muted/40 border border-border/60 hover:border-emerald-500/40 transition">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-xs mb-1">
                    <Languages className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Arabic Literacy</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Qaida, Reading &amp; Quranic Arabic</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAFAFA] dark:bg-muted/40 border border-border/60 hover:border-emerald-500/40 transition">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-xs mb-1">
                    <Compass className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Islamic Studies</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Seerah, Hadith, Fiqh &amp; Adhkar</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAFAFA] dark:bg-muted/40 border border-border/60 hover:border-emerald-500/40 transition">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-xs mb-1">
                    <Video className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Virtual Halaqah</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">1-on-1 and cohort recitation rooms</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Islamic Pedagogy: The 4 Core Disciplines */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-block py-1.5 px-4 mb-4 text-center rounded-full border border-emerald-200/80 dark:border-emerald-800 bg-white dark:bg-card shadow-2xs">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              Sacred Curriculum
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Rooted in the Qur&apos;an. Dedicated to the Deen.
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg leading-relaxed">
            True Islamic education weaves the Book of Allah together with sound understanding, pure character (Tarbiyyah), and the language of Divine Revelation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="rounded-2xl border-border/80 bg-white dark:bg-card p-2 hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col justify-between">
            <CardHeader className="space-y-3 pb-3">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/60 dark:border-emerald-800 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />
              </div>
              <CardTitle className="text-lg font-bold text-foreground">Qur&apos;an Recitation &amp; Hifz</CardTitle>
              <CardDescription className="text-xs text-muted-foreground leading-relaxed">
                Nurture steady memorizers with structured daily Sabaq (new lesson), Sabqi (recent review), and Manzil (cumulative retention), evaluated through clear oral Tajweed rubrics.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-xs text-muted-foreground border-t border-border/50 mt-4 pt-3">
              <span className="font-semibold text-foreground">Covers:</span> Tilawah fluency, Makharij articulation, rules of Noon/Meem Sakinah, and Muraja&apos;ah tracking.
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/80 bg-white dark:bg-card p-2 hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col justify-between">
            <CardHeader className="space-y-3 pb-3">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/60 dark:border-emerald-800 flex items-center justify-center">
                <Languages className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />
              </div>
              <CardTitle className="text-lg font-bold text-foreground">Arabic Literacy &amp; Language</CardTitle>
              <CardDescription className="text-xs text-muted-foreground leading-relaxed">
                Open the language in which the Qur&apos;an was revealed. Progress gently from Noorani Qaida phonetics and letter recognition to Quranic vocabulary and fundamental grammar.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-xs text-muted-foreground border-t border-border/50 mt-4 pt-3">
              <span className="font-semibold text-foreground">Covers:</span> Beginner Qaida, connecting letters, Harakat, Tanween, Nahw basics, and vocabulary.
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/80 bg-white dark:bg-card p-2 hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col justify-between">
            <CardHeader className="space-y-3 pb-3">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/60 dark:border-emerald-800 flex items-center justify-center">
                <Compass className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />
              </div>
              <CardTitle className="text-lg font-bold text-foreground">Islamic Studies &amp; Seerah</CardTitle>
              <CardDescription className="text-xs text-muted-foreground leading-relaxed">
                Build firm faith and practical knowledge. Structured tracks cover the radiant Seerah of the Prophet Muhammad ﷺ, authentic Hadith, and essential beliefs (Aqeedah).
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-xs text-muted-foreground border-t border-border/50 mt-4 pt-3">
              <span className="font-semibold text-foreground">Covers:</span> 40 Hadith of Imam Nawawi, Stories of the Prophets, and core articles of Iman.
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/80 bg-white dark:bg-card p-2 hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col justify-between">
            <CardHeader className="space-y-3 pb-3">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/60 dark:border-emerald-800 flex items-center justify-center">
                <Heart className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />
              </div>
              <CardTitle className="text-lg font-bold text-foreground">Fiqh of Worship &amp; Tarbiyyah</CardTitle>
              <CardDescription className="text-xs text-muted-foreground leading-relaxed">
                Knowledge shines brightest when paired with devotion. Teach the practical mechanics of Taharah, Salah, fasting, daily morning/evening Adhkar, and Islamic manners (Adab).
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 text-xs text-muted-foreground border-t border-border/50 mt-4 pt-3">
              <span className="font-semibold text-foreground">Covers:</span> Step-by-step prayer guides, Wudu, authentic Du&apos;as, and character development.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Live Halaqah Classroom Showcase */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border/80 bg-white dark:bg-card p-8 sm:p-14 shadow-sm">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-block py-1 px-4 mb-3 text-center rounded-full border border-emerald-200/80 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-xs font-medium text-emerald-800 dark:text-emerald-300">
              The Classroom Experience
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Live Virtual Halaqat That Feel Personal and Reverent
            </h2>
            <p className="mt-4 text-muted-foreground text-base">
              No scattered Zoom links, noisy distractions, or confusing passwords. Students and teachers enter their recitation circle with a single click.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3 p-6 rounded-2xl bg-[#FAFAFA] dark:bg-muted/30 border border-border/60">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-800 dark:text-emerald-300 mb-2">
                <Video className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-foreground">Private 1-on-1 &amp; Group Halaqat</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Crystal-clear audio optimized for Tajweed articulation, Ghunnah, and Madd. Teachers can listen with precision and correct pronunciations in real time.
              </p>
            </div>

            <div className="space-y-3 p-6 rounded-2xl bg-[#FAFAFA] dark:bg-muted/30 border border-border/60">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-800 dark:text-emerald-300 mb-2">
                <BookMarked className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-foreground">Digital Mushaf &amp; Books On-Screen</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Display the Holy Qur&apos;an, Noorani Qaida, or Islamic studies syllabi directly on screen during lessons. Mark verses, highlight Tajweed rules, and guide students visually.
              </p>
            </div>

            <div className="space-y-3 p-6 rounded-2xl bg-[#FAFAFA] dark:bg-muted/30 border border-border/60">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-800 dark:text-emerald-300 mb-2">
                <Mic className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg text-foreground">Audio Homework &amp; Teacher Voice Notes</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Students record and submit their assigned verses between sessions. Teachers review with timestamped audio feedback, rubric ratings, and words of encouragement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Built for Everyone in the Sacred Circle: The 4 Roles */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-block py-1.5 px-4 mb-4 text-center rounded-full border border-emerald-200/80 dark:border-emerald-800 bg-white dark:bg-card shadow-2xs">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              For Every Role
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Thoughtfully Crafted for Madrasahs, Teachers &amp; Families
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg">
            No complicated screens or technical confusion. Every user logs into a serene workspace tailored to their exact responsibilities.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-2xl border border-border/80 bg-white dark:bg-card p-6 shadow-2xs flex flex-col justify-between hover:border-emerald-500/40 transition">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-2">
                Directors &amp; Admins
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">Madrasah Governance</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Keep your institution organized with calm confidence. Manage curriculum tracks, welcome certified teachers, enroll students, set lesson caps, and oversee academy finances with complete audit security.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-border/50 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> Full Tenant Privacy
            </div>
          </div>

          <div className="rounded-2xl border border-border/80 bg-white dark:bg-card p-6 shadow-2xs flex flex-col justify-between hover:border-emerald-500/40 transition">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-2">
                Asatizah &amp; Scholars
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">Teaching &amp; Evaluation</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Dedicate your energy to teaching the Deen. Declare your weekly availability windows, meet students in 1-on-1 halaqat, grade recitation audio recordings, and view transparent hourly earnings.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-border/50 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> Reverent Teaching Tools
            </div>
          </div>

          <div className="rounded-2xl border border-border/80 bg-white dark:bg-card p-6 shadow-2xs flex flex-col justify-between hover:border-emerald-500/40 transition">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-2">
                Parents &amp; Guardians
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">Family Oversight</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Stay closely connected to your children&apos;s spiritual progress. Book lesson times that fit your family schedule, listen to teacher feedback notes, and watch their memorization and Tajweed flourish.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-border/50 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> Multi-Child Family Portal
            </div>
          </div>

          <div className="rounded-2xl border border-border/80 bg-white dark:bg-card p-6 shadow-2xs flex flex-col justify-between hover:border-emerald-500/40 transition">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-2">
                Students &amp; Seekers
              </div>
              <h3 className="text-lg font-bold mb-2 text-foreground">Active Learning</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A serene, distraction-free space to learn. Join live lessons in one tap, practice with digital syllabus texts, record recitation homework, and celebrate every completed Surah and milestone.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-border/50 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> Rewarding &amp; Focused
            </div>
          </div>
        </div>
      </section>

      {/* Community Voices / Testimonials (Like deenai.app's genuine community quotes) */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-block py-1.5 px-4 mb-4 text-center rounded-full border border-emerald-200/80 dark:border-emerald-800 bg-white dark:bg-card shadow-2xs">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              Community Voices
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Trusted by Madrasahs, Teachers &amp; Families
          </h2>
          <p className="mt-4 text-muted-foreground text-base sm:text-lg">
            See how academies and Muslim homes use iqralms to keep sacred learning structured, consistent, and inspiring.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-border/80 bg-white dark:bg-card p-6 shadow-2xs space-y-4 hover:border-emerald-500/40 transition">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm h-10 w-10 shrink-0">
                I
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">Ustadh Ibrahim Danfulani</p>
                <p className="text-muted-foreground text-xs">Madrasah Principal • Abuja, Nigeria</p>
              </div>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed italic">
              &ldquo;Managing our Hifz circles and tracking daily Sabaq used to require countless spreadsheets and WhatsApp messages. iqralms gave our madrasah a serene, organized structure where teachers and parents communicate with ease.&rdquo;
            </p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-white dark:bg-card p-6 shadow-2xs space-y-4 hover:border-emerald-500/40 transition">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-amber-700 text-white flex items-center justify-center font-bold text-sm h-10 w-10 shrink-0">
                F
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">Fatima Al-Zahra</p>
                <p className="text-muted-foreground text-xs">Mother of 3 • London, UK</p>
              </div>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed italic">
              &ldquo;I can see exactly what Surahs my children are reciting, listen to their teacher&apos;s voice feedback, and book lessons around our family schedule. It has brought so much peace and consistency to our home.&rdquo;
            </p>
          </div>

          <div className="rounded-2xl border border-border/80 bg-white dark:bg-card p-6 shadow-2xs space-y-4 hover:border-emerald-500/40 transition">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-sm h-10 w-10 shrink-0">
                T
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">Shaykh Tariq Al-Hashimi</p>
                <p className="text-muted-foreground text-xs">Tajweed &amp; Qira&apos;at Instructor • Cairo, Egypt</p>
              </div>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed italic">
              &ldquo;The audio recitation assignments and rubric evaluations allow me to give precise Makharij and Tajweed corrections to students across different countries. It feels authentic, dignified, and focused.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* The Sacred Journey Setup Workflow */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-block py-1.5 px-4 mb-4 text-center rounded-full border border-emerald-200/80 dark:border-emerald-800 bg-white dark:bg-card shadow-2xs">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              Simple Onboarding
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            A Clear, Straightforward Setup for Your Institution
          </h2>
          <p className="mt-4 text-muted-foreground text-base">
            From founding your academy to your first live halaqah session in four simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white dark:bg-card border border-border/80 shadow-2xs">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold text-base border border-emerald-200 dark:border-emerald-800 mb-4">
              1
            </div>
            <h3 className="font-bold text-base text-foreground mb-1">Found Your Academy</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Register your institution name, establish your timezone, and set up your academy profile.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white dark:bg-card border border-border/80 shadow-2xs">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold text-base border border-emerald-200 dark:border-emerald-800 mb-4">
              2
            </div>
            <h3 className="font-bold text-base text-foreground mb-1">Set Up Curricula</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Define tracks across Qur&apos;an, Arabic, and Islamic Studies with sequential, leveled learning stages.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white dark:bg-card border border-border/80 shadow-2xs">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold text-base border border-emerald-200 dark:border-emerald-800 mb-4">
              3
            </div>
            <h3 className="font-bold text-base text-foreground mb-1">Welcome Teachers</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Dispatch email invitation tokens to onboard qualified asatizah, sheikhs, and instructors securely.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white dark:bg-card border border-border/80 shadow-2xs">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold text-base border border-emerald-200 dark:border-emerald-800 mb-4">
              4
            </div>
            <h3 className="font-bold text-base text-foreground mb-1">Teach &amp; Flourish</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Enroll students, schedule 1-on-1 or group halaqat, record recitation feedback, and witness spiritual growth.
            </p>
          </div>
        </div>
      </section>

      {/* Inspiring Call to Action Section with Large Official Logo Seal */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border/80 bg-white dark:bg-card p-8 sm:p-14 text-center max-w-4xl mx-auto shadow-md space-y-6">
          <div className="flex justify-center">
            <Image
              src="/images/iqralms-seal.png"
              alt="iqralms seal"
              width={140}
              height={140}
              className="h-28 w-28 sm:h-32 sm:w-32 object-contain drop-shadow-md"
            />
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground text-balance">
            Begin Nurturing the Next Generation of Qur&apos;an Learners with iqralms
          </h2>
          
          <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Whether you run an established madrasah, a community weekend school, or an online teaching academy, iqralms gives you the tools to teach with excellence, clarity, and Barakah.
          </p>
          
          <div className="flex flex-wrap justify-center items-center gap-4 pt-2">
            <Button asChild size="lg" className="bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-xl px-8 shadow-sm">
              <Link href="/pricing">View Pricing &amp; Plans</Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="rounded-xl px-7">
              <Link href="/contact">Contact Our Team</Link>
            </Button>
          </div>
          
          <p className="text-[11px] text-muted-foreground pt-4">
            No long-term contracts. Free onboarding support for verified Islamic academies and madrasahs.
          </p>
        </div>
      </section>
    </div>
  );
}
