'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { materialsApi, type LearningMaterial, type LearningMaterialInput, type MaterialType } from '../api/materials';
import { curriculumApi, type TrackBrief, type Level } from '../api/curriculum';
import { curriculumKeys } from '@/lib/api/query-keys';
import { can } from '@/lib/permissions/capabilities';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BookOpen,
  FileText,
  Plus,
  Search,
  ExternalLink,
  Download,
  Trash2,
  Edit2,
  FileCode,
  Image as ImageIcon,
  Headphones,
  Link as LinkIcon,
  Layers,
  Filter,
  Eye,
  CheckCircle2,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

const MATERIAL_TYPES: { value: MaterialType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'pdf', label: 'PDF Document', icon: FileText },
  { value: 'book', label: 'E-Book / Textbook', icon: BookOpen },
  { value: 'worksheet', label: 'Worksheet / Exercise', icon: FileCode },
  { value: 'image', label: 'Image / Infographic', icon: ImageIcon },
  { value: 'audio', label: 'Audio Recording', icon: Headphones },
  { value: 'link', label: 'Web Link / Embed', icon: LinkIcon },
  { value: 'text', label: 'Study Text / Ayah Notes', icon: Sparkles },
];

interface LearningMaterialsManagerProps {
  initialTrackId?: number;
  hideHeader?: boolean;
}

