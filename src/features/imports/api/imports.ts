import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

export type ImportJobResponse = components['schemas']['ImportJobResponse'];
export type KindEnum = components['schemas']['KindEnum'];

export const importsApi = {
  validateImport: async (organizationId: number, file: File, kind: KindEnum, columnMapping?: any) => {
    // openapi-fetch supports multipart/form-data natively by passing the object,
    // but file must be properly typed. Or we can pass FormData.
    const formData = new FormData();
    formData.append('file', file);
    formData.append('kind', kind);
    if (columnMapping) {
      formData.append('column_mapping', JSON.stringify(columnMapping));
    }

    const { data } = await apiClient.POST('/api/imports/organizations/{organization_pk}/validate/', {
      params: { path: { organization_pk: organizationId } },
      body: formData as any, // using as any since openapi-fetch typescript might expect a specific object structure
    });
    return data as unknown as ImportJobResponse;
  },

  commitImport: async (organizationId: number, jobId: number) => {
    const { data } = await apiClient.POST('/api/imports/organizations/{organization_pk}/{id}/commit/', {
      params: { path: { organization_pk: organizationId, id: jobId } },
    });
    return data as ImportJobResponse;
  },
};
