'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { materialsApi, type LearningMaterial, type LearningMaterialInput, type MaterialType } from '@/features/curriculum/api/materials';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { QuranText } from '@/components/ui/quran-text';
import { ArabicText } from '@/components/ui/arabic-text';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  BookOpen,
  Search,
  ZoomIn,
  ZoomOut,
  CheckCircle,
  Sparkles,
  HelpCircle,
  FileText,
  FileCode,
  Image as ImageIcon,
  Headphones,
  Link as LinkIcon,
  ExternalLink,
  Plus,
  Layers,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SurahData {
  number: number;
  nameArabic: string;
  nameEnglish: string;
  englishTranslation: string;
  revelationType: 'Meccan' | 'Medinan';
  ayahsCount: number;
  verses: { number: number; text: string; translation?: string }[];
}

// Authentic Qur'anic selections frequently taught in classes
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
  organizationId?: number;
  levelName?: string;
  trackName?: string;
  trackId?: number;
  levelId?: number;
}

export function ClassroomMaterials({
  organizationId,
  levelName,
  trackName,
  trackId,
  levelId,
}: ClassroomMaterialsProps) {
  const { activeAcademy, activeRole } = useAcademy();
  const queryClient = useQueryClient();

  const orgId = organizationId ?? activeAcademy?.id;

  const [selectedSurahIndex, setSelectedSurahIndex] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [fontSizeClass, setFontSizeClass] = React.useState<'text-xl' | 'text-2xl' | 'text-3xl' | 'text-4xl'>('text-2xl');
  const [activeVerseHighlight, setActiveVerseHighlight] = React.useState<number | null>(null);

  const [activeTab, setActiveTab] = React.useState<'materials' | 'quran' | 'tajweed' | 'syllabus'>('materials');
  const [materialFilterType, setMaterialFilterType] = React.useState<string>('all');
  const [activeViewingMaterial, setActiveViewingMaterial] = React.useState<LearningMaterial | null>(null);

  // In-classroom quick upload modal
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState('');
  const [newDescription, setNewDescription] = React.useState('');
  const [newType, setNewType] = React.useState<MaterialType>('pdf');
  const [newExternalUrl, setNewExternalUrl] = React.useState('');
  const [newContentText, setNewContentText] = React.useState('');
  const [newFile, setNewFile] = React.useState<File | null>(null);

  const canUpload = activeRole === 'owner' || activeRole === 'admin' || activeRole === 'teacher';

  // Fetch live academy materials
  const { data: liveMaterials = [], isLoading: isLoadingMaterials } = useQuery<LearningMaterial[]>({
    queryKey: ['curriculum', 'materials', orgId, trackId, levelId],
    queryFn: () =>
      materialsApi.getMaterials(orgId!, {
        track_id: trackId,
        level_id: levelId,
        include_general: true,
        is_active: true,
      }),
    enabled: !!orgId,
  });

  const [uploadError, setUploadError] = React.useState<string | null>(null);

  // Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: async (payload: LearningMaterialInput) => {
      return materialsApi.createMaterial(orgId!, payload);
    },
    onSuccess: (newMaterial) => {
      queryClient.invalidateQueries({ queryKey: ['curriculum', 'materials', orgId] });
      setIsUploadOpen(false);
      setNewTitle('');
      setNewDescription('');
      setNewExternalUrl('');
      setNewContentText('');
      setNewFile(null);
      setUploadError(null);
      setActiveViewingMaterial(newMaterial);
    },
    onError: (err: any) => {
      setUploadError(err.message || 'Failed to upload material');
    },
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    if (!newTitle.trim()) {
      setUploadError('Please enter a title');
      return;
    }

    uploadMutation.mutate({
      title: newTitle.trim(),
      description: newDescription.trim(),
      material_type: newType,
      track: trackId ?? null,
      level: levelId ?? null,
      external_url: newExternalUrl.trim(),
      content_text: newContentText.trim(),
      file: newFile,
      is_active: true,
    });
  };

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

  const filteredMaterials = React.useMemo(() => {
    return liveMaterials.filter((mat) => {
      if (materialFilterType !== 'all' && mat.material_type !== materialFilterType) return false;
      return true;
    });
  }, [liveMaterials, materialFilterType]);

  const getMaterialIcon = (type: MaterialType) => {
    switch (type) {
      case 'book':
        return <BookOpen className="h-4 w-4 text-emerald-600" />;
      case 'pdf':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'worksheet':
        return <FileCode className="h-4 w-4 text-purple-600" />;
      case 'image':
        return <ImageIcon className="h-4 w-4 text-amber-600" />;
      case 'audio':
        return <Headphones className="h-4 w-4 text-rose-600" />;
      case 'link':
        return <LinkIcon className="h-4 w-4 text-cyan-600" />;
      case 'text':
        return <Sparkles className="h-4 w-4 text-indigo-600" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="h-full flex flex-col border shadow-sm bg-card overflow-hidden">
      <CardHeader className="py-2.5 px-4 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-semibold">Classroom Materials &amp; Reader</CardTitle>
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
            <TabsList className="grid grid-cols-4 w-full h-8 text-xs">
              <TabsTrigger value="materials" className="text-xs py-1">
                Books ({liveMaterials.length})
              </TabsTrigger>
              <TabsTrigger value="quran" className="text-xs py-1">Quran Reader</TabsTrigger>
              <TabsTrigger value="tajweed" className="text-xs py-1">Tajweed</TabsTrigger>
              <TabsTrigger value="syllabus" className="text-xs py-1">Level Goals</TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: ACADEMY-UPLOADED BOOKS & MATERIALS */}
          <TabsContent value="materials" className="flex-1 flex flex-col m-0 p-0 overflow-hidden">
            {activeViewingMaterial ? (
              /* Inline Material Viewer */
              <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
                <div className="p-2 border-b flex items-center justify-between bg-muted/30">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => setActiveViewingMaterial(null)}
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to All Materials
                  </Button>

                  <div className="flex items-center gap-2">
                    {activeViewingMaterial.file_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => window.open(activeViewingMaterial.file_url!, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                        Open in New Tab
                      </Button>
                    )}
                    {activeViewingMaterial.content_text && (
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={decreaseFontSize}>
                          <ZoomOut className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={increaseFontSize}>
                          <ZoomIn className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 border-b bg-card">
                  <div className="flex items-center gap-2">
                    {getMaterialIcon(activeViewingMaterial.material_type)}
                    <h3 className="text-sm font-semibold">{activeViewingMaterial.title}</h3>
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {activeViewingMaterial.material_type}
                    </Badge>
                  </div>
                  {activeViewingMaterial.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {activeViewingMaterial.description}
                    </p>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {activeViewingMaterial.content_text ? (
                    <div className={`p-4 rounded-lg bg-muted/20 border whitespace-pre-wrap leading-loose font-arabic ${fontSizeClass}`}>
                      {activeViewingMaterial.content_text}
                    </div>
                  ) : activeViewingMaterial.file_url ? (
                    activeViewingMaterial.material_type === 'image' ? (
                      <div className="flex justify-center p-2">
                        <img
                          src={activeViewingMaterial.file_url}
                          alt={activeViewingMaterial.title}
                          className="max-w-full rounded-lg shadow-sm"
                        />
                      </div>
                    ) : activeViewingMaterial.material_type === 'audio' ? (
                      <div className="p-6 text-center space-y-4">
                        <Headphones className="h-12 w-12 text-primary mx-auto" />
                        <audio controls src={activeViewingMaterial.file_url} className="w-full max-w-md mx-auto" />
                      </div>
                    ) : (
                      <iframe
                        src={activeViewingMaterial.file_url}
                        title={activeViewingMaterial.title}
                        className="w-full h-full min-h-[450px] rounded border"
                      />
                    )
                  ) : activeViewingMaterial.external_url ? (
                    <div className="p-8 text-center space-y-3">
                      <ExternalLink className="h-10 w-10 text-primary mx-auto" />
                      <p className="text-sm font-medium">External Web Resource</p>
                      <Button asChild size="sm">
                        <a href={activeViewingMaterial.external_url} target="_blank" rel="noreferrer">
                          Visit External Resource
                        </a>
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              /* Materials List */
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="p-2 border-b flex items-center justify-between gap-2 bg-background">
                  <div className="flex gap-1 overflow-x-auto no-scrollbar text-xs">
                    {['all', 'book', 'pdf', 'worksheet', 'text', 'link'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setMaterialFilterType(type)}
                        className={`px-2 py-1 rounded text-xs font-medium capitalize transition-colors ${
                          materialFilterType === type
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        {type === 'all' ? 'All' : type}
                      </button>
                    ))}
                  </div>

                  {canUpload && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1 shrink-0"
                      onClick={() => setIsUploadOpen(true)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Upload
                    </Button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                  {isLoadingMaterials ? (
                    <p className="text-xs text-center text-muted-foreground py-8">Loading materials...</p>
                  ) : filteredMaterials.length === 0 ? (
                    <div className="text-center py-10 space-y-2">
                      <BookOpen className="h-8 w-8 text-muted-foreground mx-auto" />
                      <p className="text-xs font-medium text-foreground">No academy materials found</p>
                      <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                        {canUpload
                          ? 'Click the "+ Upload" button above to attach a book, PDF, worksheet, or study notes for this class.'
                          : 'No specific materials have been uploaded by the academy for this track yet.'}
                      </p>
                      {canUpload && (
                        <Button size="sm" variant="default" className="text-xs h-8 gap-1.5 mt-2" onClick={() => setIsUploadOpen(true)}>
                          <Plus className="h-3.5 w-3.5" />
                          Upload Material
                        </Button>
                      )}
                    </div>
                  ) : (
                    filteredMaterials.map((mat) => (
                      <div
                        key={mat.id}
                        onClick={() => setActiveViewingMaterial(mat)}
                        className="p-3 rounded-lg border bg-card hover:bg-muted/40 cursor-pointer transition-colors space-y-1.5 shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {getMaterialIcon(mat.material_type)}
                            <span className="font-semibold text-xs text-foreground line-clamp-1">{mat.title}</span>
                          </div>
                          <Badge variant="outline" className="text-[10px] capitalize shrink-0">
                            {mat.material_type}
                          </Badge>
                        </div>

                        {mat.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-2">{mat.description}</p>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                          <span>{mat.track_name ? `${mat.track_name}${mat.level_name ? ` • ${mat.level_name}` : ''}` : 'Academy-wide'}</span>
                          <span className="text-primary font-medium">Click to view &rarr;</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* TAB 2: QURAN READER */}
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

          {/* TAB 3: TAJWEED & MAKHARIJ */}
          <TabsContent value="tajweed" className="flex-1 overflow-y-auto p-3 space-y-3 m-0">
            <div className="bg-primary/5 border border-primary/20 rounded-md p-2.5 text-xs text-primary">
              <span className="font-semibold flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                Tajweed &amp; Makharij Reference
              </span>
              <p className="text-muted-foreground mt-0.5">
                Targeted articulation points to guide pronunciation, tongue placement, and rule application.
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

          {/* TAB 4: LEVEL SYLLABUS & GOALS */}
          <TabsContent value="syllabus" className="flex-1 overflow-y-auto p-4 space-y-3 m-0">
            <div className="border rounded-lg p-3 bg-card space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                Current Lesson Objectives
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
                <li>Demonstrate accurate Makharij for throat and tongue letters.</li>
                <li>Apply Noon Sakinah &amp; Tanween rules without pausing mid-word.</li>
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
                To share books or surahs with the student, select <strong>Share Screen</strong> in the video classroom and choose this tab. The font zoom controls will keep Arabic glyphs legible for the student on any device.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* In-Classroom Quick Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Material to Classroom</DialogTitle>
            <DialogDescription>
              Upload a book, PDF, worksheet, or study text to use during this session.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUploadSubmit} className="space-y-3 pt-2">
            {uploadError && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{uploadError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1">
              <Label htmlFor="quick-title" className="text-xs">Title *</Label>
              <Input
                id="quick-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Lesson 4 Worksheet, Surah Reading Notes"
                className="h-8 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="quick-type" className="text-xs">Type</Label>
              <select
                id="quick-type"
                value={newType}
                onChange={(e) => setNewType(e.target.value as MaterialType)}
                className="w-full h-8 px-2 border rounded text-xs bg-background"
              >
                <option value="pdf">PDF Document</option>
                <option value="book">Book / Textbook</option>
                <option value="worksheet">Worksheet</option>
                <option value="image">Image</option>
                <option value="text">Arabic Text / Ayah Notes</option>
                <option value="link">Web Resource Link</option>
              </select>
            </div>

            {newType === 'link' ? (
              <div className="space-y-1">
                <Label htmlFor="quick-url" className="text-xs">URL *</Label>
                <Input
                  id="quick-url"
                  type="url"
                  value={newExternalUrl}
                  onChange={(e) => setNewExternalUrl(e.target.value)}
                  placeholder="https://..."
                  className="h-8 text-xs"
                  required
                />
              </div>
            ) : newType === 'text' ? (
              <div className="space-y-1">
                <Label htmlFor="quick-text" className="text-xs">Arabic Text / Notes *</Label>
                <Textarea
                  id="quick-text"
                  value={newContentText}
                  onChange={(e) => setNewContentText(e.target.value)}
                  placeholder="Enter study text here..."
                  className="font-arabic text-xs"
                  rows={4}
                  required
                />
              </div>
            ) : (
              <div className="space-y-1">
                <Label htmlFor="quick-file" className="text-xs">File *</Label>
                <Input
                  id="quick-file"
                  type="file"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setNewFile(f);
                  }}
                  className="h-8 text-xs"
                  required
                />
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="quick-desc" className="text-xs">Notes / Description</Label>
              <Input
                id="quick-desc"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Optional instructions..."
                className="h-8 text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsUploadOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={uploadMutation.isPending}>
                {uploadMutation.isPending ? 'Uploading...' : 'Save & Attach'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