export function LearningMaterialsManager({ initialTrackId, hideHeader = false }: LearningMaterialsManagerProps = {}) {
  const { activeAcademy, activeRole } = useAcademy();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedTrackId, setSelectedTrackId] = React.useState<string>(initialTrackId ? String(initialTrackId) : 'all');
  const [selectedLevelId, setSelectedLevelId] = React.useState<string>('all');
  const [selectedType, setSelectedType] = React.useState<string>('all');

  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);
  const [editingMaterial, setEditingMaterial] = React.useState<LearningMaterial | null>(null);
  const [previewMaterial, setPreviewMaterial] = React.useState<LearningMaterial | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [successNotice, setSuccessNotice] = React.useState<string | null>(null);

  // Form State
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [materialType, setMaterialType] = React.useState<MaterialType>('pdf');
  const [formTrackId, setFormTrackId] = React.useState<string>(initialTrackId ? String(initialTrackId) : 'none');
  const [formLevelId, setFormLevelId] = React.useState<string>('none');
  const [externalUrl, setExternalUrl] = React.useState('');
  const [contentText, setContentText] = React.useState('');
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isActive, setIsActive] = React.useState(true);

  const canManage = can('manage_curriculum', { activeRole }) || activeRole === 'teacher';

  // Fetch Tracks
  const { data: tracks = [] } = useQuery<TrackBrief[]>({
    queryKey: curriculumKeys.tracks(activeAcademy?.id),
    queryFn: () => curriculumApi.getTracks(activeAcademy!.id),
    enabled: !!activeAcademy,
  });

  // Fetch Levels for selected track in form
  const parsedFormTrackId = formTrackId !== 'none' ? Number(formTrackId) : undefined;
  const { data: formLevels = [] } = useQuery<Level[]>({
    queryKey: ['curriculum', 'levels', activeAcademy?.id, parsedFormTrackId],
    queryFn: () => curriculumApi.getLevels(activeAcademy!.id, parsedFormTrackId),
    enabled: !!activeAcademy && parsedFormTrackId !== undefined,
  });

  // Fetch All Materials
  const {
    data: materials = [],
    isLoading,
    refetch,
  } = useQuery<LearningMaterial[]>({
    queryKey: ['curriculum', 'materials', activeAcademy?.id],
    queryFn: () => materialsApi.getMaterials(activeAcademy!.id),
    enabled: !!activeAcademy,
  });

  // Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: async (payload: LearningMaterialInput) => {
      return materialsApi.createMaterial(activeAcademy!.id, payload);
    },
    onSuccess: () => {
      setSuccessNotice('Learning material uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['curriculum', 'materials', activeAcademy?.id] });
      closeModal();
      setTimeout(() => setSuccessNotice(null), 4000);
    },
    onError: (err: any) => {
      setFormError(err.message || 'Failed to upload material');
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<LearningMaterialInput> }) => {
      return materialsApi.updateMaterial(activeAcademy!.id, id, payload);
    },
    onSuccess: () => {
      setSuccessNotice('Material updated successfully');
      queryClient.invalidateQueries({ queryKey: ['curriculum', 'materials', activeAcademy?.id] });
      closeModal();
      setTimeout(() => setSuccessNotice(null), 4000);
    },
    onError: (err: any) => {
      setFormError(err.message || 'Failed to update material');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return materialsApi.deleteMaterial(activeAcademy!.id, id);
    },
    onSuccess: () => {
      setSuccessNotice('Material deleted');
      queryClient.invalidateQueries({ queryKey: ['curriculum', 'materials', activeAcademy?.id] });
      setTimeout(() => setSuccessNotice(null), 4000);
    },
    onError: (err: any) => {
      setSuccessNotice(null);
      alert(err.message || 'Failed to delete material');
    },
  });

  const closeModal = () => {
    setIsUploadModalOpen(false);
    setEditingMaterial(null);
    setTitle('');
    setDescription('');
    setMaterialType('pdf');
    setFormTrackId('none');
    setFormLevelId('none');
    setExternalUrl('');
    setContentText('');
    setSelectedFile(null);
    setIsActive(true);
    setFormError(null);
  };

  const handleOpenEdit = (material: LearningMaterial) => {
    setEditingMaterial(material);
    setTitle(material.title);
    setDescription(material.description || '');
    setMaterialType(material.material_type);
    setFormTrackId(material.track ? String(material.track) : 'none');
    setFormLevelId(material.level ? String(material.level) : 'none');
    setExternalUrl(material.external_url || '');
    setContentText(material.content_text || '');
    setIsActive(material.is_active);
    setSelectedFile(null);
    setFormError(null);
    setIsUploadModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!title.trim()) {
      setFormError('Please provide a title');
      return;
    }

    const payload: LearningMaterialInput = {
      title: title.trim(),
      description: description.trim(),
      material_type: materialType,
      track: formTrackId !== 'none' ? Number(formTrackId) : null,
      level: formLevelId !== 'none' ? Number(formLevelId) : null,
      external_url: externalUrl.trim(),
      content_text: contentText.trim(),
      is_active: isActive,
      file: selectedFile,
    };

    if (editingMaterial) {
      updateMutation.mutate({ id: editingMaterial.id, payload });
    } else {
      uploadMutation.mutate(payload);
    }
  };

  // Filtered materials
  const filteredMaterials = React.useMemo(() => {
    return materials.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        const matchesTrack = item.track_name?.toLowerCase().includes(q);
        const matchesLevel = item.level_name?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesTrack && !matchesLevel) return false;
      }

      if (selectedTrackId !== 'all') {
        if (selectedTrackId === 'general' && item.track !== null) return false;
        if (selectedTrackId !== 'general' && item.track !== Number(selectedTrackId)) return false;
      }

      if (selectedLevelId !== 'all') {
        if (item.level !== Number(selectedLevelId)) return false;
      }

      if (selectedType !== 'all') {
        if (item.material_type !== selectedType) return false;
      }

      return true;
    });
  }, [materials, searchQuery, selectedTrackId, selectedLevelId, selectedType]);

  const getTypeIcon = (type: MaterialType) => {
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
    <div className="space-y-6">
      {/* Success Notice */}
      {successNotice && (
        <Alert className="bg-emerald-50 border-emerald-200 text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <AlertDescription>{successNotice}</AlertDescription>
        </Alert>
      )}

      {/* Header and Quick Stats */}
      {!hideHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Curriculum Books & Learning Materials</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Upload and organize authentic syllabus texts, PDF workbooks, and resources for teachers and students across all tracks.
            </p>
          </div>

          {canManage && (
            <Button onClick={() => setIsUploadModalOpen(true)} className="gap-2 shrink-0">
              <Plus className="h-4 w-4" />
              Upload New Material
            </Button>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="shadow-2xs">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search materials by title, track, keywords..."
                className="pl-9 text-sm"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select value={selectedTrackId} onValueChange={setSelectedTrackId}>
                <SelectTrigger className="w-[180px] text-xs h-9">
                  <SelectValue placeholder="All Subjects/Tracks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tracks & Subjects</SelectItem>
                  <SelectItem value="general">Academy-Wide (No Track)</SelectItem>
                  {tracks.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[150px] text-xs h-9">
                  <SelectValue placeholder="All Resource Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All File Types</SelectItem>
                  {MATERIAL_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Materials Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading learning materials...</div>
      ) : filteredMaterials.length === 0 ? (
        <Card className="border-dashed py-12 text-center shadow-none">
          <CardContent className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold">No learning materials found</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
                {searchQuery || selectedTrackId !== 'all' || selectedType !== 'all'
                  ? 'No materials matched your filter criteria. Try adjusting the search query or filters.'
                  : 'Start by uploading books, PDFs, reading sheets, or worksheets for your teachers and students.'}
              </p>
            </div>
            {canManage && (
              <Button onClick={() => setIsUploadModalOpen(true)} variant="outline" size="sm" className="gap-1.5 mt-2">
                <Plus className="h-4 w-4" />
                Upload First Material
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map((material) => (
            <Card key={material.id} className="flex flex-col border shadow-2xs hover:shadow-xs transition-shadow">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-muted/60">
                      {getTypeIcon(material.material_type)}
                    </div>
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {material.material_type}
                    </Badge>
                  </div>
                  {material.is_active ? (
                    <Badge variant="secondary" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground">
                      Draft / Inactive
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-base font-semibold mt-2 line-clamp-1" title={material.title}>
                  {material.title}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-2 mt-1">
                  {material.description || 'No additional description provided.'}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 pt-2 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Layers className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {material.track_name ? (
                        <>
                          <strong className="text-foreground">{material.track_name}</strong>
                          {material.level_name ? ` • ${material.level_name}` : ' (All Levels)'}
                        </>
                      ) : (
                        <span className="italic">Academy-wide (All Tracks)</span>
                      )}
                    </span>
                  </div>

                  {material.uploaded_by_name && (
                    <p className="text-[11px] text-muted-foreground">
                      Uploaded by {material.uploaded_by_name}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {material.file_url ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs gap-1.5"
                        onClick={() => window.open(material.file_url!, '_blank')}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Open File
                      </Button>
                    ) : material.external_url ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs gap-1.5"
                        onClick={() => window.open(material.external_url, '_blank')}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open Link
                      </Button>
                    ) : material.content_text ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs gap-1.5"
                        onClick={() => setPreviewMaterial(material)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Read Text
                      </Button>
                    ) : null}
                  </div>

                  {canManage && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleOpenEdit(material)}
                        title="Edit Material"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${material.title}"?`)) {
                            deleteMutation.mutate(material.id);
                          }
                        }}
                        title="Delete Material"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload / Edit Dialog */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMaterial ? 'Edit Learning Material' : 'Upload Learning Material / Book'}</DialogTitle>
            <DialogDescription>
              Provide materials for teachers and students. These materials will appear directly in the virtual classroom and student portal.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {formError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="mat-title">Title *</Label>
              <Input
                id="mat-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Noorani Qaida (Complete Book), Tajweed Rules Handbook"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="mat-type">Material Type *</Label>
                <Select value={materialType} onValueChange={(val) => setMaterialType(val as MaterialType)}>
                  <SelectTrigger id="mat-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MATERIAL_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        <div className="flex items-center gap-2">
                          <t.icon className="h-3.5 w-3.5" />
                          <span>{t.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mat-track">Target Subject / Track</Label>
                <Select
                  value={formTrackId}
                  onValueChange={(val) => {
                    setFormTrackId(val);
                    setFormLevelId('none');
                  }}
                >
                  <SelectTrigger id="mat-track">
                    <SelectValue placeholder="Select Track..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Academy-wide (General)</SelectItem>
                    {tracks.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formTrackId !== 'none' && formLevels.length > 0 && (
              <div className="space-y-1.5">
                <Label htmlFor="mat-level">Specific Level (Optional)</Label>
                <Select value={formLevelId} onValueChange={setFormLevelId}>
                  <SelectTrigger id="mat-level">
                    <SelectValue placeholder="All levels of this track" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All Levels in {tracks.find((t) => String(t.id) === formTrackId)?.name}</SelectItem>
                    {formLevels.map((lvl) => (
                      <SelectItem key={lvl.id} value={String(lvl.id)}>
                        Level {lvl.order}: {lvl.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* File Upload or External Resource */}
            {materialType === 'link' ? (
              <div className="space-y-1.5">
                <Label htmlFor="mat-link">External URL or Resource Link *</Label>
                <Input
                  id="mat-link"
                  type="url"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://quran.com/... or https://drive.google.com/..."
                  required
                />
              </div>
            ) : materialType === 'text' ? (
              <div className="space-y-1.5">
                <Label htmlFor="mat-text">Passage / Ayah Text / Lesson Notes *</Label>
                <Textarea
                  id="mat-text"
                  value={contentText}
                  onChange={(e) => setContentText(e.target.value)}
                  placeholder="Enter Arabic text, tajweed study points, or lesson notes here..."
                  rows={6}
                  className="font-arabic text-sm"
                  required
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="mat-file">
                  Upload File ({materialType.toUpperCase()}) {editingMaterial ? '(Leave blank to keep existing)' : '*'}
                </Label>
                <Input
                  id="mat-file"
                  type="file"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setSelectedFile(f);
                  }}
                  accept={
                    materialType === 'pdf'
                      ? '.pdf'
                      : materialType === 'image'
                      ? 'image/*'
                      : materialType === 'audio'
                      ? 'audio/*'
                      : '.pdf,.doc,.docx,.epub,.txt'
                  }
                  required={!editingMaterial && !selectedFile}
                />
                {editingMaterial?.file_url && (
                  <p className="text-[11px] text-muted-foreground">
                    Current file:{' '}
                    <a href={editingMaterial.file_url} target="_blank" rel="noreferrer" className="text-primary underline">
                      View current attachment
                    </a>
                  </p>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="mat-desc">Description & Usage Guidelines</Label>
              <Textarea
                id="mat-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Guidelines for how teachers and students should use this material during lessons..."
                rows={3}
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={uploadMutation.isPending || updateMutation.isPending}>
                {uploadMutation.isPending || updateMutation.isPending ? 'Saving...' : editingMaterial ? 'Save Changes' : 'Upload Material'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Text Preview Modal */}
      {previewMaterial && (
        <Dialog open={!!previewMaterial} onOpenChange={() => setPreviewMaterial(null)}>
          <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                {previewMaterial.title}
              </DialogTitle>
              {previewMaterial.track_name && (
                <DialogDescription>
                  {previewMaterial.track_name} {previewMaterial.level_name ? `• ${previewMaterial.level_name}` : ''}
                </DialogDescription>
              )}
            </DialogHeader>
            <div className="p-4 rounded-lg bg-muted/30 whitespace-pre-wrap leading-relaxed font-arabic text-base border">
              {previewMaterial.content_text}
            </div>
            {previewMaterial.description && (
              <p className="text-xs text-muted-foreground italic">{previewMaterial.description}</p>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
