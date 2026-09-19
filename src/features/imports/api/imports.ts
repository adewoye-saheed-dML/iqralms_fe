import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

export type ImportJobResponse = components['schemas']['ImportJobResponse'];
export type ImportJobValidate = components['schemas']['ImportJobValidate'];
export type KindEnum = components['schemas']['KindEnum'];

export const importsApi = {
  validateImport: async (
    organizationId: number,
    file: File,
    kind: KindEnum,
    columnMapping?: Record<string, string>
  ): Promise<ImportJobResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('kind', kind);
    if (columnMapping) {
      formData.append('column_mapping', JSON.stringify(columnMapping));
    }

    // openapi-fetch accepts FormData for multipart/form-data
    const { data } = await apiClient.POST('/api/imports/organizations/{organization_pk}/validate/', {
      params: { path: { organization_pk: organizationId } },
      body: formData as unknown as ImportJobValidate,
    });
    if (!data) {
      throw new Error('Failed to validate import file');
    }
    return data;
  },

  commitImport: async (organizationId: number, jobId: number): Promise<ImportJobResponse> => {
    const { data } = await apiClient.POST('/api/imports/organizations/{organization_pk}/{id}/commit/', {
      params: { path: { organization_pk: organizationId, id: jobId } },
    });
    if (!data) {
      throw new Error('Failed to commit import job');
    }
    return data;
  },
};
