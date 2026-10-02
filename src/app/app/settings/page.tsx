'use client';

import * as React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAcademy } from '@/lib/academy/academy-provider';
import { useAuth } from '@/lib/auth/auth-provider';
import { can } from '@/lib/permissions/capabilities';
import {
  useAcademyBranding,
  COLOR_PRESETS,
  DEFAULT_PRIMARY_COLOR,
} from '@/lib/academy/academy-branding';
import {
  Info,
  Building2,
  Palette,
  Upload,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const { activeAcademy, activeRole } = useAcademy();
  const { branding, saveBranding, resetBranding } = useAcademyBranding(
    activeAcademy?.id,
    activeAcademy?.name
  );

  const canManage = can('manage_academy', {
    activeRole,
    userRole: user?.role,
  });

  const [selectedColor, setSelectedColor] = React.useState<string>(
    branding?.primaryColor || DEFAULT_PRIMARY_COLOR
  );
  const [logoPreview, setLogoPreview] = React.useState<string | null>(
    branding?.logoUrl || null
  );
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (branding) {
      if (branding.primaryColor) setSelectedColor(branding.primaryColor);
      if (branding.logoUrl !== undefined) setLogoPreview(branding.logoUrl);
    }
  }, [branding]);

  if (!activeAcademy) {
    return null;
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('File size must be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setLogoPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBranding = () => {
    setErrorMsg(null);
    saveBranding({
      primaryColor: selectedColor,
      logoUrl: logoPreview,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const handleResetToDefault = () => {
    resetBranding();
    setSelectedColor(DEFAULT_PRIMARY_COLOR);
    setLogoPreview(null);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader
        title="Academy Settings & Customization"
        description={`Manage ${activeAcademy.name} branding, custom academy icon, theme colors, and institution profile.`}
      />

      {saveSuccess && (
        <Alert className="border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <AlertTitle className="font-semibold text-xs">Branding Updated</AlertTitle>
          <AlertDescription className="text-xs mt-0.5">
            Your academy icon, browser tab wording, and display colors have been saved and applied across all dashboards.
          </AlertDescription>
        </Alert>
      )}

      {errorMsg && (
        <Alert variant="destructive">
          <AlertTitle>Upload Error</AlertTitle>
          <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
        </Alert>
      )}

      {/* Academy Branding & Visual Identity Section */}
      <Card className="border shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <CardTitle>Branding &amp; Visual Customization</CardTitle>
            </div>
            {canManage && (
              <Badge variant="outline" className="text-xs">
                Owner / Admin Controls
              </Badge>
            )}
          </div>
          <CardDescription>
            Personalize your academy’s presence. Upload an institution icon and choose your academy display color to reflect your unique identity on all student, parent, and teacher screens.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Logo / Icon Upload Sub-Section */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Academy Icon / Logo</Label>
            <p className="text-xs text-muted-foreground">
              Displays as the primary brand emblem on the sidebar, top navigation, and browser tab. When uploaded, the custom icon displays on its own without the text name for maximum visual clarity and prominence.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-xl bg-muted/20">
              {/* Preview Avatar */}
              <div className="relative group shrink-0">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Academy Logo Preview"
                    className="h-20 w-auto min-w-[80px] max-w-[220px] max-h-20 rounded-xl object-contain border bg-background p-2 shadow-sm"
                  />
                ) : (
                  <div
                    className="h-20 w-20 rounded-xl flex items-center justify-center font-bold text-2xl text-white shadow-sm"
                    style={{ backgroundColor: selectedColor }}
                  >
                    {activeAcademy.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {canManage ? (
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Label
                      htmlFor="academy-logo-input"
                      className="cursor-pointer inline-flex items-center justify-center rounded-md text-xs font-medium border bg-background hover:bg-muted h-8 px-3 transition-colors shadow-2xs gap-1.5"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload Academy Icon</span>
                    </Label>
                    <input
                      id="academy-logo-input"
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="sr-only"
                      onChange={handleFileUpload}
                    />

                    {logoPreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-destructive hover:bg-destructive/10"
                        onClick={() => setLogoPreview(null)}
                      >
                        Remove Icon
                      </Button>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Recommended: Square PNG, SVG, or JPG (512x512px). Max 2MB.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Institution branding is configured by academy owners and administrators.
                </p>
              )}
            </div>
          </div>

          {/* Theme Display Color Customization Sub-Section */}
          <div className="space-y-3 pt-4 border-t">
            <Label className="text-sm font-semibold">Academy Display Color</Label>
            <p className="text-xs text-muted-foreground">
              Sets the primary accent and brand tone used across buttons, navigation highlights, badges, and learning widgets.
            </p>

            {canManage ? (
              <div className="space-y-4">
                {/* Palette Preset Swatches */}
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
                  {COLOR_PRESETS.map((preset) => {
                    const isSelected = selectedColor.toLowerCase() === preset.hex.toLowerCase();
                    return (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => setSelectedColor(preset.hex)}
                        className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'border-primary ring-2 ring-primary/40 bg-muted/60 shadow-2xs font-semibold'
                            : 'hover:bg-muted/30 border-transparent hover:border-border'
                        }`}
                        title={preset.name}
                      >
                        <span
                          className="h-6 w-6 rounded-full shadow-inner flex items-center justify-center text-white"
                          style={{ backgroundColor: preset.hex }}
                        >
                          {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </span>
                        <span className="text-[10px] text-muted-foreground leading-tight truncate w-full">
                          {preset.name}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Color Picker & Hex Input */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className="flex items-center gap-2 border rounded-lg p-1 bg-background">
                    <input
                      type="color"
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="h-7 w-7 rounded cursor-pointer border-0 bg-transparent"
                      title="Pick custom hex color"
                    />
                    <Input
                      type="text"
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="h-7 w-24 text-xs font-mono border-0 focus-visible:ring-0 px-1"
                      placeholder="#044b36"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Custom hex code for institution identity
                  </span>
                </div>

                {/* Live Component Preview */}
                <div className="p-4 border rounded-xl bg-muted/10 space-y-2.5">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Live Component Preview
                  </span>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-2xs"
                      style={{ backgroundColor: selectedColor }}
                    >
                      Primary Action Button
                    </button>
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-medium border"
                      style={{
                        backgroundColor: `${selectedColor}15`,
                        color: selectedColor,
                        borderColor: `${selectedColor}40`,
                      }}
                    >
                      Active Session Badge
                    </span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: selectedColor }}
                    >
                      {activeAcademy.name} Portal
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span
                  className="h-6 w-6 rounded-full shadow-inner"
                  style={{ backgroundColor: selectedColor }}
                />
                <span className="text-xs text-muted-foreground font-mono">
                  {selectedColor}
                </span>
              </div>
            )}
          </div>
        </CardContent>

        {canManage && (
          <CardFooter className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t bg-muted/10">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={handleResetToDefault}
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset to Default Theme
            </Button>

            <Button
              type="button"
              size="sm"
              className="text-xs px-4"
              style={{ backgroundColor: selectedColor }}
              onClick={handleSaveBranding}
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Save Branding Changes
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Organization Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle>Organization Registration Details</CardTitle>
          </div>
          <CardDescription>
            System configuration parameters for {activeAcademy.name}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-blue-200 bg-blue-50/50 text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
            <Info className="h-4 w-4" />
            <AlertTitle className="font-semibold text-xs">Organization Profile</AlertTitle>
            <AlertDescription className="text-xs mt-0.5">
              Core parameters are set during institution registration. Contact system administration to change your institution name or subdomain slug.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs">Academy Name</Label>
              <Input id="name" readOnly value={activeAcademy.name} className="bg-muted text-xs" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="slug" className="text-xs">Slug / Web Identifier</Label>
              <Input id="slug" readOnly value={activeAcademy.slug} className="bg-muted text-xs" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="timezone" className="text-xs">Institution Timezone</Label>
              <Input id="timezone" readOnly value={activeAcademy.timezone} className="bg-muted text-xs" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="id" className="text-xs">Tenant Organization ID</Label>
              <Input id="id" readOnly value={String(activeAcademy.id)} className="bg-muted text-xs" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
