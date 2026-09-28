import { getToken } from '@/lib/auth/token';
import { ApiError, normalizeErrorMessage } from '@/lib/api/errors';

export type MaterialType = 'pdf' | 'book' | 'worksheet' | 'image' | 'audio' | 'link' | 'text';

export interface LearningMaterial {
  id: number;
  organization: number;
  track: number | null;
  track_name: string | null;
  level: number | null;
  level_name: string | null;
  level_order: number | null;
  title: string;
  description: string;
  material_type: MaterialType;
  file: string | null;
  file_url: string | null;
  external_url: string;
  content_text: string;
  is_active: boolean;
  uploaded_by: number | null;
  uploaded_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface LearningMaterialInput {
  title: string;
  description?: string;
  material_type: MaterialType;
  track?: number | null;
  level?: number | null;
  file?: File | null;
  external_url?: string;
  content_text?: string;
  is_active?: boolean;
}

function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:8000');
  return url.replace(/\/+$/, '');
}

export function resolveMaterialFileUrl(url: string | null): string | null {
  if (!url) return null;
  const baseUrl = getApiBaseUrl();
  const token = getToken();
  let fullUrl = url.startsWith('http://') || url.startsWith('https://')
    ? url
    : `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;

  if (token) {
    try {
      const parsed = new URL(fullUrl, baseUrl || 'http://127.0.0.1:8000');
      parsed.searchParams.set('token', token);
      fullUrl = parsed.toString();
    } catch {
      const separator = fullUrl.includes('?') ? '&' : '?';
      fullUrl = `${fullUrl}${separator}token=${encodeURIComponent(token)}`;
    }
  }
  return fullUrl;
}

export async function openMaterialFile(url: string | null): Promise<void> {
  if (!url || typeof window === 'undefined') return;
  const token = getToken();
  const targetUrl = resolveMaterialFileUrl(url) || url;

  if (token) {
    try {
      const headers: Record<string, string> = {
        Authorization: `Token ${token}`,
      };
      const response = await fetch(targetUrl, { headers });
      if (response.ok) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const newWindow = window.open(blobUrl, '_blank');
        if (newWindow) {
          return;
        }
        const a = document.createElement('a');
        a.href = blobUrl;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }
    } catch {
      // Fall through to direct window.open
    }
  }

  window.open(targetUrl, '_blank');
}

function formatMaterial(item: any): LearningMaterial {
  return {
    ...item,
    file_url: resolveMaterialFileUrl(item.file_url),
  };
}

async function requestJson(url: string, init?: RequestInit): Promise<any> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(init?.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Token ${token}`;
  }

  const response = await fetch(url, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let data: unknown;
    try {
      data = await response.clone().json();
    } catch {
      try {
        data = await response.clone().text();
      } catch {
        data = undefined;
      }
    }
    const message = normalizeErrorMessage(response.status, data, response.statusText);
    throw new ApiError(response.status, message, data);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const materialsApi = {
  getMaterials: async (
    organizationId: number,
    params?: {
      track_id?: number;
      level_id?: number;
      material_type?: string;
      include_general?: boolean;
      is_active?: boolean;
    }
  ): Promise<LearningMaterial[]> => {
    const searchParams = new URLSearchParams();
    if (params?.track_id !== undefined) searchParams.append('track_id', String(params.track_id));
    if (params?.level_id !== undefined) searchParams.append('level_id', String(params.level_id));
    if (params?.material_type) searchParams.append('material_type', params.material_type);
    if (params?.include_general !== undefined) searchParams.append('include_general', String(params.include_general));
    if (params?.is_active !== undefined) searchParams.append('is_active', String(params.is_active));

    const qs = searchParams.toString();
    const endpoint = `${getApiBaseUrl()}/api/curriculum/organizations/${organizationId}/materials/${qs ? `?${qs}` : ''}`;
    
    const data = await requestJson(endpoint);
    return Array.isArray(data) ? data.map(formatMaterial) : [];
  },

  getMaterial: async (organizationId: number, materialId: number): Promise<LearningMaterial> => {
    const endpoint = `${getApiBaseUrl()}/api/curriculum/organizations/${organizationId}/materials/${materialId}/`;
    const data = await requestJson(endpoint);
    return formatMaterial(data);
  },

  createMaterial: async (organizationId: number, input: LearningMaterialInput): Promise<LearningMaterial> => {
    const endpoint = `${getApiBaseUrl()}/api/curriculum/organizations/${organizationId}/materials/`;
    
    let body: BodyInit;
    const customHeaders: Record<string, string> = {};

    if (input.file) {
      const formData = new FormData();
      formData.append('title', input.title);
      if (input.description) formData.append('description', input.description);
      formData.append('material_type', input.material_type);
      if (input.track) formData.append('track', String(input.track));
      if (input.level) formData.append('level', String(input.level));
      if (input.external_url) formData.append('external_url', input.external_url);
      if (input.content_text) formData.append('content_text', input.content_text);
      if (input.is_active !== undefined) formData.append('is_active', String(input.is_active));
      formData.append('file', input.file);
      body = formData;
    } else {
      customHeaders['Content-Type'] = 'application/json';
      body = JSON.stringify({
        title: input.title,
        description: input.description ?? '',
        material_type: input.material_type,
        track: input.track ?? null,
        level: input.level ?? null,
        external_url: input.external_url ?? '',
        content_text: input.content_text ?? '',
        is_active: input.is_active ?? true,
      });
    }

    const data = await requestJson(endpoint, {
      method: 'POST',
      headers: customHeaders,
      body,
    });

    return formatMaterial(data);
  },

  updateMaterial: async (
    organizationId: number,
    materialId: number,
    input: Partial<LearningMaterialInput>
  ): Promise<LearningMaterial> => {
    const endpoint = `${getApiBaseUrl()}/api/curriculum/organizations/${organizationId}/materials/${materialId}/`;
    
    let body: BodyInit;
    const customHeaders: Record<string, string> = {};

    if (input.file) {
      const formData = new FormData();
      if (input.title !== undefined) formData.append('title', input.title);
      if (input.description !== undefined) formData.append('description', input.description);
      if (input.material_type !== undefined) formData.append('material_type', input.material_type);
      if (input.track !== undefined) formData.append('track', input.track ? String(input.track) : '');
      if (input.level !== undefined) formData.append('level', input.level ? String(input.level) : '');
      if (input.external_url !== undefined) formData.append('external_url', input.external_url);
      if (input.content_text !== undefined) formData.append('content_text', input.content_text);
      if (input.is_active !== undefined) formData.append('is_active', String(input.is_active));
      formData.append('file', input.file);
      body = formData;
    } else {
      customHeaders['Content-Type'] = 'application/json';
      const payload: Record<string, any> = {};
      if (input.title !== undefined) payload.title = input.title;
      if (input.description !== undefined) payload.description = input.description;
      if (input.material_type !== undefined) payload.material_type = input.material_type;
      if (input.track !== undefined) payload.track = input.track;
      if (input.level !== undefined) payload.level = input.level;
      if (input.external_url !== undefined) payload.external_url = input.external_url;
      if (input.content_text !== undefined) payload.content_text = input.content_text;
      if (input.is_active !== undefined) payload.is_active = input.is_active;
      body = JSON.stringify(payload);
    }

    const data = await requestJson(endpoint, {
      method: 'PATCH',
      headers: customHeaders,
      body,
    });

    return formatMaterial(data);
  },

  deleteMaterial: async (organizationId: number, materialId: number): Promise<void> => {
    const endpoint = `${getApiBaseUrl()}/api/curriculum/organizations/${organizationId}/materials/${materialId}/`;
    await requestJson(endpoint, {
      method: 'DELETE',
    });
  },
};
