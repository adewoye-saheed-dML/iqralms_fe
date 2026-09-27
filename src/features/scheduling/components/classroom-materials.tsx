'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { QuranText } from '@/components/ui/quran-text';
import { ArabicText } from '@/components/ui/arabic-text';
import { BookOpen, Search, ZoomIn, ZoomOut, CheckCircle, Sparkles, HelpCircle } from 'lucide-react';

interface SurahData {
  number: number;
  nameArabic: string;
  nameEnglish: string;
  englishTranslation: string;
  revelationType: 'Meccan' | 'Medinan';
  ayahsCount: number;
  verses: { number: number; text: string; translation?: string }[];
}

// Sample authentic Qur'anic selections frequently taught in classes
const POPULAR_SURAHS: SurahData[] = [
  {
    number: 1,
    nameArabic: 'الفاتحة',
    nameEnglish: 'Al-Fatihah',
    englishTranslation: 'The Opening',
    revelationType: 'Meccan',
    ayahsCount: 7,
    verses: [
      { number: 1, text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.' },
      { number: 2, text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', translation: '[All] praise is [due] to Allah, Lord of the worlds.' },
      { number: 3, text: 'الرَّحْمَٰنِ الرَّحِيمِ', translation: 'The Entirely Merciful, the Especially Merciful,' },
      { number: 4, text: 'مَالِكِ يَوْمِ الدِّينِ', translation: 'Sovereign of the Day of Recompense.' },
      { number: 5, text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', translation: 'It is You we worship and You we ask for help.' },
      { number: 6, text: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', translation: 'Guide us to the straight path -' },
      { number: 7, text: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', translation: 'The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.' },
    ],
  },
  {
    number: 112,
    nameArabic: 'الإخلاص',
    nameEnglish: 'Al-Ikhlas',
    englishTranslation: 'The Sincerity',
    revelationType: 'Meccan',
    ayahsCount: 4,
    verses: [
      { number: 1, text: 'قُلْ هُوَ اللَّهُ أَحَدٌ', translation: 'Say, "He is Allah, [who is] One,' },
      { number: 2, text: 'اللَّهُ الصَّمَدُ', translation: 'Allah, the Eternal Refuge.' },
      { number: 3, text: 'لَمْ يَلِدْ وَلَمْ يُولَدْ', translation: 'He neither begets nor is born,' },
      { number: 4, text: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ', translation: 'Nor is there to Him any equivalent."' },
    ],
  },
  {
    number: 113,
    nameArabic: 'الفلق',
    nameEnglish: 'Al-Falaq',
    englishTranslation: 'The Daybreak',
    revelationType: 'Meccan',
    ayahsCount: 5,
    verses: [
      { number: 1, text: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ', translation: 'Say, "I seek refuge in the Lord of daybreak' },
      { number: 2, text: 'مِن شَرِّ مَا خَلَقَ', translation: 'From the evil of that which He created' },
      { number: 3, text: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ', translation: 'And from the evil of darkness when it settles' },
      { number: 4, text: 'وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ', translation: 'And from the evil of the blowers in knots' },
      { number: 5, text: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ', translation: 'And from the evil of an envier when he envies."' },
    ],
  },
  {
    number: 114,
    nameArabic: 'الناس',
    nameEnglish: 'An-Nas',
    englishTranslation: 'Mankind',
    revelationType: 'Meccan',
    ayahsCount: 6,
    verses: [
      { number: 1, text: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ', translation: 'Say, "I seek refuge in the Lord of mankind,' },
      { number: 2, text: 'مَلِكِ النَّاسِ', translation: 'The Sovereign of mankind,' },
      { number: 3, text: 'إِلَٰهِ النَّاسِ', translation: 'The God of mankind,' },
      { number: 4, text: 'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ', translation: 'From the evil of the retreating whisperer -' },
      { number: 5, text: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ', translation: 'Who whispers [evil] into the breasts of mankind -' },
      { number: 6, text: 'مِنَ الْجِنَّةِ وَالنَّاسِ', translation: 'From among the jinn and mankind."' },
    ],
  },
  {
    number: 108,
    nameArabic: 'الكوثر',
    nameEnglish: 'Al-Kawthar',
    englishTranslation: 'Abundance',
    revelationType: 'Meccan',
    ayahsCount: 3,
    verses: [
      { number: 1, text: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ', translation: 'Indeed, We have granted you, [O Muhammad], al-Kawthar.' },
      { number: 2, text: 'فَصَلِّ لِرَبِّكَ وَانْحَرْ', translation: 'So pray to your Lord and offer sacrifice [to Him alone].' },
      { number: 3, text: 'إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ', translation: 'Indeed, your enemy is the one cut off.' },
    ],
  },
  {
    number: 103,
    nameArabic: 'العصر',
    nameEnglish: 'Al-Asr',
    englishTranslation: 'The Declining Day',
    revelationType: 'Meccan',
    ayahsCount: 3,
    verses: [
      { number: 1, text: 'وَالْعَصْرِ', translation: 'By time,' },
      { number: 2, text: 'إِنَّ الْإِنسَانَ لَفِي خُسْرٍ', translation: 'Indeed, mankind is in loss,' },
      { number: 3, text: 'إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ', translation: 'Except for those who have believed and done righteous deeds and advised each other to truth and advised each other to patience.' },
    ],
  },
  {
    number: 67,
    nameArabic: 'الملك',
    nameEnglish: 'Al-Mulk',
    englishTranslation: 'The Sovereignty',
    revelationType: 'Meccan',
    ayahsCount: 30,
    verses: [
      { number: 1, text: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ', translation: 'Blessed is He in whose hand is dominion, and He is over all things competent -' },
      { number: 2, text: 'الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا وَهُوَ الْعَزِيزُ الْغَفُورُ', translation: '[He] who created death and life to test you [as to] which of you is best in deed - and He is the Exalted in Might, the Forgiving -' },
      { number: 3, text: 'الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا مَّا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ فَارْجِعِ الْبَصَرَ هَلْ تَرَىٰ مِن فُطُورٍ', translation: '[And] who created seven heavens in layers. You do not see in the creation of the Most Merciful any inconsistency...' },
    ],
  },
];

const TAJWEED_MAKHARIJ = [
  {
    area: 'Al-Jawf (الجَوْف)',
    description: 'The open space inside the throat and mouth',
    letters: ['ا (Alif madd)', 'و (Waw madd)', 'ي (Ya madd)'],
    notes: 'Produces the elongated vowels with breath without constriction.',
  },
  {
    area: 'Al-Halq (الحَلْق)',
    description: 'The Throat (3 distinct levels)',
    letters: [
      'Aqsa (Deepest): ء (Hamzah), هـ (Haa)',
      'Wasat (Middle): ع (Ayn), ح (Haa)',
      'Adna (Closest): غ (Ghayn), خ (Khaa)',
    ],
    notes: 'Key rule: Izhar Halqi occurs when Noon Sakinah/Tanween is followed by these 6 letters.',
  },
  {
    area: 'Al-Lisan (اللِّسَان)',
    description: 'The Tongue (10 articulation points)',
    letters: [
      'Back of tongue: ق (Qaf), ك (Kaf)',
      'Center of tongue: ج (Jeem), ش (Sheen), ي (Yaa)',
      'Sides of tongue: ض (Dad), ل (Lam)',
      'Tip of tongue: ن (Noon), ر (Raa), ط (Taa), د (Dal), ت (Taa)',
      'Tip with incisors: ص (Saad), ز (Zay), س (Seen)',
      'Tip with upper teeth edges: ظ (Dhaa), ذ (Dhal), ث (Thaa)',
    ],
    notes: 'Qalqalah applies to (ق, ط, ب, ج, د) when sukoon occurs.',
  },
  {
    area: 'Ash-Shafatayn (الشَّفَتَان)',
    description: 'The Two Lips',
    letters: ['ف (Faa - upper teeth with lower lip)', 'ب (Baa), م (Meem), و (Waw)'],
    notes: 'Baa & Meem close the lips; Waw rounds the lips.',
  },
  {
    area: 'Al-Khayshum (الخَيْشُوم)',
    description: 'The Nasal Cavity',
    letters: ['Ghunnah (غُنَّة)'],
    notes: 'A pleasant nasal resonance lasting 2 counts, essential in Noon & Meem Mushaddad, Idgham with Ghunnah, and Ikhfa.',
  },
];

interface ClassroomMaterialsProps {
  levelName?: string;
  trackName?: string;
}

export function ClassroomMaterials({ levelName, trackName }: ClassroomMaterialsProps) {
  const [selectedSurahIndex, setSelectedSurahIndex] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [fontSizeClass, setFontSizeClass] = React.useState<'text-xl' | 'text-2xl' | 'text-3xl' | 'text-4xl'>('text-2xl');
  const [activeVerseHighlight, setActiveVerseHighlight] = React.useState<number | null>(null);

  const [activeTab, setActiveTab] = React.useState<'quran' | 'tajweed' | 'syllabus'>('quran');

  const filteredSurahs = React.useMemo(() => {
    if (!searchQuery.trim()) return POPULAR_SURAHS;
    const q = searchQuery.toLowerCase();
    return POPULAR_SURAHS.filter(
      (s) =>
        s.nameEnglish.toLowerCase().includes(q) ||
        s.nameArabic.includes(q) ||
        s.englishTranslation.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const currentSurah = filteredSurahs[selectedSurahIndex] || POPULAR_SURAHS[0];

  const increaseFontSize = () => {
    if (fontSizeClass === 'text-xl') setFontSizeClass('text-2xl');
    else if (fontSizeClass === 'text-2xl') setFontSizeClass('text-3xl');
    else if (fontSizeClass === 'text-3xl') setFontSizeClass('text-4xl');
  };

  const decreaseFontSize = () => {
    if (fontSizeClass === 'text-4xl') setFontSizeClass('text-3xl');
    else if (fontSizeClass === 'text-3xl') setFontSizeClass('text-2xl');
    else if (fontSizeClass === 'text-2xl') setFontSizeClass('text-xl');
  };

  return (
    <Card className="h-full flex flex-col border shadow-sm bg-card overflow-hidden">
      <CardHeader className="py-3 px-4 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold">Learning Materials & Reader</CardTitle>
          </div>
          {levelName && (
            <Badge variant="outline" className="text-xs bg-background">
              {trackName ? `${trackName} • ` : ''}{levelName}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="flex-1 flex flex-col h-full">
          <div className="px-3 pt-2 border-b bg-muted/10">
            <TabsList className="grid grid-cols-3 w-full h-8 text-xs">
              <TabsTrigger value="quran" onClick={() => setActiveTab('quran')} className="text-xs py-1">Quran Reader</TabsTrigger>
              <TabsTrigger value="tajweed" onClick={() => setActiveTab('tajweed')} className="text-xs py-1">Tajweed & Makharij</TabsTrigger>
              <TabsTrigger value="syllabus" onClick={() => setActiveTab('syllabus')} className="text-xs py-1">Level Goals</TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: QURAN READER */}
          <TabsContent value="quran" className="flex-1 flex flex-col m-0 p-0 overflow-hidden">
            {/* Toolbar */}
            <div className="p-2 border-b flex flex-wrap items-center justify-between gap-2 bg-background">
              <div className="flex items-center gap-1.5 flex-1 min-w-[180px]">
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedSurahIndex(0);
                  }}
                  placeholder="Find Surah..."
                  className="h-7 text-xs"
                />
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={decreaseFontSize}
                  title="Smaller Font"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={increaseFontSize}
                  title="Larger Font"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Surah Quick Chips */}
            <div className="flex gap-1.5 p-2 overflow-x-auto border-b bg-muted/10 text-xs no-scrollbar">
              {filteredSurahs.map((surah, idx) => (
                <button
                  key={surah.number}
                  type="button"
                  onClick={() => setSelectedSurahIndex(idx)}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors text-xs font-medium ${
                    currentSurah.number === surah.number
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-muted/70 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {surah.number}. {surah.nameEnglish} ({surah.nameArabic})
                </button>
              ))}
            </div>

            {/* Surah Verses Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="text-center pb-3 border-b">
                <ArabicText className="text-2xl font-bold text-primary">
                  سُورَةُ {currentSurah.nameArabic}
                </ArabicText>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Surah {currentSurah.nameEnglish} ({currentSurah.englishTranslation}) • {currentSurah.revelationType} • {currentSurah.ayahsCount} Ayahs
                </p>
                {currentSurah.number !== 9 && currentSurah.number !== 1 && (
                  <ArabicText className="text-lg text-muted-foreground mt-2">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </ArabicText>
                )}
              </div>

              <div className="space-y-4 divide-y divide-border/40">
                {currentSurah.verses.map((verse) => {
                  const isHighlighted = activeVerseHighlight === verse.number;
                  return (
                    <div
                      key={verse.number}
                      onClick={() => setActiveVerseHighlight(isHighlighted ? null : verse.number)}
                      className={`pt-3 first:pt-0 cursor-pointer rounded-lg p-2 transition-colors ${
                        isHighlighted ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <span className="flex items-center justify-center h-6 w-6 rounded-full border border-primary/40 text-[11px] font-semibold text-primary shrink-0">
                          {verse.number}
                        </span>
                        <QuranText className={`${fontSizeClass} text-foreground leading-loose`}>
                          {verse.text} ۝{verse.number}
                        </QuranText>
                      </div>
                      {verse.translation && (
                        <p className="text-xs text-muted-foreground mt-1 pl-8">
                          {verse.translation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: TAJWEED & MAKHARIJ */}
          <TabsContent value="tajweed" className="flex-1 overflow-y-auto p-3 space-y-3 m-0">
            <div className="bg-primary/5 border border-primary/20 rounded-md p-2.5 text-xs text-primary">
              <span className="font-semibold flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                Tajweed & Makharij Reference for Teaching
              </span>
              <p className="text-muted-foreground mt-0.5">
                Use these articulation targets to guide student pronunciation, tongue placement, and rule application.
              </p>
            </div>

            <div className="space-y-2.5">
              {TAJWEED_MAKHARIJ.map((makhraj, i) => (
                <div key={i} className="border rounded-md p-3 bg-card space-y-1.5 text-xs shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground text-sm">{makhraj.area}</span>
                    <Badge variant="secondary" className="text-[10px]">Articulation Point</Badge>
                  </div>
                  <p className="text-muted-foreground">{makhraj.description}</p>
                  <div className="bg-muted/30 p-2 rounded text-xs font-arabic space-y-1">
                    {makhraj.letters.map((lettr, lIdx) => (
                      <div key={lIdx} className="text-primary font-medium">{lettr}</div>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground italic">Note: {makhraj.notes}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* TAB 3: LEVEL SYLLABUS & GOALS */}
          <TabsContent value="syllabus" className="flex-1 overflow-y-auto p-4 space-y-3 m-0">
            <div className="border rounded-lg p-3 bg-card space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                Current Lesson Objectives
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
                <li>Demonstrate accurate Makharij for throat and tongue letters.</li>
                <li>Apply Noon Sakinah & Tanween rules without pausing mid-word.</li>
                <li>Recite assigned Surah portions with consistent rhythmic pace (Tarteel).</li>
                <li>Recognize Waqf (stopping signs) and sustain Madd length correctly.</li>
              </ul>
            </div>

            <div className="border rounded-lg p-3 bg-muted/20 space-y-2 text-xs">
              <h4 className="font-medium text-foreground flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                Teaching Screen-Sharing Tip
              </h4>
              <p className="text-muted-foreground">
                To share these materials with the student, select <strong>Share Screen</strong> in the video classroom and choose this browser window or tab. The font zoom controls will keep Arabic glyphs legible for the student on any screen size.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
