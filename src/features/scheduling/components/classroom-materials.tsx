'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { materialsApi, resolveMaterialFileUrl, openMaterialFile, type LearningMaterial, type LearningMaterialInput, type MaterialType } from '@/features/curriculum/api/materials';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Sparkles,
  FileText,
  FileCode,
  Image as ImageIcon,
  Headphones,
  Link as LinkIcon,
  ExternalLink,
  Plus,
  ArrowLeft,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

  const [searchQuery, setSearchQuery] = React.useState('');
  const [fontSizeClass, setFontSizeClass] = React.useState<'text-base' | 'text-lg' | 'text-xl' | 'text-2xl'>('text-lg');
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

  const canUpload = activeRole === 'owner' || activeRole === 'admin';

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

  const increaseFontSize = () => {
    if (fontSizeClass === 'text-base') setFontSizeClass('text-lg');
    else if (fontSizeClass === 'text-lg') setFontSizeClass('text-xl');
    else if (fontSizeClass === 'text-xl') setFontSizeClass('text-2xl');
  };

  const decreaseFontSize = () => {
    if (fontSizeClass === 'text-2xl') setFontSizeClass('text-xl');
    else if (fontSizeClass === 'text-xl') setFontSizeClass('text-lg');
    else if (fontSizeClass === 'text-lg') setFontSizeClass('text-base');
  };

  const filteredMaterials = React.useMemo(() => {
    return liveMaterials.filter((mat) => {
      if (materialFilterType !== 'all' && mat.material_type !== materialFilterType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = mat.title.toLowerCase().includes(q);
        const matchesDesc = mat.description?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }
      return true;
    });
  }, [liveMaterials, materialFilterType, searchQuery]);

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
            <CardTitle className="text-sm font-semibold">Classroom Learning Materials</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {levelName && (
              <Badge variant="outline" className="text-xs bg-background">
                {trackName ? `${trackName} • ` : ''}{levelName}
              </Badge>
            )}
            {canUpload && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1 px-2.5"
                onClick={() => setIsUploadOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Upload File
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
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
                    onClick={() => openMaterialFile(activeViewingMaterial.file_url)}
                  >
                    <ExternalLink className="h-3 w-3" />
                    Open in New Tab
                  </Button>
                )}
                {activeViewingMaterial.content_text && (
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={decreaseFontSize} title="Smaller Font">
                      <ZoomOut className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={increaseFontSize} title="Larger Font">
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
                  <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-6 text-center space-y-3 bg-muted/10 rounded-lg border border-dashed">
                    <FileText className="h-10 w-10 text-primary" />
                    <div>
                      <h4 className="font-medium text-sm">{activeViewingMaterial.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                        PDF/Textbook documents can be opened in full resolution in a separate reader tab during the live class.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="gap-1.5"
                      onClick={() => openMaterialFile(activeViewingMaterial.file_url)}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open Full Document
                    </Button>
                  </div>
                )
              ) : activeViewingMaterial.external_url ? (
                <div className="p-6 text-center space-y-3">
                  <LinkIcon className="h-10 w-10 text-cyan-600 mx-auto" />
                  <h4 className="font-medium text-sm">{activeViewingMaterial.title}</h4>
                  <p className="text-xs text-muted-foreground">External resource link attached to this lesson.</p>
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={() => window.open(activeViewingMaterial.external_url, '_blank')}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open External Resource
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          /* Materials Catalog & Browser */
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
            {/* Filter Bar */}
            <div className="p-2.5 border-b flex flex-wrap items-center justify-between gap-2 bg-muted/20">
              <div className="flex items-center gap-1.5 flex-1 min-w-[160px]">
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter classroom books & materials..."
                  className="h-7 text-xs"
                />
              </div>

              <select
                value={materialFilterType}
                onChange={(e) => setMaterialFilterType(e.target.value)}
                className="h-7 px-2 border rounded text-xs bg-background shrink-0"
              >
                <option value="all">All File Types</option>
                <option value="book">Books / Textbooks</option>
                <option value="pdf">PDF Documents</option>
                <option value="worksheet">Worksheets</option>
                <option value="image">Images</option>
                <option value="audio">Audio</option>
                <option value="link">Links</option>
                <option value="text">Study Texts</option>
              </select>
            </div>

            {/* Materials List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {isLoadingMaterials ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  Loading learning materials for this session...
                </div>
              ) : filteredMaterials.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground space-y-2">
                  <BookOpen className="h-8 w-8 mx-auto text-muted-foreground/60" />
                  <p className="font-medium text-foreground">No classroom materials attached yet</p>
                  <p className="text-[11px] max-w-xs mx-auto">
                    {canUpload
                      ? 'Upload textbooks, PDFs, tajweed sheets, or study notes for your students using the button above.'
                      : 'Your instructor will upload reading texts and lesson worksheets here.'}
                  </p>
                  {canUpload && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 mt-2 text-xs"
                      onClick={() => setIsUploadOpen(true)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Upload Material
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {filteredMaterials.map((mat) => (
                    <div
                      key={mat.id}
                      onClick={() => setActiveViewingMaterial(mat)}
                      className="border rounded-lg p-3 bg-card hover:bg-muted/30 transition-all cursor-pointer space-y-1.5 text-xs shadow-2xs group flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 font-semibold text-foreground line-clamp-1">
                            {getMaterialIcon(mat.material_type)}
                            <span>{mat.title}</span>
                          </div>
                          <Badge variant="outline" className="text-[9px] uppercase px-1 py-0 shrink-0">
                            {mat.material_type}
                          </Badge>
                        </div>

                        {mat.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-2">{mat.description}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border/40">
                        <span>{mat.track_name ? `${mat.track_name}${mat.level_name ? ` • ${mat.level_name}` : ''}` : 'Academy-wide'}</span>
                        <span className="text-primary font-medium flex items-center gap-1 group-hover:underline">
                          <Eye className="h-3 w-3" /> View Material
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
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
                placeholder="e.g. Lesson 4 Worksheet, Tajweed Rules Book"
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
