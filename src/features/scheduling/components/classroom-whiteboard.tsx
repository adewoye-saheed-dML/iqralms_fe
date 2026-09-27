'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  PenTool,
  Eraser,
  RotateCcw,
  Trash2,
  Download,
  Square,
  Sparkles,
  Maximize2,
} from 'lucide-react';

type Tool = 'pen' | 'eraser';
type Template = 'blank' | 'ruled' | 'makharij';

const COLORS = [
  { name: 'Black', value: '#1e293b' },
  { name: 'Red', value: '#dc2626' },
  { name: 'Green', value: '#16a34a' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'Gold', value: '#d97706' },
  { name: 'Purple', value: '#9333ea' },
];

const STROKE_WIDTHS = [
  { label: 'Fine', value: 2 },
  { label: 'Medium', value: 5 },
  { label: 'Thick', value: 10 },
];

export function ClassroomWhiteboard() {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [tool, setTool] = React.useState<Tool>('pen');
  const [color, setColor] = React.useState('#1e293b');
  const [strokeWidth, setStrokeWidth] = React.useState(5);
  const [template, setTemplate] = React.useState<Template>('blank');
  const [history, setHistory] = React.useState<ImageData[]>([]);

  // Draw background template on canvas
  const drawTemplate = React.useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, tmpl: Template) => {
      // Clear base
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      if (tmpl === 'ruled') {
        // Draw 3-line Arabic calligraphy grid
        const lineSpacing = 70;
        const startY = 60;
        ctx.save();
        for (let y = startY; y < height - 40; y += lineSpacing) {
          // Top line (ascenders like Alif, Laam)
          ctx.beginPath();
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.moveTo(30, y);
          ctx.lineTo(width - 30, y);
          ctx.stroke();

          // Main baseline (solid blue line)
          ctx.beginPath();
          ctx.strokeStyle = '#93c5fd';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([]);
          ctx.moveTo(30, y + 25);
          ctx.lineTo(width - 30, y + 25);
          ctx.stroke();

          // Bottom line (descenders like Raa, Zay, Waw, Meem)
          ctx.beginPath();
          ctx.strokeStyle = '#fecaca';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.moveTo(30, y + 45);
          ctx.lineTo(width - 30, y + 45);
          ctx.stroke();
        }
        ctx.restore();
      } else if (tmpl === 'makharij') {
        // Draw Tajweed Vocal Tract Guide schematic
        ctx.save();
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;

        // Outline head & vocal tract silhouette
        ctx.beginPath();
        // Nose & Upper lip
        ctx.moveTo(width * 0.15, height * 0.25);
        ctx.lineTo(width * 0.28, height * 0.25);
        ctx.quadraticCurveTo(width * 0.32, height * 0.35, width * 0.3, height * 0.42); // Upper lip
        // Lower lip & chin
        ctx.moveTo(width * 0.3, height * 0.48);
        ctx.quadraticCurveTo(width * 0.33, height * 0.55, width * 0.24, height * 0.65); // Chin
        ctx.stroke();

        // Oral cavity & Palate
        ctx.beginPath();
        ctx.strokeStyle = '#94a3b8';
        ctx.moveTo(width * 0.32, height * 0.42);
        ctx.quadraticCurveTo(width * 0.48, height * 0.36, width * 0.6, height * 0.45); // Hard & Soft palate
        ctx.lineTo(width * 0.62, height * 0.85); // Back of throat
        ctx.stroke();

        // Tongue
        ctx.beginPath();
        ctx.fillStyle = '#fee2e2';
        ctx.strokeStyle = '#f87171';
        ctx.lineWidth = 2;
        ctx.moveTo(width * 0.34, height * 0.52); // Tip
        ctx.quadraticCurveTo(width * 0.46, height * 0.46, width * 0.55, height * 0.58); // Dorsum
        ctx.lineTo(width * 0.54, height * 0.75); // Root
        ctx.lineTo(width * 0.38, height * 0.75);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Labels
        ctx.fillStyle = '#475569';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('1. Al-Jawf (Open Oral Cavity)', width * 0.35, height * 0.22);
        ctx.fillText('2. Al-Halq (The Throat - ء هـ ع ح غ خ)', width * 0.64, height * 0.65);
        ctx.fillText('3. Al-Lisan (The Tongue - 18 Letters)', width * 0.38, height * 0.66);
        ctx.fillText('4. Ash-Shafatayn (Lips - ب م و ف)', width * 0.12, height * 0.46);
        ctx.fillText('5. Al-Khayshum (Nose - Ghunnah)', width * 0.22, height * 0.16);

        ctx.restore();
      }
    },
    []
  );

  // Initialize canvas
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions based on client bounding rect
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    drawTemplate(ctx, canvas.width, canvas.height, template);
    const initialSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initialSnapshot]);
  }, [template, drawTemplate]);

  // Handle Resize
  React.useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const rect = canvas.getBoundingClientRect();
      const prevData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = rect.width;
      canvas.height = rect.height;
      drawTemplate(ctx, canvas.width, canvas.height, template);
      try {
        ctx.putImageData(prevData, 0, 0);
      } catch {
        // Ignore mismatch on first load
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [template, drawTemplate]);

  const saveHistoryState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-15), snapshot]);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = tool === 'eraser' ? strokeWidth * 3 : strokeWidth;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveHistoryState();
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = history.slice(0, -1);
    const previousState = newHistory[newHistory.length - 1];
    if (previousState) {
      ctx.putImageData(previousState, 0, 0);
      setHistory(newHistory);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawTemplate(ctx, canvas.width, canvas.height, template);
    saveHistoryState();
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `whiteboard-notes-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <Card className="h-full flex flex-col border shadow-sm bg-card overflow-hidden">
      <CardHeader className="py-2.5 px-4 border-b bg-muted/30">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <PenTool className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold">Interactive Whiteboard</CardTitle>
            <Badge variant="outline" className="text-xs capitalize">
              {template}
            </Badge>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={history.length <= 1}
              className="h-7 px-2 text-xs"
              title="Undo last stroke"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Undo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
              title="Clear entire board"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="h-7 px-2 text-xs"
              title="Download whiteboard image"
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Drawing Toolbar */}
      <div className="p-2 border-b bg-background flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Tool selector */}
        <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-md">
          <Button
            type="button"
            variant={tool === 'pen' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTool('pen')}
            className="h-7 px-2.5 text-xs"
          >
            <PenTool className="h-3 w-3 mr-1" /> Pen
          </Button>
          <Button
            type="button"
            variant={tool === 'eraser' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTool('eraser')}
            className="h-7 px-2.5 text-xs"
          >
            <Eraser className="h-3 w-3 mr-1" /> Eraser
          </Button>
        </div>

        {/* Color palette */}
        {tool === 'pen' && (
          <div className="flex items-center gap-1.5">
            {COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                style={{ backgroundColor: c.value }}
                className={`h-5 w-5 rounded-full transition-transform ${
                  color === c.value ? 'scale-125 ring-2 ring-primary ring-offset-1' : 'opacity-80 hover:opacity-100'
                }`}
                title={c.name}
              />
            ))}
          </div>
        )}

        {/* Stroke width */}
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground mr-1 text-[11px]">Size:</span>
          {STROKE_WIDTHS.map((s) => (
            <Button
              key={s.value}
              type="button"
              variant={strokeWidth === s.value ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setStrokeWidth(s.value)}
              className="h-6 px-2 text-[11px]"
            >
              {s.label}
            </Button>
          ))}
        </div>

        {/* Template choices */}
        <div className="flex items-center gap-1 bg-muted/20 p-0.5 rounded-md">
          <Button
            type="button"
            variant={template === 'blank' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setTemplate('blank')}
            className="h-6 px-2 text-[11px]"
          >
            Blank
          </Button>
          <Button
            type="button"
            variant={template === 'ruled' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setTemplate('ruled')}
            className="h-6 px-2 text-[11px]"
          >
            Ruled Lines
          </Button>
          <Button
            type="button"
            variant={template === 'makharij' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setTemplate('makharij')}
            className="h-6 px-2 text-[11px]"
          >
            <Sparkles className="h-2.5 w-2.5 mr-1" />
            Makharij Guide
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative bg-white overflow-hidden cursor-crosshair min-h-[360px]">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full block touch-none"
        />
      </div>
    </Card>
  );
}
