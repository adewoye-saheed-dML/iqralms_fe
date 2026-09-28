import { apiClient } from '@/lib/api/client';

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
    const endpoint = `/api/curriculum/organizations/${organizationId}/materials/${qs ? `?${qs}` : ''}`;
    
    const response = await fetch(endpoint, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to load materials: ${response.status} ${errorBody}`);
    }

    return response.json();
  },

  getMaterial: async (organizationId: number, materialId: number): Promise<LearningMaterial> => {
    const endpoint = `/api/curriculum/organizations/${organizationId}/materials/${materialId}/`;
    const response = await fetch(endpoint, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to load material #${materialId}`);
    }

    return response.json();
  },

  createMaterial: async (organizationId: number, input: LearningMaterialInput): Promise<LearningMaterial> => {
    const endpoint = `/api/curriculum/organizations/${organizationId}/materials/`;
    
    let body: BodyInit;
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

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
      headers['Content-Type'] = 'application/json';
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

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to create material: ${response.status} ${errorBody}`);
    }

    return response.json();
  },

  updateMaterial: async (
    organizationId: number,
    materialId: number,
    input: Partial<LearningMaterialInput>
  ): Promise<LearningMaterial> => {
    const endpoint = `/api/curriculum/organizations/${organizationId}/materials/${materialId}/`;
    
    let body: BodyInit;
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

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
      headers['Content-Type'] = 'application/json';
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

    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers,
      body,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to update material: ${response.status} ${errorBody}`);
    }

    return response.json();
  },

  deleteMaterial: async (organizationId: number, materialId: number): Promise<void> => {
    const endpoint = `/api/curriculum/organizations/${organizationId}/materials/${materialId}/`;
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete material #${materialId}`);
    }
  },
};
