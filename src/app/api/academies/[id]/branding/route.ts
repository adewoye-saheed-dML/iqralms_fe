import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// In-memory fallback cache
const memoryBrandingStore = new Map<number, any>();

const DATA_DIR = path.join(process.cwd(), '.data', 'branding');

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Failed to create branding data directory', err);
  }
}

function getFilePath(academyId: number): string {
  return path.join(DATA_DIR, `${academyId}.json`);
}

function readStoredBranding(academyId: number) {
  if (memoryBrandingStore.has(academyId)) {
    return memoryBrandingStore.get(academyId);
  }
  try {
    const filePath = getFilePath(academyId);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      memoryBrandingStore.set(academyId, parsed);
      return parsed;
    }
  } catch (err) {
    console.error(`Failed to read branding for academy ${academyId}`, err);
  }
  return null;
}

function writeStoredBranding(academyId: number, data: any) {
  memoryBrandingStore.set(academyId, data);
  try {
    ensureDataDir();
    const filePath = getFilePath(academyId);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Failed to write branding for academy ${academyId}`, err);
  }
}

function removeStoredBranding(academyId: number) {
  memoryBrandingStore.delete(academyId);
  try {
    const filePath = getFilePath(academyId);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error(`Failed to remove branding for academy ${academyId}`, err);
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const academyId = Number(id);
  if (!academyId || isNaN(academyId)) {
    return NextResponse.json({ error: 'Invalid academy id' }, { status: 400 });
  }

  const branding = readStoredBranding(academyId);
  return NextResponse.json({ branding: branding || null });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const academyId = Number(id);
  if (!academyId || isNaN(academyId)) {
    return NextResponse.json({ error: 'Invalid academy id' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const brandingData = {
      ...body,
      academyId,
      updatedAt: new Date().toISOString(),
    };
    writeStoredBranding(academyId, brandingData);
    return NextResponse.json({ success: true, branding: brandingData });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to update academy branding' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const academyId = Number(id);
  if (!academyId || isNaN(academyId)) {
    return NextResponse.json({ error: 'Invalid academy id' }, { status: 400 });
  }

  removeStoredBranding(academyId);
  return NextResponse.json({ success: true });
}
